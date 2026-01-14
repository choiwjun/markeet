# 마케트(Markeet) 태스크 문서

**프로젝트명:** 마케트(Markeet)
**문서 버전:** v2.0
**생성일:** 2026-01-14
**수정일:** 2026-01-14
**기반 문서:** PRD, TRD, UserFlow, DatabaseDesign, DesignSystem, CodingConvention

---

## 태스크 상태 범례

| 상태 | 설명 |
|------|------|
| `TODO` | 대기 중 |
| `IN_PROGRESS` | 진행 중 |
| `DONE` | 완료 |
| `BLOCKED` | 차단됨 |

---

## 마일스톤 개요

| 마일스톤 | 설명 | 태스크 수 |
|----------|------|-----------|
| M0 | 프로젝트 초기화 | 14 |
| M1 | 데이터베이스 설정 | 8 |
| M2 | 공통 UI 컴포넌트 | 12 |
| M3 | 인증 시스템 | 14 |
| M4 | 플랫폼 연동 | 16 |
| M5 | 대시보드 | 20 |
| M6 | 랜딩페이지 | 6 |

**총 태스크: 90개**

---

## M0: 프로젝트 초기화

### TASK-001: Next.js 프로젝트 생성
- **상태:** `DONE`
- **타입:** STRUCTURAL
- **설명:** Next.js 14 App Router 기반 프로젝트 생성
- **검증:** `npm run dev` 실행 시 localhost:3000에서 기본 페이지 표시 ✅
- **파일:** `package.json`, `next.config.mjs`, `app/layout.tsx`, `app/page.tsx`
- **완료일:** 2026-01-14

### TASK-002: Git 저장소 초기화 및 브랜치 전략 설정
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** Git 초기화, main/develop 브랜치 생성, .gitignore 설정
- **검증:** `git branch` 실행 시 main, develop 브랜치 존재
- **파일:** `.gitignore`, Git 브랜치
- **근거:** CodingConvention - Git 브랜치 전략

### TASK-003: TypeScript 엄격 모드 설정
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** tsconfig.json에 strict 모드 활성화
- **검증:** `pnpm tsc --noEmit` 실행 시 에러 없음
- **파일:** `tsconfig.json`

### TASK-004: Tailwind CSS 설정
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** Tailwind CSS 설치 및 기본 설정
- **검증:** Tailwind 클래스가 적용된 테스트 컴포넌트 렌더링 확인
- **파일:** `tailwind.config.ts`, `app/globals.css`

### TASK-005: 디자인 시스템 토큰 설정
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** DesignSystem 문서 기반 색상, 타이포그래피, 간격 CSS 변수 설정
- **검증:** CSS 변수가 올바르게 정의되어 있음
- **파일:** `app/globals.css`, `tailwind.config.ts`
- **근거:** DesignSystem - 색상 팔레트, 간격 시스템

### TASK-006: Pretendard 폰트 설정
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** Pretendard 웹폰트 로딩 설정 (한글 최적화)
- **검증:** 페이지에서 Pretendard 폰트가 적용됨
- **파일:** `app/layout.tsx`, `app/globals.css`
- **근거:** DesignSystem - 타이포그래피 (Pretendard)

### TASK-007: 폴더 구조 생성
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** CodingConvention 문서 기반 폴더 구조 생성
- **검증:** `/app`, `/components`, `/lib`, `/hooks`, `/types` 폴더 존재
- **파일:** 폴더 생성

### TASK-008: ESLint 및 Prettier 설정
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** 코드 품질 도구 설정
- **검증:** `pnpm lint` 실행 시 에러 없음
- **파일:** `.eslintrc.json`, `.prettierrc`

### TASK-009: 테스트 환경 설정 (Vitest)
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** Vitest + React Testing Library 설정
- **검증:** 샘플 테스트 실행 성공
- **파일:** `vitest.config.ts`, `vitest.setup.ts`

### TASK-010: 환경 변수 템플릿 생성
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** `.env.example` 파일 생성 (Supabase, OpenAI 키 템플릿)
- **검증:** 필수 환경 변수 키가 정의되어 있음
- **파일:** `.env.example`
- **근거:** TRD - 환경 변수

### TASK-011: Zustand 상태 관리 설정
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** Zustand 설치 및 스토어 기본 구조 생성
- **검증:** 샘플 스토어 생성 및 테스트 통과
- **파일:** `lib/stores/index.ts`
- **근거:** TRD - Zustand 4.x

### TASK-012: React Query Provider 설정
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** TanStack Query (React Query) 설치 및 Provider 설정
- **검증:** QueryClientProvider가 앱에 적용됨
- **파일:** `lib/providers/QueryProvider.tsx`, `app/layout.tsx`
- **근거:** TRD - React Query 5.x

### TASK-013: Lucide React 아이콘 설치
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** Lucide React 아이콘 라이브러리 설치
- **검증:** 아이콘 컴포넌트 렌더링 테스트 통과
- **파일:** `package.json`
- **근거:** DesignSystem - 아이콘 시스템

### TASK-014: 숫자 포맷팅 유틸리티 생성
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** 통화(₩1,234,567), 퍼센트(3.2%), 큰 숫자(1.2M) 포맷팅 함수
- **검증:** 포맷팅 함수 단위 테스트 통과
- **파일:** `lib/utils/format.ts`
- **근거:** DesignSystem - font-mono 숫자 표시

---

## M1: 데이터베이스 설정

### TASK-101: Supabase 클라이언트 설정
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** Supabase JS 클라이언트 초기화 (브라우저/서버)
- **검증:** Supabase 연결 테스트 통과
- **파일:** `lib/supabase/client.ts`, `lib/supabase/server.ts`

### TASK-102: 데이터베이스 타입 정의 - users
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** DatabaseDesign 기반 users 테이블 TypeScript 타입 정의
- **검증:** 타입 컴파일 성공
- **파일:** `types/database.ts`

### TASK-103: 데이터베이스 타입 정의 - platform_connections
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** platform_connections 테이블 TypeScript 타입 정의
- **검증:** 타입 컴파일 성공
- **파일:** `types/database.ts`

### TASK-104: 데이터베이스 타입 정의 - ad_data
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** ad_data 테이블 TypeScript 타입 정의
- **검증:** 타입 컴파일 성공
- **파일:** `types/database.ts`

### TASK-105: 데이터베이스 타입 정의 - reports
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** reports 테이블 TypeScript 타입 정의
- **검증:** 타입 컴파일 성공
- **파일:** `types/database.ts`

### TASK-106: 데이터베이스 마이그레이션 스크립트 생성
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** 전체 테이블 생성 SQL 스크립트
- **검증:** Supabase에서 마이그레이션 실행 성공
- **파일:** `supabase/migrations/001_initial_schema.sql`
- **근거:** DatabaseDesign - 테이블 명세

### TASK-107: RLS 정책 설정 스크립트 생성
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** Row-Level Security 정책 SQL 스크립트
- **검증:** RLS 정책이 각 테이블에 적용됨
- **파일:** `supabase/migrations/002_rls_policies.sql`
- **근거:** DatabaseDesign - RLS 정책, TRD - 보안

### TASK-108: Supabase 타입 자동 생성 설정
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** Supabase CLI를 이용한 타입 자동 생성 스크립트
- **검증:** `pnpm supabase:types` 실행 시 타입 파일 생성
- **파일:** `package.json` (scripts), `types/supabase.ts`

---

## M2: 공통 UI 컴포넌트

### TASK-201: Button 컴포넌트 생성
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** Primary, Secondary, Ghost 변형을 가진 Button 컴포넌트
- **검증:** 모든 변형 렌더링 테스트 통과
- **파일:** `components/ui/Button.tsx`
- **근거:** DesignSystem - Button 명세

### TASK-202: Button 상태 스타일 구현
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** Hover, Active, Disabled, Loading 상태 스타일
- **테스트:** `각 상태에서 올바른 스타일 적용`
- **파일:** `components/ui/Button.tsx`
- **근거:** DesignSystem - Button 상태별

### TASK-203: Input 컴포넌트 생성
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** 텍스트 입력 필드 컴포넌트 (라벨, 에러 메시지 포함)
- **검증:** 기본 렌더링 테스트 통과
- **파일:** `components/ui/Input.tsx`
- **근거:** DesignSystem - Input Field 명세

### TASK-204: Input 상태 스타일 구현
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** Focus, Error, Disabled 상태 스타일
- **테스트:** `에러 상태에서 에러 메시지 표시`
- **파일:** `components/ui/Input.tsx`

### TASK-205: Card 컴포넌트 생성
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** 콘텐츠를 감싸는 카드 컴포넌트
- **검증:** 카드 렌더링 테스트 통과
- **파일:** `components/ui/Card.tsx`
- **근거:** DesignSystem - Card 명세

### TASK-206: Modal 컴포넌트 생성
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** 오버레이 모달 다이얼로그 컴포넌트
- **검증:** 모달 열기/닫기 테스트 통과
- **파일:** `components/ui/Modal.tsx`

### TASK-207: Modal 접근성 구현
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** ESC 키로 닫기, 포커스 트랩, aria 속성
- **테스트:** `ESC 키 누르면 모달 닫힘`
- **파일:** `components/ui/Modal.tsx`
- **근거:** DesignSystem - 접근성

### TASK-208: Badge 컴포넌트 생성
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** Success, Warning, Danger 변형을 가진 뱃지 컴포넌트
- **검증:** 모든 변형 렌더링 테스트 통과
- **파일:** `components/ui/Badge.tsx`
- **근거:** DesignSystem - Badge 명세

### TASK-209: Toast 알림 시스템 구현
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** 성공/에러/경고 토스트 알림 (Zustand 연동)
- **테스트:** `토스트 표시 후 자동 사라짐`
- **파일:** `components/ui/Toast.tsx`, `lib/stores/toastStore.ts`

### TASK-210: Skeleton 로딩 컴포넌트 생성
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** 데이터 로딩 중 표시할 스켈레톤 UI
- **검증:** 스켈레톤 렌더링 테스트 통과
- **파일:** `components/ui/Skeleton.tsx`
- **근거:** UserFlow - 데이터 로딩 상태

### TASK-211: EmptyState 컴포넌트 생성
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** 데이터가 없을 때 표시할 빈 상태 UI
- **검증:** EmptyState 렌더링 테스트 통과
- **파일:** `components/ui/EmptyState.tsx`
- **근거:** UserFlow - 데이터 없음 안내

### TASK-212: ErrorState 컴포넌트 생성
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** 에러 발생 시 표시할 UI (재시도 버튼 포함)
- **검증:** ErrorState 렌더링 테스트 통과
- **파일:** `components/ui/ErrorState.tsx`
- **근거:** UserFlow - 에러 처리 흐름

---

## M3: 인증 시스템

### TASK-301: 인증 레이아웃 컴포넌트 생성
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** 인증 페이지용 공통 레이아웃 (중앙 정렬 카드)
- **검증:** 레이아웃 컴포넌트 렌더링 테스트 통과
- **파일:** `app/(auth)/layout.tsx`

### TASK-302: 회원가입 폼 UI 컴포넌트 생성
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** 이메일/비밀번호 입력 폼 UI (기능 없이 UI만)
- **검증:** 폼 렌더링 테스트 통과
- **파일:** `components/auth/SignUpForm.tsx`

### TASK-303: 회원가입 폼 유효성 검사 구현
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** 이메일 형식, 비밀번호 길이(8자 이상) 검증
- **테스트:**
  - `유효하지 않은 이메일 형식이면 에러 메시지 표시`
  - `비밀번호가 8자 미만이면 에러 메시지 표시`
- **파일:** `components/auth/SignUpForm.tsx`

### TASK-304: 회원가입 API 연동 구현
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** Supabase Auth signUp 호출
- **테스트:** `유효한 정보로 회원가입 시 성공 응답 반환`
- **파일:** `components/auth/SignUpForm.tsx`, `lib/supabase/auth.ts`

### TASK-305: 회원가입 페이지 생성
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** 회원가입 페이지 라우트 생성
- **검증:** `/signup` 경로 접근 시 회원가입 폼 표시
- **파일:** `app/(auth)/signup/page.tsx`

### TASK-306: 로그인 폼 UI 컴포넌트 생성
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** 이메일/비밀번호 로그인 폼 UI
- **검증:** 폼 렌더링 테스트 통과
- **파일:** `components/auth/LoginForm.tsx`

### TASK-307: 로그인 폼 유효성 검사 구현
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** 이메일/비밀번호 필수 입력 검증
- **테스트:** `빈 필드 제출 시 에러 메시지 표시`
- **파일:** `components/auth/LoginForm.tsx`

### TASK-308: 로그인 API 연동 구현
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** Supabase Auth signInWithPassword 호출
- **테스트:** `유효한 자격증명으로 로그인 시 세션 생성`
- **파일:** `components/auth/LoginForm.tsx`, `lib/supabase/auth.ts`

### TASK-309: 로그인 페이지 생성
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** 로그인 페이지 라우트 생성
- **검증:** `/login` 경로 접근 시 로그인 폼 표시
- **파일:** `app/(auth)/login/page.tsx`

### TASK-310: 로그아웃 기능 구현
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** Supabase Auth signOut 호출 및 리다이렉트
- **테스트:** `로그아웃 시 세션 제거 및 로그인 페이지로 이동`
- **파일:** `lib/supabase/auth.ts`
- **근거:** UserFlow - 인증 상태 관리

### TASK-311: 인증 상태 관리 훅 생성
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** 현재 사용자 세션 상태 관리 커스텀 훅
- **테스트:** `로그인 상태에서 사용자 정보 반환`
- **파일:** `hooks/useAuth.ts`

### TASK-312: 인증 미들웨어 구현
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** 보호된 라우트 접근 제어
- **테스트:** `미인증 사용자가 대시보드 접근 시 로그인 페이지로 리다이렉트`
- **파일:** `middleware.ts`

### TASK-313: 온보딩 완료 상태 체크 로직 구현
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** 사용자의 온보딩 완료 여부 확인 (플랫폼 연동 1개 이상)
- **테스트:** `연동된 플랫폼 없으면 온보딩 페이지로 리다이렉트`
- **파일:** `lib/auth/onboardingCheck.ts`, `middleware.ts`
- **근거:** UserFlow - 인증 상태 (온보딩 필요 여부)

### TASK-314: 인증 에러 처리 구현
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** 로그인/회원가입 실패 시 에러 메시지 표시
- **테스트:** `잘못된 비밀번호로 로그인 시 에러 메시지 표시`
- **파일:** `components/auth/LoginForm.tsx`, `components/auth/SignUpForm.tsx`

---

## M4: 플랫폼 연동

### TASK-401: 플랫폼 목록 상수 정의
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** 지원 플랫폼 상수 정의 (네이버, 쿠팡, 구글, 메타 등 12개)
- **검증:** 플랫폼 상수 타입 체크 통과
- **파일:** `lib/constants/platforms.ts`
- **근거:** DatabaseDesign - 플랫폼 코드 표

### TASK-402: 온보딩 레이아웃 생성
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** 온보딩 페이지용 레이아웃
- **검증:** 레이아웃 렌더링 테스트 통과
- **파일:** `app/(dashboard)/onboarding/layout.tsx`

### TASK-403: 플랫폼 선택 카드 컴포넌트 생성
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** 플랫폼 로고, 이름, 연동 상태를 표시하는 선택 카드
- **검증:** 카드 렌더링 테스트 통과
- **파일:** `components/onboarding/PlatformCard.tsx`

### TASK-404: 플랫폼 선택 페이지 UI 생성
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** 연동할 플랫폼을 선택하는 온보딩 페이지 UI
- **검증:** 페이지 렌더링 테스트 통과
- **파일:** `app/(dashboard)/onboarding/page.tsx`
- **근거:** UserFlow - 온보딩 플랫폼 연동 화면

### TASK-405: API 키 입력 모달 컴포넌트 생성
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** API 키 입력을 위한 모달 다이얼로그 UI
- **검증:** 모달 열기/닫기 테스트 통과
- **파일:** `components/onboarding/ApiKeyModal.tsx`

### TASK-406: API 키 입력 유효성 검사 구현
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** API 키 필수 입력 검증
- **테스트:** `빈 API 키 제출 시 에러 메시지 표시`
- **파일:** `components/onboarding/ApiKeyModal.tsx`

### TASK-407: 플랫폼 연동 저장 API 라우트 생성
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** platform_connections 테이블에 연동 정보 저장
- **테스트:** `유효한 API 키로 연동 요청 시 DB에 저장됨`
- **파일:** `app/api/connections/route.ts`

### TASK-408: API 키 암호화 저장 구현
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** Supabase Vault를 사용한 API 키 암호화
- **테스트:** `API 키가 암호화되어 저장됨`
- **파일:** `lib/supabase/vault.ts`
- **근거:** TRD - Supabase Vault (AES-256)

### TASK-409: 플랫폼 연결 테스트 기능 구현
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** 입력된 API 키로 플랫폼 연결 유효성 테스트
- **테스트:** `유효한 API 키로 연결 테스트 시 성공 응답`
- **파일:** `lib/platforms/connectionTest.ts`
- **근거:** UserFlow - API 연결 테스트

### TASK-410: 연동된 플랫폼 목록 조회 API 생성
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** 사용자의 연동된 플랫폼 목록 반환
- **테스트:** `연동된 플랫폼 목록 조회 시 올바른 데이터 반환`
- **파일:** `app/api/connections/route.ts`

### TASK-411: 연동 상태 뱃지 표시 구현
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** 플랫폼 카드에 연동 상태(active/expired/error) 뱃지 표시
- **테스트:** `상태에 따라 올바른 뱃지 색상 표시`
- **파일:** `components/onboarding/PlatformCard.tsx`
- **근거:** DesignSystem - Badge, UserFlow - 설정 페이지

### TASK-412: 설정 페이지 - 연동 관리 UI 생성
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** 연동된 플랫폼 목록 표시 및 관리 UI
- **검증:** 연동 목록 렌더링 테스트 통과
- **파일:** `app/(dashboard)/settings/connections/page.tsx`
- **근거:** UserFlow - 설정 API 키 관리 화면

### TASK-413: 플랫폼 연동 삭제 기능 구현
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** 연동 해제 기능 (확인 다이얼로그 포함)
- **테스트:** `연동 삭제 요청 시 DB에서 삭제됨`
- **파일:** `app/api/connections/[id]/route.ts`

### TASK-414: API 키 갱신 기능 구현
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** 만료된 API 키 갱신 기능
- **테스트:** `새 API 키로 갱신 시 DB 업데이트됨`
- **파일:** `app/api/connections/[id]/route.ts`
- **근거:** UserFlow - 에러 처리 (API 키 만료)

### TASK-415: 온보딩 완료 처리 구현
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** 최소 1개 플랫폼 연동 후 온보딩 완료 → 대시보드 이동
- **테스트:** `1개 이상 연동 후 다음 클릭 시 대시보드로 이동`
- **파일:** `app/(dashboard)/onboarding/page.tsx`
- **근거:** UserFlow - 온보딩 완료

### TASK-416: 수동 데이터 동기화 트리거 구현
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** 플랫폼 연동 후 즉시 데이터 수집 시작
- **테스트:** `연동 성공 시 데이터 수집 API 호출됨`
- **파일:** `lib/platforms/syncData.ts`
- **근거:** UserFlow - 데이터 수집 시작

---

## M5: 대시보드

### TASK-501: 대시보드 레이아웃 생성
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** 사이드바 + 헤더 + 메인 콘텐츠 레이아웃
- **검증:** 레이아웃 렌더링 테스트 통과
- **파일:** `app/(dashboard)/layout.tsx`

### TASK-502: 사이드바 네비게이션 컴포넌트 생성
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** 대시보드, 리포트, 설정 메뉴가 있는 사이드바
- **검증:** 사이드바 렌더링 테스트 통과
- **파일:** `components/layout/Sidebar.tsx`
- **근거:** UserFlow - 대시보드 메인 화면

### TASK-503: 모바일 사이드바 (햄버거 메뉴) 구현
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** 모바일에서 햄버거 버튼 클릭 시 사이드바 슬라이드
- **테스트:** `모바일 화면에서 햄버거 클릭 시 메뉴 열림`
- **파일:** `components/layout/Sidebar.tsx`, `components/layout/MobileMenu.tsx`
- **근거:** UserFlow - 반응형 UI (모바일 햄버거 메뉴)

### TASK-504: 헤더 컴포넌트 생성
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** 로고, 알림, 사용자 메뉴가 있는 헤더
- **검증:** 헤더 렌더링 테스트 통과
- **파일:** `components/layout/Header.tsx`

### TASK-505: 지표 카드 컴포넌트 생성
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** 숫자 지표를 표시하는 카드 (라벨, 값, 증감 표시)
- **검증:** 지표 카드 렌더링 테스트 통과
- **파일:** `components/dashboard/MetricCard.tsx`
- **근거:** UserFlow - 대시보드 주요 지표 카드

### TASK-506: 지표 증감 표시 구현
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** 전일/전주 대비 증감률 표시 (TrendingUp/Down 아이콘)
- **테스트:** `양수면 녹색 상승 아이콘, 음수면 빨간 하락 아이콘`
- **파일:** `components/dashboard/MetricCard.tsx`
- **근거:** DesignSystem - 아이콘 (TrendingUp/Down)

### TASK-507: 대시보드 메인 페이지 레이아웃 생성
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** 지표 카드 그리드 + 차트 영역 배치
- **검증:** 페이지 레이아웃 렌더링 테스트 통과
- **파일:** `app/(dashboard)/dashboard/page.tsx`

### TASK-508: 기간 선택 필터 컴포넌트 생성
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** 7일/30일/커스텀 기간 선택 드롭다운
- **검증:** 필터 렌더링 테스트 통과
- **파일:** `components/dashboard/DateRangeFilter.tsx`
- **근거:** PRD - 통합 대시보드

### TASK-509: 기간 선택 상태 관리 구현
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** 선택된 기간에 따라 데이터 다시 조회
- **테스트:** `기간 변경 시 API 재호출`
- **파일:** `hooks/useDateRange.ts`

### TASK-510: 대시보드 데이터 조회 API 생성
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** 선택된 기간의 집계 데이터 반환 (총 광고비, 매출, ROAS)
- **테스트:** `대시보드 API 호출 시 집계 데이터 반환`
- **파일:** `app/api/dashboard/route.ts`
- **근거:** DatabaseDesign - 대시보드 주요 지표 조회 쿼리

### TASK-511: 대시보드 데이터 조회 훅 생성
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** React Query를 사용한 대시보드 데이터 페칭 (5분 캐싱)
- **테스트:** `useDashboardData 훅이 올바른 데이터 반환`
- **파일:** `hooks/useDashboardData.ts`
- **근거:** TRD - React Query 캐싱 (5분)

### TASK-512: 지표 카드에 실제 데이터 연동
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** API에서 받은 데이터를 지표 카드에 표시
- **테스트:** `대시보드 로드 시 총 광고비, 총 매출, ROAS 표시`
- **파일:** `app/(dashboard)/dashboard/page.tsx`

### TASK-513: 플랫폼별 비교 막대 차트 컴포넌트 생성
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** Recharts를 사용한 플랫폼별 성과 비교 막대 차트
- **검증:** 차트 렌더링 테스트 통과
- **파일:** `components/charts/PlatformBarChart.tsx`
- **근거:** DesignSystem - Recharts 스타일 가이드

### TASK-514: 차트 툴팁 컴포넌트 생성
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** 차트 호버 시 표시되는 커스텀 툴팁
- **검증:** 툴팁 렌더링 테스트 통과
- **파일:** `components/charts/ChartTooltip.tsx`
- **근거:** DesignSystem - Chart tooltip 설정

### TASK-515: 플랫폼별 데이터 조회 API 생성
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** 플랫폼별 집계 데이터 반환
- **테스트:** `플랫폼별 API 호출 시 플랫폼별 집계 데이터 반환`
- **파일:** `app/api/dashboard/platforms/route.ts`
- **근거:** DatabaseDesign - 플랫폼별 비교 쿼리

### TASK-516: 플랫폼별 차트에 실제 데이터 연동
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** API 데이터를 막대 차트에 표시
- **테스트:** `플랫폼별 차트에 각 플랫폼 데이터 표시`
- **파일:** `app/(dashboard)/dashboard/page.tsx`

### TASK-517: 일자별 추이 라인 차트 컴포넌트 생성
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** Recharts를 사용한 일자별 추이 라인 차트
- **검증:** 차트 렌더링 테스트 통과
- **파일:** `components/charts/TrendLineChart.tsx`

### TASK-518: 일자별 데이터 조회 API 생성
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** 일자별 집계 데이터 반환
- **테스트:** `일자별 API 호출 시 일자별 집계 데이터 반환`
- **파일:** `app/api/dashboard/trends/route.ts`
- **근거:** DatabaseDesign - 일자별 추이 쿼리

### TASK-519: 일자별 차트에 실제 데이터 연동
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** API 데이터를 라인 차트에 표시
- **테스트:** `일자별 차트에 추이 데이터 표시`
- **파일:** `app/(dashboard)/dashboard/page.tsx`

### TASK-520: 대시보드 로딩/에러 상태 처리
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** 데이터 로딩 중 스켈레톤, 에러 시 ErrorState 표시
- **테스트:** `로딩 중 스켈레톤 표시, 에러 시 재시도 버튼 표시`
- **파일:** `app/(dashboard)/dashboard/page.tsx`
- **근거:** UserFlow - 데이터 로딩 상태, 에러 처리 흐름

---

## M6: 랜딩페이지

### TASK-601: 랜딩페이지 레이아웃 생성
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** 랜딩페이지 전용 레이아웃 (네비게이션 바 + 푸터)
- **검증:** 레이아웃 렌더링 테스트 통과
- **파일:** `app/(landing)/layout.tsx`
- **근거:** UserFlow - 랜딩페이지 방문

### TASK-602: 랜딩페이지 히어로 섹션 생성
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** 메인 헤드라인, 서브 카피, CTA 버튼
- **검증:** 히어로 섹션 렌더링 테스트 통과
- **파일:** `app/(landing)/page.tsx`, `components/landing/HeroSection.tsx`
- **근거:** PRD - 핵심 가치 제안

### TASK-603: 랜딩페이지 기능 소개 섹션 생성
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** 주요 기능 3개 카드 형태로 소개
- **검증:** 기능 섹션 렌더링 테스트 통과
- **파일:** `components/landing/FeaturesSection.tsx`
- **근거:** PRD - 데이터 통합, 자연어 질의, 자동 리포트

### TASK-604: 랜딩페이지 CTA 버튼 동작 구현
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** "무료로 시작하기" 버튼 클릭 시 회원가입 페이지 이동
- **테스트:** `CTA 버튼 클릭 시 /signup으로 이동`
- **파일:** `components/landing/HeroSection.tsx`

### TASK-605: 랜딩페이지 반응형 구현
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** 모바일/태블릿/데스크톱 반응형 레이아웃
- **테스트:** `모바일 화면에서 1열 레이아웃으로 변경`
- **파일:** `app/(landing)/page.tsx`
- **근거:** UserFlow - 반응형 UI

### TASK-606: 랜딩페이지 푸터 생성
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** 링크, 저작권 정보가 포함된 푸터
- **검증:** 푸터 렌더링 테스트 통과
- **파일:** `components/landing/Footer.tsx`

---

## 태스크 실행 규칙

1. **순서 준수**: 마일스톤 순서대로 진행 (M0 → M1 → M2 → M3 → M4 → M5 → M6)
2. **의존성 체크**: 각 태스크의 선행 태스크가 완료되었는지 확인
3. **TDD 사이클**: Red → Green → Refactor
4. **커밋 분리**: 구조적 변경(STRUCTURAL)과 행위적 변경(BEHAVIORAL)을 별도 커밋
5. **중단 규칙**: 하나의 태스크 완료 후 즉시 중단, `"go"` 대기

---

## 변경 로그

| 날짜 | 버전 | 변경 내용 |
|------|------|-----------|
| 2026-01-14 | v1.0 | 초기 문서 생성 (50개 태스크) |
| 2026-01-14 | v2.0 | 누락 항목 추가 (90개 태스크) |

### v2.0 추가 내용
- **M0**: Git 초기화, Zustand, React Query, Lucide, Pretendard 폰트, 숫자 포맷팅
- **M1**: RLS 정책, Supabase 타입 자동 생성
- **M2 신규**: 공통 UI 컴포넌트 (Button, Input, Card, Modal, Badge, Toast, Skeleton, EmptyState, ErrorState)
- **M3**: 로그아웃, 온보딩 상태 체크, 인증 에러 처리
- **M4**: 연동 상태 뱃지, API 키 갱신, 온보딩 완료 처리, 수동 동기화
- **M5**: 모바일 사이드바, 기간 선택 필터, 증감 표시, 차트 툴팁, 로딩/에러 상태
- **M6 신규**: 랜딩페이지 (히어로, 기능 소개, CTA, 푸터)
