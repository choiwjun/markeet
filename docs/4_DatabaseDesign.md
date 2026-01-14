# 마케트(Markeet) Database Design (데이터베이스 설계)

**프로젝트명:** 마케트(Markeet)  
**세션 ID:** MARKEET-2026-01-13  
**문서 버전:** v1.0  
**생성일:** 2026-01-13

---

## ERD (Entity Relationship Diagram)

```mermaid
erDiagram
    USERS ||--o{ PLATFORM_CONNECTIONS : owns
    USERS ||--o{ AD_DATA : owns
    USERS ||--o{ REPORTS : generates
    USERS ||--o{ CHAT_HISTORY : has
    
    PLATFORM_CONNECTIONS ||--o{ AD_DATA : sources
    
    USERS {
        uuid id PK
        string email UK
        string encrypted_password
        timestamp created_at
        timestamp last_login
        string subscription_plan "free/starter/pro/enterprise"
        timestamp subscription_expires_at
    }
    
    PLATFORM_CONNECTIONS {
        uuid id PK
        uuid user_id FK
        string platform "naver/google/meta/coupang..."
        text api_key_encrypted "Vault 암호화"
        json api_config "플랫폼별 추가 설정"
        string status "active/expired/error"
        timestamp last_sync_at
        timestamp created_at
        UNIQUE(user_id, platform)
    }
    
    AD_DATA {
        uuid id PK
        uuid user_id FK
        uuid platform_connection_id FK
        date date "데이터 날짜"
        string campaign_id
        string campaign_name
        decimal spend "광고비"
        decimal revenue "매출"
        integer impressions "노출"
        integer clicks "클릭"
        integer conversions "전환"
        decimal ctr "클릭률"
        decimal cvr "전환율"
        decimal roas "ROAS"
        json raw_data "원본 API 응답"
        timestamp created_at
        INDEX(user_id, date)
        INDEX(platform_connection_id, date)
    }
    
    REPORTS {
        uuid id PK
        uuid user_id FK
        string type "weekly/monthly/custom"
        date period_start
        date period_end
        json data_summary "집계 데이터"
        json insights "자동 생성 인사이트"
        text pdf_url "생성된 PDF URL"
        timestamp created_at
    }
    
    CHAT_HISTORY {
        uuid id PK
        uuid user_id FK
        text question "사용자 질문"
        text answer "AI 답변"
        text sql_query "실행된 쿼리"
        json chart_data "생성된 차트 데이터"
        timestamp created_at
    }
```

---

## 테이블 상세 명세

### 1. users (사용자)

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | 사용자 고유 ID |
| email | VARCHAR(255) | UNIQUE, NOT NULL | 이메일 (로그인 ID) |
| encrypted_password | TEXT | NOT NULL | 암호화된 비밀번호 (Supabase Auth 처리) |
| created_at | TIMESTAMP | DEFAULT NOW() | 가입일시 |
| last_login | TIMESTAMP | NULL | 마지막 로그인 |
| subscription_plan | VARCHAR(50) | DEFAULT 'free' | 구독 플랜 |
| subscription_expires_at | TIMESTAMP | NULL | 구독 만료일 |

**인덱스**:
- PRIMARY KEY (id)
- UNIQUE INDEX (email)

**RLS 정책**:
```sql
CREATE POLICY "Users can view own account"
ON users FOR SELECT
USING (auth.uid() = id);
```

**샘플 데이터**:
```sql
INSERT INTO users (email, subscription_plan) VALUES
('kim@example.com', 'starter'),
('lee@example.com', 'pro');
```

---

### 2. platform_connections (플랫폼 연동)

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | UUID | PK | 연동 고유 ID |
| user_id | UUID | FK → users(id), NOT NULL | 소유자 |
| platform | VARCHAR(50) | NOT NULL | 플랫폼 코드 (naver/google/meta/coupang 등) |
| api_key_encrypted | TEXT | NULL | 암호화된 API 키 (Supabase Vault) |
| api_config | JSONB | NULL | 플랫폼별 추가 설정 (예: Google OAuth token) |
| status | VARCHAR(20) | DEFAULT 'active' | active/expired/error |
| last_sync_at | TIMESTAMP | NULL | 마지막 동기화 시간 |
| created_at | TIMESTAMP | DEFAULT NOW() | 연동 생성일 |

**제약조건**:
- UNIQUE (user_id, platform) - 동일 플랫폼 중복 연동 방지

**인덱스**:
- PRIMARY KEY (id)
- INDEX (user_id, platform)
- INDEX (user_id, status)

**RLS 정책**:
```sql
CREATE POLICY "Users manage own connections"
ON platform_connections FOR ALL
USING (auth.uid() = user_id);
```

**플랫폼 코드 표**:
| 코드 | 플랫폼명 |
|------|----------|
| naver | 네이버 검색광고 |
| google | 구글 애즈 |
| meta | 메타 광고 |
| coupang | 쿠팡 윙 |
| gmarket | 지마켓 |
| eleventh | 11번가 |
| kakao | 카카오모먼트 |
| naver_store | 네이버 스마트스토어 |
| ga4 | Google Analytics 4 |
| naver_analytics | 네이버 애널리틱스 |

**샘플 데이터**:
```sql
INSERT INTO platform_connections (user_id, platform, status, last_sync_at) VALUES
(:user_id, 'naver', 'active', NOW()),
(:user_id, 'coupang', 'active', NOW() - INTERVAL '1 hour');
```

---

### 3. ad_data (광고 데이터)

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | UUID | PK | 데이터 레코드 ID |
| user_id | UUID | FK → users(id), NOT NULL | 소유자 |
| platform_connection_id | UUID | FK → platform_connections(id), NOT NULL | 데이터 출처 |
| date | DATE | NOT NULL | 데이터 날짜 (일별 집계) |
| campaign_id | VARCHAR(255) | NULL | 캠페인 ID (플랫폼 제공) |
| campaign_name | VARCHAR(500) | NULL | 캠페인명 |
| spend | DECIMAL(12,2) | DEFAULT 0 | 광고비 (원화) |
| revenue | DECIMAL(12,2) | DEFAULT 0 | 매출 (원화) |
| impressions | INTEGER | DEFAULT 0 | 노출수 |
| clicks | INTEGER | DEFAULT 0 | 클릭수 |
| conversions | INTEGER | DEFAULT 0 | 전환수 |
| ctr | DECIMAL(5,2) | NULL | 클릭률 (%) |
| cvr | DECIMAL(5,2) | NULL | 전환율 (%) |
| roas | DECIMAL(8,2) | NULL | ROAS (매출/광고비) |
| raw_data | JSONB | NULL | 원본 API 응답 (디버깅용) |
| created_at | TIMESTAMP | DEFAULT NOW() | 수집 시각 |

**인덱스**:
- PRIMARY KEY (id)
- INDEX (user_id, date DESC) - 날짜별 조회 최적화
- INDEX (platform_connection_id, date DESC)
- INDEX (user_id, campaign_id)

**RLS 정책**:
```sql
CREATE POLICY "Users can view own ad data"
ON ad_data FOR SELECT
USING (auth.uid() = user_id);
```

**계산 필드 (트리거 or 애플리케이션 레벨)**:
```sql
-- CTR 계산
ctr = (clicks / impressions) * 100

-- CVR 계산
cvr = (conversions / clicks) * 100

-- ROAS 계산
roas = revenue / spend
```

**샘플 데이터**:
```sql
INSERT INTO ad_data (user_id, platform_connection_id, date, spend, revenue, impressions, clicks, conversions, roas)
VALUES
(:user_id, :platform_id, CURRENT_DATE, 100000, 320000, 50000, 2500, 80, 3.2),
(:user_id, :platform_id, CURRENT_DATE - 1, 95000, 285000, 48000, 2400, 75, 3.0),
(:user_id, :platform_id, CURRENT_DATE - 2, 110000, 352000, 52000, 2600, 88, 3.2);
```

---

### 4. reports (리포트)

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | UUID | PK | 리포트 ID |
| user_id | UUID | FK → users(id), NOT NULL | 소유자 |
| type | VARCHAR(20) | NOT NULL | weekly/monthly/custom |
| period_start | DATE | NOT NULL | 리포트 시작 날짜 |
| period_end | DATE | NOT NULL | 리포트 종료 날짜 |
| data_summary | JSONB | NULL | 집계된 데이터 (총 광고비, ROAS 등) |
| insights | JSONB | NULL | AI 생성 인사이트 텍스트 |
| pdf_url | TEXT | NULL | Supabase Storage 경로 |
| created_at | TIMESTAMP | DEFAULT NOW() | 생성 시각 |

**인덱스**:
- PRIMARY KEY (id)
- INDEX (user_id, created_at DESC)

**RLS 정책**:
```sql
CREATE POLICY "Users can view own reports"
ON reports FOR SELECT
USING (auth.uid() = user_id);
```

**data_summary JSON 구조 예시**:
```json
{
  "total_spend": 2850000,
  "total_revenue": 9120000,
  "avg_roas": 3.2,
  "total_impressions": 1500000,
  "total_clicks": 75000,
  "total_conversions": 2400,
  "platform_breakdown": {
    "naver": { "spend": 1200000, "revenue": 3840000 },
    "coupang": { "spend": 950000, "revenue": 3040000 },
    "google": { "spend": 700000, "revenue": 2240000 }
  }
}
```

**샘플 데이터**:
```sql
INSERT INTO reports (user_id, type, period_start, period_end, data_summary)
VALUES
(:user_id, 'weekly', CURRENT_DATE - 7, CURRENT_DATE, '{
  "total_spend": 2850000,
  "total_revenue": 9120000,
  "avg_roas": 3.2
}'::jsonb);
```

---

### 5. chat_history (자연어 질의 기록) - Phase 2

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | UUID | PK | 대화 ID |
| user_id | UUID | FK → users(id), NOT NULL | 질문자 |
| question | TEXT | NOT NULL | 사용자 질문 |
| answer | TEXT | NOT NULL | AI 답변 |
| sql_query | TEXT | NULL | 실행된 SQL (디버깅용) |
| chart_data | JSONB | NULL | 생성된 차트 데이터 |
| created_at | TIMESTAMP | DEFAULT NOW() | 질문 시각 |

**인덱스**:
- PRIMARY KEY (id)
- INDEX (user_id, created_at DESC)

**RLS 정책**:
```sql
CREATE POLICY "Users can view own chat history"
ON chat_history FOR SELECT
USING (auth.uid() = user_id);
```

**샘플 데이터**:
```sql
INSERT INTO chat_history (user_id, question, answer, sql_query)
VALUES
(:user_id, 
 '왜 ROAS가 떨어졌어?',
 '인스타그램 30대 여성 타겟 광고의 클릭률은 높은데 구매 전환이 낮습니다. 랜딩페이지 로딩속도 확인이 필요합니다.',
 'SELECT platform, AVG(ctr), AVG(cvr) FROM ad_data WHERE ...');
```

---

## 샘플 쿼리

### 1. 대시보드 주요 지표 조회

```sql
-- 최근 7일 전체 성과
SELECT 
    SUM(spend) as total_spend,
    SUM(revenue) as total_revenue,
    AVG(roas) as avg_roas,
    SUM(clicks) as total_clicks,
    SUM(conversions) as total_conversions
FROM ad_data
WHERE user_id = :user_id
  AND date >= CURRENT_DATE - INTERVAL '7 days';
```

**예상 결과**:
```
total_spend  | total_revenue | avg_roas | total_clicks | total_conversions
2,850,000    | 9,120,000     | 3.2      | 75,000       | 2,400
```

---

### 2. 플랫폼별 비교

```sql
SELECT 
    pc.platform,
    SUM(ad.spend) as spend,
    SUM(ad.revenue) as revenue,
    AVG(ad.roas) as roas
FROM ad_data ad
JOIN platform_connections pc ON ad.platform_connection_id = pc.id
WHERE ad.user_id = :user_id
  AND ad.date >= :start_date
  AND ad.date <= :end_date
GROUP BY pc.platform
ORDER BY spend DESC;
```

**예상 결과**:
```
platform | spend     | revenue   | roas
naver    | 1,200,000 | 3,840,000 | 3.2
coupang  | 950,000   | 3,040,000 | 3.2
google   | 700,000   | 2,240,000 | 3.2
```

---

### 3. 일자별 추이

```sql
SELECT 
    date,
    SUM(spend) as daily_spend,
    SUM(revenue) as daily_revenue,
    AVG(roas) as daily_roas
FROM ad_data
WHERE user_id = :user_id
  AND date >= :start_date
  AND date <= :end_date
GROUP BY date
ORDER BY date ASC;
```

**예상 결과**:
```
date       | daily_spend | daily_revenue | daily_roas
2026-01-07 | 400,000     | 1,280,000     | 3.2
2026-01-08 | 410,000     | 1,312,000     | 3.2
2026-01-09 | 390,000     | 1,248,000     | 3.2
```

---

### 4. 캠페인별 성과 Top 10

```sql
SELECT 
    campaign_name,
    SUM(spend) as total_spend,
    SUM(revenue) as total_revenue,
    AVG(roas) as avg_roas,
    SUM(conversions) as total_conversions
FROM ad_data
WHERE user_id = :user_id
  AND date >= :start_date
  AND date <= :end_date
GROUP BY campaign_name
ORDER BY total_revenue DESC
LIMIT 10;
```

---

### 5. 성과 저조 캠페인 찾기 (ROAS < 2.0)

```sql
SELECT 
    pc.platform,
    ad.campaign_name,
    AVG(ad.roas) as avg_roas,
    SUM(ad.spend) as total_spend
FROM ad_data ad
JOIN platform_connections pc ON ad.platform_connection_id = pc.id
WHERE ad.user_id = :user_id
  AND ad.date >= CURRENT_DATE - 7
GROUP BY pc.platform, ad.campaign_name
HAVING AVG(ad.roas) < 2.0
ORDER BY avg_roas ASC;
```

---

## 데이터베이스 초기화 스크립트

### 전체 테이블 생성

```sql
-- UUID 확장 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- users 테이블
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    encrypted_password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    subscription_plan VARCHAR(50) DEFAULT 'free',
    subscription_expires_at TIMESTAMP
);

-- platform_connections 테이블
CREATE TABLE platform_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    api_key_encrypted TEXT,
    api_config JSONB,
    status VARCHAR(20) DEFAULT 'active',
    last_sync_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, platform)
);

CREATE INDEX idx_platform_connections_user ON platform_connections(user_id, platform);
CREATE INDEX idx_platform_connections_status ON platform_connections(user_id, status);

-- ad_data 테이블
CREATE TABLE ad_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    platform_connection_id UUID NOT NULL REFERENCES platform_connections(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    campaign_id VARCHAR(255),
    campaign_name VARCHAR(500),
    spend DECIMAL(12,2) DEFAULT 0,
    revenue DECIMAL(12,2) DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    ctr DECIMAL(5,2),
    cvr DECIMAL(5,2),
    roas DECIMAL(8,2),
    raw_data JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ad_data_user_date ON ad_data(user_id, date DESC);
CREATE INDEX idx_ad_data_platform_date ON ad_data(platform_connection_id, date DESC);
CREATE INDEX idx_ad_data_campaign ON ad_data(user_id, campaign_id);

-- reports 테이블
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    data_summary JSONB,
    insights JSONB,
    pdf_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reports_user ON reports(user_id, created_at DESC);

-- chat_history 테이블 (Phase 2)
CREATE TABLE chat_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sql_query TEXT,
    chart_data JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_chat_history_user ON chat_history(user_id, created_at DESC);
```

---

## RLS 정책 설정

```sql
-- RLS 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- users 정책
CREATE POLICY "Users can view own account"
ON users FOR SELECT
USING (auth.uid() = id);

-- platform_connections 정책
CREATE POLICY "Users manage own connections"
ON platform_connections FOR ALL
USING (auth.uid() = user_id);

-- ad_data 정책
CREATE POLICY "Users can view own ad data"
ON ad_data FOR SELECT
USING (auth.uid() = user_id);

-- reports 정책
CREATE POLICY "Users can view own reports"
ON reports FOR ALL
USING (auth.uid() = user_id);

-- chat_history 정책
CREATE POLICY "Users can view own chat history"
ON chat_history FOR ALL
USING (auth.uid() = user_id);
```

---

## 데이터 마이그레이션 전략

### 버전 관리

```
v1.0: 초기 스키마 (users, platform_connections, ad_data, reports)
v1.1: chat_history 추가 (Phase 2)
v2.0: 팀 기능 추가 시 (teams, team_members 테이블)
```

### 마이그레이션 파일 예시

**migrations/001_initial_schema.sql**
```sql
-- v1.0 초기 스키마
[위의 전체 테이블 생성 스크립트]
```

**migrations/002_add_chat_history.sql**
```sql
-- v1.1 chat_history 추가
CREATE TABLE chat_history (...);
```
