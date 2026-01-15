/**
 * OpenAI 클라이언트 설정
 * TASK-902: AI 질의 API 엔드포인트
 */

import OpenAI from 'openai';

// OpenAI 클라이언트 인스턴스 (Lazy initialization)
let openaiInstance: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!openaiInstance) {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY 환경 변수가 설정되지 않았습니다.');
    }

    openaiInstance = new OpenAI({
      apiKey,
    });
  }

  return openaiInstance;
}

// 모델 설정
export const AI_MODEL = 'gpt-4o-mini'; // 비용 효율적인 모델 사용
export const AI_MAX_TOKENS = 2000;
export const AI_TEMPERATURE = 0.3; // SQL 생성을 위해 낮은 temperature
