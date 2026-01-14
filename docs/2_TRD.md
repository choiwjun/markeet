# 마케트(Markeet) TRD (기술 요구사항 정의서)

**프로젝트명:** 마케트(Markeet)  
**세션 ID:** MARKEET-2026-01-13  
**문서 버전:** v1.0  
**생성일:** 2026-01-13

---

## 1. 시스템 아키텍처

### 고수준 아키텍처

```
[사용자 (PC/Mobile 브라우저)]
          ↓
[Vercel CDN + Edge Network]
          ↓
[Next.js 14 App (SSR/CSR)]
          ↓
    ┌─────┴─────┐
    ↓           ↓
[Next.js       [Supabase]
 API Routes]    - PostgreSQL
    ↓           - Auth
    ↓           - Realtime
    ↓           - Storage
    ↓
[외부 API 통합 레이어]
    ├─ 네이버 검색광고 API
    ├─ 구글 애즈 API
    ├─ 메타 광고 API
    ├─ 쿠팡 윙 API
    ├─ 11번가 API
    └─ OpenAI API (자연어 질의)
    
[Upstash Redis + BullMQ]
    ↓
[정기 데이터 수집 스케줄러]
```

### 데이터 흐름

1. **사용자 인증**: Supabase Auth (이메일/비밀번호)
2. **API 키 저장**: Supabase Vault (암호화)
3. **데이터 수집**: 
   - 매일 새벽 3시 BullMQ 작업 실행
   - 각 플랫폼 API 호출 → PostgreSQL 저장
4. **대시보드 조회**:
   - Next.js → Supabase PostgreSQL 쿼리
   - React Query 캐싱 (5분)
5. **자연어 질의**:
   - 사용자 질문 → OpenAI API → SQL 생성 → 실행 → 자연어 답변

---

## 2. 권장 기술 스택

### 프론트엔드

| 기술 | 버전 | 선택 이유 | 대안 | 벤더 락인 리스크 |
|------|------|-----------|------|------------------|
| **Next.js** | 14 (App Router) | - 반응형 웹 최적화<br>- SSR로 초기 로딩 빠름<br>- AI 도구 최적화 | Remix, Astro | 낮음 (React 기반, 이식 가능) |
| **TypeScript** | 5.x | 타입 안정성, 대규모 코드베이스 관리 | JavaScript | 없음 (표준) |
| **Tailwind CSS** | 3.x | 빠른 UI 개발, 토스 스타일 구현 용이 | Styled Components | 없음 (CSS) |
| **Recharts** | 2.x | 데이터 시각화, 차트 라이브러리 | Apache ECharts, Chart.js | 낮음 (교체 용이) |
| **React Query** | 5.x | 서버 데이터 캐싱, 자동 리프레시 | SWR, Apollo Client | 낮음 (교체 가능) |
| **Zustand** | 4.x | 글로벌 상태 관리 (간결함) | Redux, Jotai | 낮음 (표준 패턴) |

### 백엔드

| 기술 | 버전 | 선택 이유 | 대안 | 벤더 락인 리스크 |
|------|------|-----------|------|------------------|
| **Next.js API Routes** | 14 | 프론트와 통합, 빠른 개발 | Express.js, Fastify | 낮음 (Node.js 표준) |
| **Supabase Edge Functions** | Latest | 복잡한 로직 분리, 서버리스 | AWS Lambda, Cloudflare Workers | 중간 (Deno 기반, 이식 가능) |

### 데이터베이스

| 기술 | 버전 | 선택 이유 | 대안 | 벤더 락인 리스크 |
|------|------|-----------|------|------------------|
| **PostgreSQL** | 15.x | - 복잡한 관계형 쿼리 강력<br>- JSON 타입 지원<br>- 확장성 우수 | MySQL, MongoDB | **없음** (표준 SQL, 다른 호스팅 이전 가능) |
| **Supabase (호스팅)** | Cloud | - 관리형 PostgreSQL<br>- Auth/Storage 통합<br>- Realtime 지원 | AWS RDS, Neon | 낮음 (표준 PostgreSQL, 마이그레이션 가능) |

### 작업 큐 & 스케줄러

| 기술 | 버전 | 선택 이유 | 대안 | 벤더 락인 리스크 |
|------|------|-----------|------|------------------|
| **Upstash Redis** | Cloud | 서버리스 Redis, 비용 효율 | Redis Cloud, AWS ElastiCache | 낮음 (표준 Redis) |
| **BullMQ** | 5.x | 작업 큐, 재시도 로직 | Bee-Queue, Agenda | 낮음 (교체 가능) |

### AI 통합

| 기술 | 버전 | 선택 이유 | 대안 | 벤더 락인 리스크 |
|------|------|-----------|------|------------------|
| **OpenAI API** | GPT-4o-mini | 자연어 → SQL 변환, 분석 설명 | Anthropic Claude, Gemini | 중간 (프롬프트 조정 필요) |
| **Langchain** (선택) | Latest | AI 워크플로우 구조화 | LlamaIndex | 낮음 (추상화 레이어) |

### 인증 & 보안

| 기술 | 선택 이유 | 대안 | 벤더 락인 리스크 |
|------|-----------|------|------------------|
| **Supabase Auth** | 이메일/비밀번호, Row-Level Security | Auth0, Clerk | 낮음 (JWT 표준) |
| **Supabase Vault** | API 키 암호화 저장 | AWS Secrets Manager | 중간 (이전 시 재암호화) |

### 배포 & 호스팅

| 기술 | 선택 이유 | 대안 | 예상 비용 (월) |
|------|-----------|------|----------------|
| **Vercel** | Next.js 최적화, 자동 배포 | Netlify, AWS Amplify | $0~20 |
| **Supabase Cloud** | PostgreSQL + Auth + Storage 통합 | AWS RDS + Cognito | $0~25 |
| **Upstash Redis** | 서버리스 Redis | Redis Cloud | $0~10 |

---

## 3. 비기능적 요구사항

### 성능

| 지표 | 목표 | 측정 방법 |
|------|------|-----------|
| **초기 로딩 시간** | < 2초 (Largest Contentful Paint) | Lighthouse, Vercel Analytics |
| **대시보드 렌더링** | < 1초 (10,000개 데이터 포인트) | React Profiler |
| **자연어 질의 응답** | < 5초 (OpenAI API 호출 포함) | Sentry Performance |
| **API 응답 시간** | < 500ms (P95) | Vercel Edge Logs |

### 보안

| 요구사항 | 구현 방법 |
|----------|-----------|
| **HTTPS 강제** | Vercel 기본 제공 (Let's Encrypt) |
| **API 키 암호화** | Supabase Vault (AES-256) |
| **Row-Level Security** | Supabase RLS 정책: 사용자는 자기 데이터만 조회 |
| **SQL Injection 방어** | Parameterized Query (Supabase 자동) |
| **Rate Limiting** | Vercel Edge Middleware (IP별 100 req/min) |
| **CORS 정책** | Next.js API Routes에서 origin 제한 |

### 확장성

| 단계 | 사용자 수 | 동시 접속 | 데이터베이스 | 예상 비용 (월) |
|------|-----------|-----------|--------------|----------------|
| **Phase 1 (MVP)** | 50명 | ~10명 | Supabase Free (500MB) | $50 |
| **Phase 2** | 1,000명 | ~200명 | Supabase Pro (8GB) | $255 |
| **Phase 3** | 5,000명 | ~1,000명 | Supabase Team (100GB) | $1,669 |

**확장 전략**:
- Vercel: 자동 Edge 확장 (무제한)
- Supabase: 수직 확장 (더 큰 플랜) → 수평 확장 (Read Replica)
- BullMQ: Worker 수 증가

### 가용성

| 지표 | 목표 | 모니터링 |
|------|------|----------|
| **Uptime** | 99.5% (MVP), 99.9% (Phase 2+) | UptimeRobot, Vercel Status |
| **에러율** | < 1% | Sentry Error Tracking |
| **백업** | 일 1회 자동 (Supabase) | Supabase Dashboard |

---

## 4. 데이터베이스 요구사항

### 스키마 설계 원칙

1. **정규화**: 3NF 까지 정규화 (중복 최소화)
2. **관계 명확화**: Foreign Key 제약 조건 설정
3. **인덱싱 전략**:
   - Primary Key: 모든 테이블
   - Foreign Key: 조인 쿼리 최적화
   - 날짜 컬럼: 시계열 쿼리 최적화 (created_at, date)
4. **JSON 타입 활용**: 외부 API 응답 저장 (유연성)

### 주요 테이블

| 테이블 | 목적 | 핵심 컬럼 | 인덱스 |
|--------|------|-----------|--------|
| **users** | 사용자 계정 | id, email, created_at | PK(id), email |
| **platform_connections** | API 연동 정보 | user_id, platform, api_key_encrypted | PK(id), FK(user_id), (user_id, platform) |
| **ad_data** | 광고 데이터 | user_id, platform, date, spend, revenue, impressions, clicks | PK(id), FK(user_id), (user_id, date), (platform, date) |
| **reports** | 생성된 리포트 | user_id, type, period_start, period_end, data_json | PK(id), FK(user_id), created_at |

### 데이터 보존 정책

- **활성 데이터**: 최근 6개월 (빠른 조회)
- **아카이브**: 6개월~2년 (느린 조회 허용)
- **삭제**: 2년 이상 데이터 자동 삭제 (GDPR 준수)

---

## 5. 접근제어 & 권한 모델

### 역할 정의

| 역할 | 권한 | 사용 사례 |
|------|------|-----------|
| **Owner** | 모든 데이터 CRUD, 결제 관리, API 키 관리 | 계정 소유자 |
| **Viewer** (Phase 2) | 데이터 읽기 전용 | 팀원, 외주 대행사 |

### Row-Level Security (RLS) 정책

```sql
-- users 테이블: 자기 계정만 조회
CREATE POLICY "Users can view own account"
ON users FOR SELECT
USING (auth.uid() = id);

-- ad_data 테이블: 자기 데이터만 조회
CREATE POLICY "Users can view own ad data"
ON ad_data FOR SELECT
USING (auth.uid() = user_id);

-- platform_connections: 자기 연동만 CRUD
CREATE POLICY "Users manage own connections"
ON platform_connections FOR ALL
USING (auth.uid() = user_id);
```

---

## 6. 데이터 생명주기

### 수집 원칙
- **최소 수집**: 광고 성과에 필수적인 데이터만 (개인정보 최소화)
- **동의 기반**: API 연동 시 명시적 동의

### 처리 흐름
```
1. 사용자 API 키 입력 (암호화 저장)
   ↓
2. 매일 새벽 3시 스케줄러 실행
   ↓
3. 각 플랫폼 API 호출 (최근 7일 데이터)
   ↓
4. PostgreSQL 저장 (JSON + 구조화)
   ↓
5. 6개월 후 → 아카이브 테이블 이동
   ↓
6. 2년 후 → 자동 삭제
```

### 익명화 & 삭제 경로
- **사용자 탈퇴**: 즉시 모든 데이터 삭제 (Hard Delete)
- **API 연동 해제**: 해당 플랫폼 데이터만 삭제

---

## 7. 외부 API 통합

### 플랫폼별 API 명세

| 플랫폼 | API 문서 | 인증 방식 | Rate Limit | 주요 엔드포인트 |
|--------|----------|-----------|------------|-----------------|
| **네이버 검색광고** | [문서](https://naver.github.io/searchad-apidoc/) | OAuth 2.0 | 1,000 req/day | /ncc/campaigns, /ncc/adgroups |
| **구글 애즈** | [문서](https://developers.google.com/google-ads/api) | OAuth 2.0 | 15,000 req/day | reports/search |
| **메타 광고** | [문서](https://developers.facebook.com/docs/marketing-apis) | Access Token | 200 req/hour | /insights |
| **쿠팡 윙** | [문서](https://wing-api.coupang.com/) | API Key | 1,000 req/day | /v2/providers/wing_api/apis |

### 에러 핸들링 전략

| 에러 유형 | 대응 |
|----------|------|
| **401 Unauthorized** | API 키 만료 → 사용자에게 이메일 알림 |
| **429 Rate Limit** | 지수 백오프 (1분, 5분, 30분 대기 후 재시도) |
| **500 Server Error** | 3회 재시도 → 실패 시 Sentry 알림 |
| **Timeout** | 30초 타임아웃 → 재시도 |

---

## 8. 시스템 다이어그램

### 컴포넌트 다이어그램

```
┌─────────────────────────────────────────────┐
│           사용자 (브라우저)                  │
└────────────┬────────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────────┐
│         Vercel Edge Network                  │
│  - CDN 캐싱                                  │
│  - Rate Limiting Middleware                 │
└────────────┬────────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────────┐
│         Next.js 14 Application               │
│                                              │
│  ┌──────────────┐  ┌──────────────┐        │
│  │  Pages/UI    │  │  API Routes  │        │
│  │  (RSC/SSR)   │  │  (Serverless)│        │
│  └──────────────┘  └──────────────┘        │
│         │                  │                 │
│         └──────┬───────────┘                 │
└────────────────┼────────────────────────────┘
                 │
       ┌─────────┴─────────┐
       │                   │
       ↓                   ↓
┌─────────────┐    ┌──────────────────┐
│  Supabase   │    │  External APIs   │
│             │    │                  │
│ - PostgreSQL│    │ - 네이버 광고    │
│ - Auth      │    │ - 구글 애즈      │
│ - Storage   │    │ - 메타 광고      │
│ - Realtime  │    │ - 쿠팡 윙        │
│ - Vault     │    │ - OpenAI         │
└─────────────┘    └──────────────────┘
       ↑                   ↑
       │                   │
       └───────┬───────────┘
               │
     ┌─────────┴─────────┐
     │  Upstash Redis    │
     │  + BullMQ         │
     │  (작업 스케줄러)   │
     └───────────────────┘
```

---

## 9. 개발 환경 구성

### 필수 도구

```bash
# Node.js & 패키지 매니저
Node.js: 20.x LTS
pnpm: 8.x (권장) 또는 npm

# 개발 도구
Git: 2.x
VS Code + 추천 확장:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - Database Client (Supabase 연동)
```

### 환경 변수

```env
# .env.local (로컬 개발)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx... (서버 전용)
OPENAI_API_KEY=sk-xxx...
UPSTASH_REDIS_URL=https://xxx.upstash.io
UPSTASH_REDIS_TOKEN=xxx...

# 외부 API 키 (사용자별로 Vault에 저장)
```

---

## 10. 배포 전략

### CI/CD 파이프라인

```
GitHub Push (main 브랜치)
    ↓
Vercel 자동 빌드
    ↓
Vercel Preview 배포 (staging.markeet.com)
    ↓
수동 승인
    ↓
Production 배포 (markeet.com)
```

### 환경 분리

| 환경 | URL | 목적 | 데이터베이스 |
|------|-----|------|--------------|
| **Development** | localhost:3000 | 로컬 개발 | Supabase Local (Docker) |
| **Staging** | staging.markeet.com | 테스트 | Supabase Staging Project |
| **Production** | markeet.com | 실서비스 | Supabase Production Project |

---

## 11. 모니터링 & 로깅

### 필수 모니터링

| 도구 | 목적 | 알림 조건 |
|------|------|-----------|
| **Vercel Analytics** | 트래픽, 성능 지표 | LCP > 3초 |
| **Sentry** | 에러 추적 | Error Rate > 1% |
| **Supabase Logs** | DB 쿼리, API 호출 | Slow Query > 1초 |
| **UptimeRobot** | Uptime 모니터링 | 5분 이상 다운 |
