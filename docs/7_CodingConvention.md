# 마케트(Markeet) Coding Convention & AI Collaboration Guide

**프로젝트명:** 마케트(Markeet)  
**세션 ID:** MARKEET-2026-01-13  
**문서 버전:** v1.0  
**생성일:** 2026-01-13

---

## 핵심 원칙

> **"신뢰하되, 검증하라" (Trust but Verify)**
> 
> AI 코딩 파트너는 강력하지만 완벽하지 않습니다. 생성된 코드는 항상 검증이 필요합니다.

---

## 프로젝트 설정 및 기술 스택

### 1. 버전 관리

**Git 브랜치 전략:**
```
main (프로덕션)
  ↓
develop (개발)
  ↓
feature/feat-1-data-integration
```

**커밋 메시지 규칙:**
```
feat: 새 기능 추가
fix: 버그 수정
refactor: 코드 리팩토링
docs: 문서 수정

예시:
feat: Add platform connection UI
fix: Resolve Supabase RLS policy error
```

---

### 2. 기술 스택 버전 고정

**package.json:**
```json
{
  "dependencies": {
    "next": "14.0.4",
    "react": "18.2.0",
    "@supabase/supabase-js": "^2.39.0",
    "recharts": "^2.10.0"
  }
}
```

---

## 아키텍처 및 모듈성

### 폴더 구조

```
/app
  /(auth)
    /login/page.tsx
  /(dashboard)
    /dashboard/page.tsx
  /api
/components
  /ui
    /Button.tsx
  /charts
/lib
  /supabase.ts
/hooks
```

---

## AI 소통 원칙

### 효과적인 지시 방법

**좋은 프롬프트:**
```
"다음 요구사항을 만족하는 Button 컴포넌트를 작성해줘:
1. variant prop: 'primary' | 'secondary'
2. Tailwind CSS 사용
3. Design System 문서 참고"
```

**나쁜 프롬프트:**
```
"버튼 만들어줘"
```

---

## 코드 품질 및 보안

### TypeScript 엄격 모드

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true
  }
}
```

---

### 보안 체크리스트

| 항목 | 확인 방법 |
|------|-----------|
| **API 키 노출** | `.env.local` 확인 |
| **SQL Injection** | Parameterized Query 사용 |
| **XSS** | `dangerouslySetInnerHTML` 금지 |

---

### 환경 변수 관리

**올바른 방법:**
```typescript
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) throw new Error('OPENAI_API_KEY not set');
```

---

## 테스트 및 디버깅

### 검증 워크플로우

```
코드 생성 (AI)
  ↓
로컬 실행
  ↓
TypeScript 컴파일
  ↓
Git 커밋
```

---

## 성능 최적화

### React Query 캐싱

```typescript
const { data } = useQuery({
  queryKey: ['dashboard'],
  queryFn: fetchData,
  staleTime: 5 * 60 * 1000  // 5분
});
```

---

## AI 협업 체크리스트

- [ ] TypeScript 에러 없음
- [ ] ESLint 경고 없음
- [ ] 환경 변수 하드코딩 없음
- [ ] RLS 정책 적용
- [ ] 에러 핸들링 구현
- [ ] 반응형 확인

---

## 최종 체크리스트 (배포 전)

- [ ] 환경 변수 Vercel 설정
- [ ] RLS 활성화
- [ ] `pnpm build` 성공
- [ ] 보안 체크리스트 완료
