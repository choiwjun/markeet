# 마케트(Markeet) Phase 2 태스크 문서

**프로젝트명:** 마케트(Markeet)
**문서 버전:** v1.0
**생성일:** 2026-01-15
**기반 문서:** PRD, TRD, UserFlow, DatabaseDesign

---

## 개요

이 문서는 Phase 1 (MVP) 완료 후, PRD/TRD/UserFlow에 명시된 기능 중 미구현된 항목들을 정리합니다.

### Phase 1 완료 현황 (M0~M6)
- 프로젝트 초기화 ✅
- 데이터베이스 설정 ✅
- 공통 UI 컴포넌트 ✅
- 인증 시스템 (회원가입, 로그인) ✅
- 플랫폼 연동 (API 키 입력, 연결 테스트) ✅
- 대시보드 (지표 카드, 차트) ✅
- 랜딩페이지 ✅

### Phase 2 목표
PRD/UserFlow에 명시되었으나 미구현된 핵심 기능들을 완성합니다.

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
| M7 | 인증 보완 | 6 |
| M8 | 알림 시스템 | 8 |
| M9 | AI 자연어 질의 | 12 |
| M10 | 리포트 생성 | 10 |
| M11 | 설정 페이지 | 6 |
| M12 | 대시보드 고도화 | 8 |
| M13 | 모바일 최적화 | 4 |

**총 태스크: 54개**

---

## M7: 인증 보완

### TASK-701: 비밀번호 재설정 요청 폼 구현
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** 이메일 입력 후 비밀번호 재설정 링크 발송
- **테스트:** `유효한 이메일 입력 시 재설정 이메일 발송`
- **파일:** `app/(auth)/forgot-password/page.tsx`, `components/auth/ForgotPasswordForm.tsx`
- **근거:** UserFlow - 에러 처리 흐름

### TASK-702: 비밀번호 재설정 API 연동
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** Supabase Auth resetPasswordForEmail 호출
- **테스트:** `재설정 링크 발송 성공 시 확인 메시지 표시`
- **파일:** `lib/supabase/auth.ts`

### TASK-703: 비밀번호 재설정 완료 페이지
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** 이메일 링크 클릭 후 새 비밀번호 입력 페이지
- **테스트:** `유효한 토큰으로 접근 시 새 비밀번호 입력 가능`
- **파일:** `app/(auth)/reset-password/page.tsx`

### TASK-704: 이메일 인증 재발송 기능
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** 인증 이메일 미수신 시 재발송 버튼
- **테스트:** `재발송 버튼 클릭 시 새 인증 이메일 발송`
- **파일:** `app/(auth)/signup/verify-email/page.tsx`

### TASK-705: 세션 만료 처리
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** 세션 만료 시 자동 로그아웃 및 리다이렉트
- **테스트:** `세션 만료 시 로그인 페이지로 리다이렉트`
- **파일:** `middleware.ts`, `hooks/useAuth.ts`

### TASK-706: 로그인 유지 (Remember Me)
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** 로그인 유지 체크박스 기능
- **테스트:** `로그인 유지 체크 시 세션 연장`
- **파일:** `components/auth/LoginForm.tsx`

---

## M8: 알림 시스템

### TASK-801: 알림 데이터베이스 테이블 생성
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** notifications 테이블 스키마 생성
- **검증:** SQL 마이그레이션 스크립트 작성 완료
- **파일:** `supabase/migrations/003_notifications.sql`, `types/database.ts`

### TASK-802: 알림 API 엔드포인트 생성
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** 알림 목록 조회, 읽음 처리 API
- **테스트:** `알림 목록 조회 시 최신순 정렬`
- **파일:** `app/api/notifications/route.ts`, `app/api/notifications/[id]/route.ts`

### TASK-803: 헤더 알림 드롭다운 컴포넌트
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** 헤더 알림 아이콘 클릭 시 드롭다운 표시
- **검증:** 드롭다운 렌더링 테스트 통과
- **파일:** `components/layout/NotificationDropdown.tsx`
- **근거:** UserFlow - 대시보드 메인 화면 [알림] 버튼

### TASK-804: 알림 뱃지 (읽지 않은 알림 수)
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** 읽지 않은 알림 개수 뱃지 표시
- **테스트:** `읽지 않은 알림 3개일 때 뱃지에 3 표시`
- **파일:** `components/layout/Header.tsx`

### TASK-805: API 키 만료 알림 생성
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** API 키 만료 시 알림 자동 생성
- **테스트:** `API 호출 401 에러 시 알림 생성`
- **파일:** `lib/platforms/syncData.ts`
- **근거:** TRD - 에러 핸들링 전략 (401 Unauthorized)

### TASK-806: 이상 징후 감지 알림
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** 광고비 급증/급감, ROAS 급락 시 알림
- **테스트:** `광고비 30% 이상 증가 시 알림 생성`
- **파일:** `lib/alerts/anomalyDetection.ts`
- **근거:** UserFlow - 일일 루틴 흐름 (이상 징후 발견)

### TASK-807: 일일 이메일 알림 발송
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** 매일 아침 어제 성과 요약 이메일 발송
- **테스트:** `스케줄러 실행 시 이메일 발송`
- **파일:** `app/api/cron/daily-email/route.ts`, `lib/email/dailySummary.ts`
- **근거:** PRD - Sticky Loop (매일 아침 9시 이메일 알림)

### TASK-808: 알림 설정 관리
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** 알림 종류별 ON/OFF 설정
- **테스트:** `이메일 알림 OFF 시 이메일 미발송`
- **파일:** `app/(dashboard)/settings/notifications/page.tsx`

---

## M9: AI 자연어 질의

### TASK-901: AI 질의 입력 컴포넌트
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** 대시보드 AI 질문 입력창 동작 구현
- **검증:** 입력창 렌더링 및 포커스 테스트 통과
- **파일:** `components/ai/AiQueryInput.tsx`
- **근거:** UserFlow - FEAT-2 자연어 질의 흐름

### TASK-902: AI 질의 API 엔드포인트
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** 사용자 질문 → OpenAI API → SQL 생성 → 결과 반환
- **테스트:** `"이번 주 광고비 총액은?" 질문에 정확한 금액 반환`
- **파일:** `app/api/ai/query/route.ts`
- **근거:** TRD - AI 통합 (OpenAI API)

### TASK-903: SQL 생성 프롬프트 엔지니어링
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** 자연어 → SQL 변환을 위한 프롬프트 설계
- **테스트:** `다양한 질문 패턴에서 올바른 SQL 생성`
- **파일:** `lib/ai/sqlGenerator.ts`

### TASK-904: AI 응답 해석 및 자연어 변환
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** SQL 쿼리 결과를 사용자 친화적 답변으로 변환
- **테스트:** `쿼리 결과를 자연어로 설명`
- **파일:** `lib/ai/responseGenerator.ts`

### TASK-905: AI 채팅 UI 컴포넌트
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** 질문/답변 대화 형식 UI
- **검증:** 채팅 버블 렌더링 테스트 통과
- **파일:** `components/ai/AiChatPanel.tsx`
- **근거:** PRD - ChatGPT 스타일 대화 인터페이스

### TASK-906: 추천 질문 템플릿
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** 자주 묻는 질문 템플릿 버튼 표시
- **검증:** 템플릿 클릭 시 입력창에 자동 입력
- **파일:** `components/ai/SuggestedQuestions.tsx`
- **근거:** PRD - 추천 질문 템플릿 제공

### TASK-907: AI 응답 차트 자동 생성
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** 질의 결과에 맞는 차트 자동 생성
- **테스트:** `"플랫폼별 비교" 질문 시 막대 차트 표시`
- **파일:** `components/ai/AiResponseChart.tsx`
- **근거:** UserFlow - 답변 생성 및 표시 → 관련 차트 자동 생성

### TASK-908: AI 질의 히스토리 저장
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** 질문/답변 히스토리 저장 및 조회
- **테스트:** `이전 질문 히스토리 조회 가능`
- **파일:** `app/api/ai/history/route.ts`

### TASK-909: AI 응답 리포트 추가
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** AI 답변을 리포트에 저장
- **테스트:** `저장 버튼 클릭 시 리포트에 추가`
- **파일:** `components/ai/AiChatPanel.tsx`
- **근거:** UserFlow - 답변 저장 옵션 → 리포트에 추가

### TASK-910: AI 질의 Rate Limiting
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** 사용자별 일일 질의 제한 (비용 관리)
- **테스트:** `일일 한도 초과 시 제한 메시지 표시`
- **파일:** `app/api/ai/query/route.ts`
- **근거:** TRD - OpenAI API 비용 관리

### TASK-911: AI 질의 캐싱
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** 동일 질문에 대한 캐시 응답
- **테스트:** `동일 질문 재요청 시 캐시 응답 반환`
- **파일:** `lib/ai/queryCache.ts`
- **근거:** PRD - 쿼리 캐싱, 응답 제한

### TASK-912: AI 에러 처리
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** OpenAI API 에러 시 사용자 친화적 메시지
- **테스트:** `API 에러 시 재시도 안내 메시지 표시`
- **파일:** `components/ai/AiChatPanel.tsx`

---

## M10: 리포트 생성

### TASK-1001: 리포트 데이터베이스 테이블 확장
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** reports 테이블에 템플릿, 공유 설정 컬럼 추가
- **검증:** SQL 마이그레이션 스크립트 작성 완료
- **파일:** `supabase/migrations/004_reports_extension.sql`

### TASK-1002: 리포트 목록 페이지
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** 생성된 리포트 목록 표시 및 관리 UI
- **검증:** 리포트 목록 렌더링 테스트 통과
- **파일:** `app/(dashboard)/reports/page.tsx`
- **근거:** UserFlow - FEAT-3 리포트 목록 표시

### TASK-1003: 리포트 생성 모달
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** 기간/플랫폼 선택하여 리포트 생성
- **검증:** 모달 렌더링 테스트 통과
- **파일:** `components/reports/CreateReportModal.tsx`
- **근거:** UserFlow - 리포트 설정 화면

### TASK-1004: 리포트 생성 API
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** 선택된 기간/플랫폼 데이터 집계하여 리포트 생성
- **테스트:** `주간 리포트 생성 요청 시 데이터 집계 완료`
- **파일:** `app/api/reports/route.ts`

### TASK-1005: 리포트 상세 보기 페이지
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** 생성된 리포트 상세 내용 표시
- **검증:** 리포트 상세 렌더링 테스트 통과
- **파일:** `app/(dashboard)/reports/[id]/page.tsx`
- **근거:** UserFlow - 리포트 상세 보기

### TASK-1006: 리포트 PDF 생성
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** 리포트를 PDF 파일로 변환
- **테스트:** `PDF 다운로드 버튼 클릭 시 파일 다운로드`
- **파일:** `lib/reports/pdfGenerator.ts`
- **근거:** PRD - PDF 다운로드

### TASK-1007: 리포트 이메일 발송
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** 리포트를 이메일로 발송
- **테스트:** `이메일 발송 버튼 클릭 시 발송 완료`
- **파일:** `app/api/reports/[id]/send/route.ts`
- **근거:** PRD - 이메일 발송

### TASK-1008: 리포트 공유 링크 생성
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** 외부 공유 가능한 링크 생성
- **테스트:** `공유 링크로 접근 시 리포트 조회 가능`
- **파일:** `app/api/reports/[id]/share/route.ts`
- **근거:** UserFlow - 링크 생성

### TASK-1009: 주간 자동 리포트 스케줄러
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** 매주 월요일 자동 리포트 생성 및 이메일 발송
- **테스트:** `월요일 스케줄러 실행 시 주간 리포트 생성`
- **파일:** `app/api/cron/weekly-report/route.ts`
- **근거:** PRD - 주간/월간 자동 리포트

### TASK-1010: 리포트 삭제 기능
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** 리포트 삭제 (확인 다이얼로그 포함)
- **테스트:** `삭제 확인 후 리포트 삭제 완료`
- **파일:** `app/api/reports/[id]/route.ts`

---

## M11: 설정 페이지

### TASK-1101: 프로필 설정 페이지
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** 이름, 이메일, 프로필 이미지 설정
- **검증:** 프로필 설정 폼 렌더링 테스트 통과
- **파일:** `app/(dashboard)/settings/profile/page.tsx`

### TASK-1102: 비밀번호 변경 기능
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** 현재 비밀번호 확인 후 새 비밀번호 설정
- **테스트:** `올바른 현재 비밀번호 입력 시 변경 성공`
- **파일:** `app/(dashboard)/settings/security/page.tsx`

### TASK-1103: 알림 설정 페이지
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** 이메일/푸시 알림 ON/OFF 설정
- **검증:** 알림 설정 폼 렌더링 테스트 통과
- **파일:** `app/(dashboard)/settings/notifications/page.tsx`

### TASK-1104: 계정 삭제 기능
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** 계정 및 모든 데이터 삭제 (확인 절차 포함)
- **테스트:** `계정 삭제 확인 후 모든 데이터 삭제`
- **파일:** `app/api/user/delete/route.ts`
- **근거:** TRD - 익명화 & 삭제 경로 (Hard Delete)

### TASK-1105: 설정 사이드바 네비게이션
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** 설정 페이지 내 사이드바 네비게이션
- **검증:** 설정 메뉴 항목 렌더링 테스트 통과
- **파일:** `app/(dashboard)/settings/layout.tsx`

### TASK-1106: 데이터 내보내기 기능
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** 사용자 데이터 CSV/JSON 내보내기
- **테스트:** `내보내기 버튼 클릭 시 파일 다운로드`
- **파일:** `app/api/user/export/route.ts`

---

## M12: 대시보드 고도화

### TASK-1201: 지표 카드 드릴다운 페이지
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** 지표 카드 클릭 시 상세 분석 페이지로 이동
- **검증:** 드릴다운 페이지 렌더링 테스트 통과
- **파일:** `app/(dashboard)/dashboard/metrics/[type]/page.tsx`
- **근거:** UserFlow - 지표 카드 클릭 → 세부 화면

### TASK-1202: 플랫폼별 상세 페이지
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** 플랫폼별 캠페인, 광고그룹 상세 데이터
- **검증:** 플랫폼 상세 페이지 렌더링 테스트 통과
- **파일:** `app/(dashboard)/dashboard/platforms/[platform]/page.tsx`
- **근거:** UserFlow - 특정 플랫폼 클릭 → 세부 데이터 드릴다운

### TASK-1203: 캠페인 목록 테이블
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** 캠페인별 성과 데이터 테이블
- **검증:** 테이블 렌더링 및 정렬 테스트 통과
- **파일:** `components/dashboard/CampaignTable.tsx`

### TASK-1204: 온보딩 가이드 툴팁
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** 첫 방문 시 주요 기능 설명 툴팁
- **테스트:** `첫 방문 사용자에게 가이드 툴팁 표시`
- **파일:** `components/onboarding/GuideTour.tsx`
- **근거:** UserFlow - 가이드 툴팁: 주요 기능 소개

### TASK-1205: 데이터 새로고침 버튼
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** 수동 데이터 새로고침 기능
- **테스트:** `새로고침 버튼 클릭 시 데이터 갱신`
- **파일:** `app/(dashboard)/dashboard/page.tsx`
- **근거:** UserFlow - 새로고침 버튼 제공

### TASK-1206: 데이터 내보내기 (CSV)
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** 대시보드 데이터 CSV 다운로드
- **테스트:** `내보내기 버튼 클릭 시 CSV 파일 다운로드`
- **파일:** `lib/export/csvExport.ts`

### TASK-1207: 다크모드 토글 개선
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** 다크모드 전환 시 즉시 반영 및 설정 저장
- **테스트:** `다크모드 토글 시 즉시 테마 변경`
- **파일:** `components/layout/ThemeToggle.tsx`

### TASK-1208: 실시간 데이터 업데이트
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** Supabase Realtime으로 데이터 변경 시 자동 갱신
- **테스트:** `데이터 변경 시 대시보드 자동 업데이트`
- **파일:** `hooks/useRealtimeData.ts`
- **근거:** TRD - Supabase Realtime

---

## M13: 모바일 최적화

### TASK-1301: 모바일 하단 네비게이션 바
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** 모바일에서 하단 탭 네비게이션
- **검증:** 하단 네비게이션 렌더링 테스트 통과
- **파일:** `components/layout/MobileTabBar.tsx`
- **근거:** UserFlow - 반응형 UI 흐름 (하단 네비게이션 바)

### TASK-1302: 터치 제스처 지원
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** 스와이프로 메뉴 열기/닫기
- **테스트:** `오른쪽 스와이프 시 사이드바 열림`
- **파일:** `components/layout/MobileMenu.tsx`

### TASK-1303: 모바일 차트 최적화
- **상태:** `TODO`
- **타입:** BEHAVIORAL
- **설명:** 작은 화면에서 차트 간소화 표시
- **테스트:** `모바일에서 간소화된 차트 렌더링`
- **파일:** `components/charts/TrendLineChart.tsx`, `components/charts/PlatformBarChart.tsx`
- **근거:** UserFlow - 간소화된 차트 (작은 화면)

### TASK-1304: PWA 설정
- **상태:** `TODO`
- **타입:** STRUCTURAL
- **설명:** Progressive Web App 설정 (홈 화면 추가)
- **검증:** manifest.json, service worker 설정 완료
- **파일:** `public/manifest.json`, `public/sw.js`

---

## 우선순위 권장

### 높음 (즉시 구현 권장)
1. **M7: 인증 보완** - 비밀번호 찾기는 필수 기능
2. **M8: 알림 시스템** - Sticky Loop의 핵심
3. **M12: 대시보드 고도화** - 사용자 경험 개선

### 중간 (Phase 2 핵심)
4. **M9: AI 자연어 질의** - PRD의 FEAT-2
5. **M10: 리포트 생성** - PRD의 FEAT-3

### 낮음 (추후 구현)
6. **M11: 설정 페이지** - 부가 기능
7. **M13: 모바일 최적화** - PWA는 추후

---

## 태스크 실행 규칙

1. **순서 준수**: 마일스톤 순서대로 진행 (M7 → M8 → ...)
2. **의존성 체크**: 각 태스크의 선행 태스크가 완료되었는지 확인
3. **TDD 사이클**: Red → Green → Refactor
4. **커밋 분리**: 구조적 변경(STRUCTURAL)과 행위적 변경(BEHAVIORAL)을 별도 커밋
5. **중단 규칙**: 하나의 태스크 완료 후 즉시 중단, `"go"` 대기

---

## 변경 로그

| 날짜 | 버전 | 변경 내용 |
|------|------|-----------|
| 2026-01-15 | v1.0 | Phase 2 태스크 문서 초기 생성 (54개 태스크) |
