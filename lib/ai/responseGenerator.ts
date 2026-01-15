/**
 * AI 응답 해석 및 자연어 변환
 * TASK-904: SQL 쿼리 결과를 사용자 친화적 답변으로 변환
 */

import { getOpenAIClient, AI_MODEL } from './openai';

// 응답 생성 프롬프트
const RESPONSE_SYSTEM_PROMPT = `당신은 마케팅 데이터 분석 전문가입니다.
SQL 쿼리 결과를 사용자가 이해하기 쉬운 자연어로 설명해주세요.

규칙:
1. 결과를 간결하고 명확하게 설명합니다.
2. 숫자는 천 단위 구분자(,)를 사용합니다.
3. 금액은 '원' 단위를 붙입니다.
4. 비율(%)은 소수점 한 자리까지 표시합니다.
5. 데이터가 없으면 "해당 기간의 데이터가 없습니다."로 안내합니다.
6. 가능하면 인사이트나 간단한 해석을 추가합니다.
7. 마크다운 형식으로 응답합니다 (굵게, 목록 등 사용 가능).

예시:
- 질문: "이번 주 광고비 총액은?"
- 결과: [{ "총 광고비": 1234567 }]
- 응답: "이번 주 총 광고비는 **1,234,567원**입니다."

- 질문: "플랫폼별 ROAS는?"
- 결과: [{ "플랫폼": "naver", "ROAS": 320.5 }, { "플랫폼": "kakao", "ROAS": 280.2 }]
- 응답: "플랫폼별 ROAS는 다음과 같습니다:\n- **네이버**: 320.5%\n- **카카오**: 280.2%\n\n네이버가 가장 높은 효율을 보이고 있습니다."
`;

// 플랫폼 코드 → 한글 변환
const PLATFORM_NAMES: Record<string, string> = {
  naver: '네이버',
  kakao: '카카오',
  google: '구글',
  meta: '메타',
  coupang: '쿠팡',
};

export interface ResponseGenerationResult {
  success: boolean;
  response?: string;
  error?: string;
  chartType?: 'bar' | 'line' | 'pie' | 'table' | null;
  chartData?: Record<string, unknown>[] | null;
}

/**
 * SQL 쿼리 결과를 자연어 응답으로 변환
 */
export async function generateNaturalResponse(
  question: string,
  queryResult: Record<string, unknown>[],
  sql: string
): Promise<ResponseGenerationResult> {
  try {
    // 결과가 없는 경우
    if (!queryResult || queryResult.length === 0) {
      return {
        success: true,
        response: '해당 조건에 맞는 데이터가 없습니다. 기간이나 조건을 변경해서 다시 질문해 주세요.',
        chartType: null,
        chartData: null,
      };
    }

    const openai = getOpenAIClient();

    // 플랫폼 코드를 한글로 변환
    const processedResult = queryResult.map((row) => {
      const newRow = { ...row };
      for (const [key, value] of Object.entries(newRow)) {
        if (typeof value === 'string' && PLATFORM_NAMES[value]) {
          newRow[key] = PLATFORM_NAMES[value];
        }
      }
      return newRow;
    });

    const response = await openai.chat.completions.create({
      model: AI_MODEL,
      temperature: 0.5,
      max_tokens: 1000,
      messages: [
        { role: 'system', content: RESPONSE_SYSTEM_PROMPT },
        {
          role: 'user',
          content: `질문: ${question}\n\nSQL 쿼리 결과:\n${JSON.stringify(processedResult, null, 2)}`,
        },
      ],
    });

    const content = response.choices[0]?.message?.content?.trim();

    if (!content) {
      return {
        success: false,
        error: 'AI 응답 생성에 실패했습니다.',
      };
    }

    // 차트 타입 추론
    const chartInfo = inferChartType(question, queryResult);

    return {
      success: true,
      response: content,
      chartType: chartInfo.type,
      chartData: chartInfo.data,
    };
  } catch (error) {
    console.error('[ResponseGenerator] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '응답 생성 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 차트 타입 추론
 */
function inferChartType(
  question: string,
  data: Record<string, unknown>[]
): { type: 'bar' | 'line' | 'pie' | 'table' | null; data: Record<string, unknown>[] | null } {
  const lowerQuestion = question.toLowerCase();

  // 데이터가 1개면 차트 불필요
  if (data.length === 1) {
    return { type: null, data: null };
  }

  // 플랫폼별 비교 → 막대 차트
  if (
    lowerQuestion.includes('플랫폼별') ||
    lowerQuestion.includes('플랫폼 비교') ||
    data.some((row) => 'platform' in row || '플랫폼' in row)
  ) {
    return { type: 'bar', data };
  }

  // 일별/주별/월별 추이 → 라인 차트
  if (
    lowerQuestion.includes('추이') ||
    lowerQuestion.includes('변화') ||
    lowerQuestion.includes('일별') ||
    lowerQuestion.includes('주별') ||
    data.some((row) => 'date' in row || '날짜' in row)
  ) {
    return { type: 'line', data };
  }

  // 비중/점유율 → 파이 차트
  if (lowerQuestion.includes('비중') || lowerQuestion.includes('점유율') || lowerQuestion.includes('비율')) {
    return { type: 'pie', data };
  }

  // 데이터가 여러 행이면 테이블
  if (data.length > 1) {
    return { type: 'table', data };
  }

  return { type: null, data: null };
}

/**
 * 숫자 포맷팅 유틸리티
 */
export function formatNumber(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return '-';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '-';
  return num.toLocaleString('ko-KR');
}

/**
 * 금액 포맷팅
 */
export function formatCurrency(value: number | string | null | undefined): string {
  const formatted = formatNumber(value);
  return formatted === '-' ? formatted : `${formatted}원`;
}

/**
 * 퍼센트 포맷팅
 */
export function formatPercent(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return '-';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '-';
  return `${num.toFixed(1)}%`;
}
