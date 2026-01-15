/**
 * SQL 생성 프롬프트 엔지니어링
 * TASK-903: 자연어 → SQL 변환
 */

import { getOpenAIClient, AI_MODEL, AI_TEMPERATURE, AI_MAX_TOKENS } from './openai';

// 데이터베이스 스키마 정의 (프롬프트에 포함)
const DATABASE_SCHEMA = `
테이블: ad_performance
- id: UUID (기본 키)
- user_id: UUID (사용자 ID)
- platform: VARCHAR (플랫폼 코드: 'naver', 'kakao', 'google', 'meta', 'coupang')
- campaign_id: VARCHAR (캠페인 ID, nullable)
- campaign_name: VARCHAR (캠페인 이름, nullable)
- ad_group_id: VARCHAR (광고 그룹 ID, nullable)
- ad_group_name: VARCHAR (광고 그룹 이름, nullable)
- date: DATE (데이터 날짜)
- impressions: INTEGER (노출 수)
- clicks: INTEGER (클릭 수)
- spend: DECIMAL (광고비, 원)
- conversions: INTEGER (전환 수)
- revenue: DECIMAL (매출, 원)
- created_at: TIMESTAMP

테이블: platform_connections
- id: UUID (기본 키)
- user_id: UUID (사용자 ID)
- platform: VARCHAR (플랫폼 코드)
- status: VARCHAR ('active', 'inactive', 'error')
- last_sync_at: TIMESTAMP (마지막 동기화 시간)

플랫폼 코드:
- 'naver': 네이버 검색광고
- 'kakao': 카카오모먼트
- 'google': 구글 애즈
- 'meta': 메타 광고 (페이스북/인스타그램)
- 'coupang': 쿠팡 광고

지표 계산:
- CTR (클릭률) = clicks / impressions * 100
- CPC (클릭당 비용) = spend / clicks
- ROAS (광고수익률) = revenue / spend * 100
- CPA (전환당 비용) = spend / conversions
- CVR (전환율) = conversions / clicks * 100
`;

// 시스템 프롬프트
const SYSTEM_PROMPT = `당신은 마케팅 데이터 분석가입니다. 사용자의 자연어 질문을 PostgreSQL 쿼리로 변환합니다.

${DATABASE_SCHEMA}

규칙:
1. 반드시 user_id = :user_id 조건을 포함해야 합니다 (보안).
2. 날짜 필터가 필요하면 date 컬럼을 사용합니다.
3. 집계 함수: SUM, AVG, COUNT, MIN, MAX 사용 가능.
4. 플랫폼 필터: platform = '플랫폼코드' 사용.
5. 기간 표현:
   - 오늘: date = CURRENT_DATE
   - 어제: date = CURRENT_DATE - INTERVAL '1 day'
   - 이번 주: date >= date_trunc('week', CURRENT_DATE)
   - 지난 주: date >= date_trunc('week', CURRENT_DATE) - INTERVAL '1 week' AND date < date_trunc('week', CURRENT_DATE)
   - 이번 달: date >= date_trunc('month', CURRENT_DATE)
   - 지난 달: date >= date_trunc('month', CURRENT_DATE) - INTERVAL '1 month' AND date < date_trunc('month', CURRENT_DATE)
   - 최근 7일: date >= CURRENT_DATE - INTERVAL '7 days'
   - 최근 30일: date >= CURRENT_DATE - INTERVAL '30 days'
6. 결과 컬럼에 한글 별칭을 사용하세요 (AS "광고비").
7. 금액은 소수점 없이 정수로, 비율은 소수점 둘째자리까지 표시.
8. 플랫폼 비교 시 GROUP BY platform 사용.

응답 형식:
SQL 쿼리만 반환하세요. 설명이나 마크다운 없이 순수 SQL만.
쿼리가 불가능한 질문이면 "INVALID_QUERY: 이유" 형식으로 반환.
`;

export interface SqlGenerationResult {
  success: boolean;
  sql?: string;
  error?: string;
}

/**
 * 자연어 질문을 SQL로 변환
 */
export async function generateSqlFromQuestion(
  question: string,
  userId: string
): Promise<SqlGenerationResult> {
  try {
    const openai = getOpenAIClient();

    const response = await openai.chat.completions.create({
      model: AI_MODEL,
      temperature: AI_TEMPERATURE,
      max_tokens: AI_MAX_TOKENS,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: question },
      ],
    });

    const content = response.choices[0]?.message?.content?.trim();

    if (!content) {
      return {
        success: false,
        error: 'AI 응답이 비어있습니다.',
      };
    }

    // INVALID_QUERY 체크
    if (content.startsWith('INVALID_QUERY:')) {
      return {
        success: false,
        error: content.replace('INVALID_QUERY:', '').trim(),
      };
    }

    // SQL 검증 및 정제
    let sql = content
      .replace(/```sql/gi, '')
      .replace(/```/g, '')
      .trim();

    // user_id 플레이스홀더를 실제 값으로 치환
    sql = sql.replace(/:user_id/g, `'${userId}'`);

    // 기본 보안 검증
    const validation = validateSql(sql, userId);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    return {
      success: true,
      sql,
    };
  } catch (error) {
    console.error('[SqlGenerator] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'SQL 생성 중 오류가 발생했습니다.',
    };
  }
}

/**
 * SQL 보안 검증
 */
function validateSql(sql: string, userId: string): { valid: boolean; error?: string } {
  const upperSql = sql.toUpperCase();

  // 위험한 키워드 체크
  const dangerousKeywords = ['DROP', 'DELETE', 'TRUNCATE', 'ALTER', 'INSERT', 'UPDATE', 'GRANT', 'REVOKE'];
  for (const keyword of dangerousKeywords) {
    if (upperSql.includes(keyword)) {
      return { valid: false, error: `위험한 SQL 키워드가 감지되었습니다: ${keyword}` };
    }
  }

  // SELECT만 허용
  if (!upperSql.trimStart().startsWith('SELECT')) {
    return { valid: false, error: 'SELECT 쿼리만 허용됩니다.' };
  }

  // user_id 조건 확인
  if (!sql.includes(userId)) {
    return { valid: false, error: '사용자 ID 필터가 누락되었습니다.' };
  }

  // 서브쿼리 제한 (간단한 체크)
  const selectCount = (upperSql.match(/SELECT/g) || []).length;
  if (selectCount > 2) {
    return { valid: false, error: '복잡한 서브쿼리는 지원하지 않습니다.' };
  }

  return { valid: true };
}
