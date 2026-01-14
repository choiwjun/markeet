# 마케트(Markeet) Design System (기초 디자인 시스템)

**프로젝트명:** 마케트(Markeet)  
**세션 ID:** MARKEET-2026-01-13  
**문서 버전:** v1.0  
**생성일:** 2026-01-13

---

## 디자인 철학

**마케트의 디자인 원칙:**
1. **전문성 + 친근함**: 구글 애널리틱스의 데이터 중심성 + 토스의 직관적 디자인
2. **간결한 정보 전달**: 불필요한 장식 없이 데이터에 집중
3. **시각적 계층**: 중요한 정보가 먼저 눈에 들어옴
4. **반응형 우선**: PC와 모바일 모두에서 최적 경험

---

## 색상 팔레트 (Color Tokens)

### Primary Colors (주색상 - 브랜드 아이덴티티)

```css
--color-primary-50: #EFF6FF;   /* 가장 밝은 파랑 */
--color-primary-100: #DBEAFE;
--color-primary-200: #BFDBFE;
--color-primary-300: #93C5FD;
--color-primary-400: #60A5FA;
--color-primary-500: #3B82F6;  /* 메인 브랜드 컬러 */
--color-primary-600: #2563EB;  /* 호버 상태 */
--color-primary-700: #1D4ED8;
--color-primary-800: #1E40AF;
--color-primary-900: #1E3A8A;
```

**사용처:**
- 주요 CTA 버튼 (Primary-600)
- 링크 (Primary-500)
- 선택된 탭/네비게이션 (Primary-50 배경 + Primary-600 텍스트)

---

### Neutral Colors (중립색 - 텍스트/배경)

```css
--color-gray-50: #F9FAFB;    /* 페이지 배경 */
--color-gray-100: #F3F4F6;   /* 카드 배경 */
--color-gray-200: #E5E7EB;   /* 보더 */
--color-gray-300: #D1D5DB;
--color-gray-400: #9CA3AF;   /* Placeholder */
--color-gray-500: #6B7280;   /* 보조 텍스트 */
--color-gray-600: #4B5563;   /* 본문 텍스트 */
--color-gray-700: #374151;
--color-gray-800: #1F2937;   /* 제목 */
--color-gray-900: #111827;   /* 강조 제목 */
```

---

### Semantic Colors (의미 색상 - 피드백)

```css
/* 성공 (긍정적 지표) */
--color-success-50: #F0FDF4;
--color-success-500: #22C55E;  /* ROAS 상승, 성공 메시지 */
--color-success-700: #15803D;

/* 경고 (주의 필요) */
--color-warning-50: #FFFBEB;
--color-warning-500: #F59E0B;  /* 예산 80% 소진 */
--color-warning-700: #B45309;

/* 위험 (즉시 조치) */
--color-danger-50: #FEF2F2;
--color-danger-500: #EF4444;   /* ROAS 하락, 에러 */
--color-danger-700: #B91C1C;

/* 정보 */
--color-info-50: #EFF6FF;
--color-info-500: #3B82F6;     /* 알림, 안내 */
--color-info-700: #1D4ED8;
```

---

## 타이포그래피 (Typography)

### 폰트 패밀리

```css
--font-sans: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, 
             Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 
             'Noto Sans KR', sans-serif;

--font-mono: 'JetBrains Mono', 'SF Mono', Monaco, 'Cascadia Code', 
             'Roboto Mono', Consolas, 'Courier New', monospace;
```

**폰트 선택 이유:**
- **Pretendard**: 한글 최적화, 가독성 우수, 토스 스타일
- **JetBrains Mono**: 숫자/데이터 표시용 (ROAS, 금액)

---

### 폰트 스케일

| 용도 | 크기 (px) | Line Height | Font Weight | CSS Variable |
|------|-----------|-------------|-------------|--------------|
| **Heading 1** | 36 | 1.2 | 700 (Bold) | --text-4xl |
| **Heading 2** | 30 | 1.3 | 700 | --text-3xl |
| **Heading 3** | 24 | 1.4 | 600 (Semi-Bold) | --text-2xl |
| **Heading 4** | 20 | 1.5 | 600 | --text-xl |
| **Body Large** | 18 | 1.6 | 400 (Regular) | --text-lg |
| **Body** | 16 | 1.6 | 400 | --text-base |
| **Body Small** | 14 | 1.5 | 400 | --text-sm |
| **Caption** | 12 | 1.4 | 400 | --text-xs |

**사용 예시:**
- Heading 2: 대시보드 섹션 제목 ("이번 주 성과")
- Body: 본문 텍스트
- Caption: 차트 범례, 부가 설명
- Font Mono: 숫자 (₩1,234,567, ROAS 3.2)

---

## 간격 시스템 (Spacing)

```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-5: 1.25rem;  /* 20px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-10: 2.5rem;  /* 40px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
```

**사용 원칙:**
- 컴포넌트 내부 여백: space-4 (16px)
- 카드 간 간격: space-6 (24px)
- 섹션 간 간격: space-12 (48px)

---

## 컴포넌트 명세

### 1. Button (버튼)

#### Primary Button (주요 액션)

**기본 상태:**
```css
background: var(--color-primary-600);
color: white;
padding: 12px 24px;
border-radius: 8px;
font-weight: 600;
font-size: 16px;
```

**상태별:**
- **Hover**: background → Primary-700, transform: translateY(-1px)
- **Active**: background → Primary-800
- **Disabled**: background → Gray-300, color → Gray-500, cursor: not-allowed
- **Loading**: 로딩 스피너 + "처리 중..." 텍스트

**사용처:** "리포트 생성", "플랫폼 연동", "저장"

---

#### Secondary Button (보조 액션)

**기본 상태:**
```css
background: transparent;
color: var(--color-primary-600);
border: 2px solid var(--color-primary-600);
padding: 12px 24px;
border-radius: 8px;
```

**상태별:**
- **Hover**: background → Primary-50
- **Disabled**: color → Gray-400, border-color → Gray-300

**사용처:** "취소", "설정 변경"

---

#### Ghost Button (텍스트 버튼)

**기본 상태:**
```css
background: transparent;
color: var(--color-gray-600);
padding: 8px 16px;
```

**상태별:**
- **Hover**: background → Gray-100

**사용처:** "자세히 보기", "접기"

---

### 2. Input Field (입력 필드)

**기본 상태:**
```css
width: 100%;
padding: 12px 16px;
border: 2px solid var(--color-gray-200);
border-radius: 8px;
font-size: 16px;
background: white;
```

**상태별:**
- **Focus**: border-color → Primary-500, outline → 0, box-shadow → 0 0 0 3px Primary-100
- **Error**: border-color → Danger-500, 하단에 에러 메시지 (Danger-600 텍스트)
- **Disabled**: background → Gray-50, color → Gray-400

**예시:**
```
[API 키 입력] 
┌─────────────────────────────────┐
│ AK1234567890abcdef            │
└─────────────────────────────────┘
```

---

### 3. Card (카드)

**기본 스타일:**
```css
background: white;
padding: var(--space-6);
border-radius: 12px;
box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
border: 1px solid var(--color-gray-200);
```

**상태별:**
- **Hover** (클릭 가능 시): box-shadow → 0 4px 6px rgba(0, 0, 0, 0.1), transform: translateY(-2px)

**사용처:** 플랫폼별 성과 카드, 주요 지표 카드

---

### 4. Table (테이블)

**스타일:**
```css
/* 헤더 */
thead th {
  background: var(--color-gray-50);
  color: var(--color-gray-700);
  font-weight: 600;
  padding: 12px 16px;
  border-bottom: 2px solid var(--color-gray-300);
}

/* 행 */
tbody tr {
  border-bottom: 1px solid var(--color-gray-200);
}

tbody tr:hover {
  background: var(--color-gray-50);
}

tbody td {
  padding: 12px 16px;
  color: var(--color-gray-600);
}
```

**숫자 열 정렬:** text-align: right, font-family: var(--font-mono)

---

### 5. Badge (뱃지)

**유형별:**

```css
/* 상태 뱃지 */
.badge-success {
  background: var(--color-success-100);
  color: var(--color-success-700);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.badge-warning {
  background: var(--color-warning-100);
  color: var(--color-warning-700);
}

.badge-danger {
  background: var(--color-danger-100);
  color: var(--color-danger-700);
}
```

**사용처:** 
- "연동 중" (Success)
- "예산 80% 소진" (Warning)
- "API 키 만료" (Danger)

---

### 6. Chart (차트)

**Recharts 스타일 가이드:**

```javascript
// 공통 차트 설정
const chartConfig = {
  margin: { top: 20, right: 30, left: 0, bottom: 5 },
  colors: {
    primary: '#2563EB',   // Primary-600
    success: '#22C55E',   // Success-500
    warning: '#F59E0B',   // Warning-500
    danger: '#EF4444'     // Danger-500
  },
  grid: {
    stroke: '#E5E7EB',    // Gray-200
    strokeDasharray: '3 3'
  },
  axis: {
    stroke: '#9CA3AF',    // Gray-400
    fontSize: 12
  },
  tooltip: {
    contentStyle: {
      background: 'white',
      border: '1px solid #E5E7EB',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    }
  }
};
```

**차트 유형:**
- **Line Chart**: 일자별 추이 (광고비, 매출)
- **Bar Chart**: 플랫폼별 비교
- **Area Chart**: 누적 성과

---

## 반응형 브레이크포인트

```css
/* Mobile First 접근 */
--breakpoint-sm: 640px;   /* 모바일 */
--breakpoint-md: 768px;   /* 태블릿 */
--breakpoint-lg: 1024px;  /* 데스크톱 */
--breakpoint-xl: 1280px;  /* 큰 화면 */
```

**레이아웃 전략:**
- **Mobile (<640px)**: 1열, 메뉴는 햄버거
- **Tablet (640px~1024px)**: 2열, 사이드바 접기 가능
- **Desktop (>1024px)**: 3열 + 고정 사이드바

---

## 아이콘 시스템

**아이콘 라이브러리:** Lucide React (토스 스타일과 유사)

**주요 아이콘:**
- `TrendingUp` / `TrendingDown`: ROAS 증감
- `DollarSign`: 광고비, 매출
- `Users`: 클릭, 전환
- `BarChart3`: 대시보드
- `FileText`: 리포트
- `Settings`: 설정
- `AlertTriangle`: 경고
- `CheckCircle`: 성공

---

## 접근성 (Accessibility)

### 최소 기준

| 항목 | 기준 | 검증 방법 |
|------|------|-----------|
| **색상 대비비** | 4.5:1 이상 (텍스트) | WebAIM Contrast Checker |
| **포커스 표시** | 명확한 outline (Primary-500 2px) | 키보드 탭 테스트 |
| **키보드 탐색** | 모든 인터랙션 요소 Tab으로 접근 가능 | 마우스 없이 테스트 |
| **스크린 리더** | 모든 버튼/링크에 aria-label | NVDA / VoiceOver 테스트 |

### ARIA 레이블 예시

```html
<button aria-label="네이버 광고 플랫폼 연동">
  <PlusIcon /> 플랫폼 추가
</button>

<input 
  type="text" 
  aria-label="API 키 입력" 
  aria-describedby="api-key-help"
/>
<span id="api-key-help" className="text-sm text-gray-500">
  네이버 광고관리시스템에서 발급받은 API 키를 입력하세요
</span>
```

---

## 디자인 토큰 전체 요약

```css
:root {
  /* Colors - Primary */
  --color-primary-50: #EFF6FF;
  --color-primary-600: #2563EB;
  
  /* Colors - Semantic */
  --color-success-500: #22C55E;
  --color-warning-500: #F59E0B;
  --color-danger-500: #EF4444;
  
  /* Colors - Neutral */
  --color-gray-50: #F9FAFB;
  --color-gray-600: #4B5563;
  
  /* Typography */
  --font-sans: 'Pretendard', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --text-base: 16px;
  
  /* Spacing */
  --space-4: 1rem;
  --space-6: 1.5rem;
  
  /* Breakpoints */
  --breakpoint-lg: 1024px;
}
```
