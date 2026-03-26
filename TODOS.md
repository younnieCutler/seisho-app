# TODOS.md — seisho-app

> 이 파일은 v1에서 명시적으로 이연된 작업 목록입니다.
> CEO Review (2026-03-24) 및 plan review 섹션에서 식별됨.

---

## P1 — v1 배포 직후 우선 구현

### [TODO-01] 오프라인 최초 실행 플로우
**What:** 앱 최초 실행 시 네트워크 없으면 익명 인증 실패 → 온보딩 멈춤 문제 수정.
**Why:** Supabase 익명 인증이 네트워크 필수. 오프라인 첫 실행 유저가 앱을 버릴 수 있음.
**Pros:** 네트워크 없는 환경에서도 온보딩 완료 가능.
**Cons:** 로컬 UUID → Supabase 연동 시점 복잡도 증가.
**Context:** 로컬 UUID를 MMKV에 먼저 생성 → 네트워크 복원 시 Supabase 익명 세션과 연동.
**Effort:** S (human: 1일 / CC: ~15분)
**Depends on:** Feature 4 (읽기 완료 체크) 오프라인 동기화

---

### [TODO-02] Sentry / 에러 추적 통합
**What:** Sentry SDK 연동. 크래시 + 에러 자동 리포팅.
**Why:** 배포 후 크래시 발생 시 로그 없으면 원인 파악 불가. 1인 프로젝트에서 더 중요.
**Pros:** 크래시 스택 트레이스, 발생 빈도, 영향 유저 수 즉시 확인.
**Cons:** Sentry 무료 티어 한계 (5K 이벤트/월) — v1 규모에서 충분.
**Context:** `expo-sentry` 패키지 사용. SQLite 초기화 실패, computus 예외 등 CRITICAL GAP 케이스에 특히 중요.
**Effort:** S (human: 4시간 / CC: ~10분)
**Depends on:** Expo 초기화

---

### [TODO-03] 카카오톡+LINE 소그룹 코드 공유 딥링크
**What:** 소그룹 코드를 카카오톡/LINE으로 공유하는 딥링크 생성 기능.
**Why:** Cold start 문제 해결. 소그룹 리더가 멤버를 초대하는 주요 채널.
**Pros:** 바이럴 루프 핵심 메커니즘. 한국 시장 주요 메신저 동시 지원.
**Cons:** 카카오톡 SDK 설정 (카카오 앱 등록 필요), LINE SDK 별도 설정.
**Context:** 카카오톡 + LINE 동시 구현. 딥링크 스키마: `seishoapp://join/{group_code}`.
**Effort:** M (human: 2일 / CC: ~30분)
**Depends on:** Feature 6 (소그룹 코드 생성/참여)

---

## P2 — v2 초기

### [TODO-04] 소그룹 코드 생성 Rate-Limit
**What:** 소그룹 코드 생성 제한 (1코드/사용자/1시간).
**Why:** v1에서는 abuse 리스크 낮음 (신뢰 기반 소규모 그룹). 규모 확장 시 필요.
**Pros:** 코드 네임스페이스 보호, 스팸 방지.
**Cons:** Supabase RLS + Edge Function 추가 복잡도.
**Context:** `generate_group_code()` RPC 함수에 rate-limit 로직 추가.
**Effort:** S (human: 4시간 / CC: ~10분)
**Depends on:** [TODO-01] 이후 사용자 수 증가 추이 모니터링

---

### [TODO-05] 소그룹 피드 신고 기능
**What:** 부적절한 나눔 글 신고 버튼.
**Why:** v1은 신뢰 기반 소규모 그룹 전제 → 모더레이션 불필요. 규모 확장 시 필요.
**Pros:** 커뮤니티 안전, 앱스토어 심사 기준 충족.
**Cons:** 신고 처리 플로우 (관리자 알림) 추가 구현 필요.
**Context:** 소그룹 피드 장문 스와이프 → 신고 액션. v2 관리자 대시보드와 연동.
**Effort:** M (human: 2일 / CC: ~30분)
**Depends on:** v2 관리자 대시보드

---

### [TODO-06] 잔디 절기별 색상 구분
**What:** 잔디 그래프 셀 색상을 절기에 따라 변경 (사순절 = 보라, 대림절 = 파랑 등).
**Why:** 신앙 절기의 시각적 맥락 강화.
**Cons:** v2 테마 시스템과 함께 구현이 효율적. v1 단독 구현은 테마 시스템과 충돌 가능.
**Effort:** S (human: 1일 / CC: ~15분)
**Depends on:** v2 테마 시스템

---

## P0 — 구현 시작 전 필수 검증

### ~~[TODO-07] computus@3.x + Temporal.PlainDate Hermes 호환성 검증~~ ✅ DONE (2026-03-26)
**결과:** iOS Expo Go (SDK 54, Hermes) 에서 4개 테스트 전부 PASS.
- `computus(2026).month === 4` ✅
- `computus(2026).day === 5` ✅
- `Temporal.Now.plainDateISO('Asia/Seoul')` → 유효 날짜 ✅
- `Temporal.PlainDate.from('2026-04-05').month === 4` ✅

---

## P1 — v1 배포 직후 우선 구현 (추가 항목)

### ~~[TODO-08] SQLite 첫 실행 로딩 UI~~ ✅ DONE (2026-03-26)
**What:** SQLite 데이터베이스 복사 중 로딩 스피너/화면 표시.
**Why:** 첫 실행 시 5~10초 복사 대기 동안 앱이 멈춰 보일 수 있어 사용자가 이탈할 가능성.
**Pros:** 첫 인상 개선, "앱이 죽었나" 오인 방지.
**Context:** `DatabaseInitScreen`: 로고 + 스피너 + "성경 데이터를 준비 중입니다..." 문구. 복사 완료 시 홈 화면으로 자동 전환. DatabaseErrorScreen과 분리 구현.
**Effort:** S (human: 2시간 / CC: ~10분)
**Depends on:** Feature 3 (SQLite 번들) 구현

---

### [TODO-09] 잔디 그래프 연간 뷰
**What:** 1년치 52주 전체 잔디 그래프 화면 (GitHub Profile 스타일 연간 리뷰).
**Why:** v1은 최근 12주로 제한 (모바일 터치 가능 크기 확보) → 연간 회고 뷰는 v2 이연.
**Pros:** 연간 신앙 루틴 시각화, 장기 유저 리텐션 효과.
**Cons:** 모바일에서 셀이 작아 별도 UI 설계 필요.
**Context:** v2 연간 리뷰 화면에서 구현. v1 항목이 아님.
**Effort:** M (human: 2일 / CC: ~30분)
**Depends on:** Feature 5 (잔디 그래프) 구현
