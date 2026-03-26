# seisho-app v1 전체 구현 페이즈 플랜

> 작성일: 2026-03-26 | 참조: [엔지니어링 결정 10건](memory/project_seisho_v1_eng_decisions.md) | [TODOS.md](../TODOS.md)

---

## 전체 페이즈 개요

| 페이즈 | 이름 | 상태 | 블로커 |
|--------|------|------|--------|
| **P0** | Hermes 호환성 검증 | 🔴 진행 중 (현재) | TODO-07 |
| **P1** | 프로젝트 기반 설정 | ⬜ 대기 | P0 완료 |
| **P2** | 성경 데이터 레이어 | ⬜ 대기 | P1 완료 |
| **P3** | 절기 엔진 | ⬜ 대기 | P0 완료 |
| **P4** | 코어 기능 (단독) | ⬜ 대기 | P2, P3 완료 |
| **P5** | Supabase 백엔드 | ⬜ 대기 | P1 완료 |
| **P6** | 소그룹 기능 | ⬜ 대기 | P4, P5 완료 |
| **P7** | 테스트 & 품질 | ⬜ 대기 | P6 완료 |
| **P8** | 배포 | ⬜ 대기 | P7 완료 |

---

## Phase 0 — Hermes 호환성 검증 (TODO-07, P0 블로커)

**목표**: `computus@3.x` + `@js-temporal/polyfill@^0.4.4`가 Android/Hermes에서 정상 동작하는지 확인.

> ⚠️ 실패 시: computus@1.x(`Date` 객체 반환, `.getMonth()` 0-indexed) 또는 순수 JS로 대안 결정

### Pass 기준

| 검증 항목 | 기대값 |
|-----------|--------|
| `computus(2026).month` | `4` (April, 1-indexed) |
| `computus(2026).day` | `5` (2026-04-05 부활절) |
| `Temporal.Now.plainDateISO('Asia/Seoul')` | 오늘 KST 날짜 |
| `Temporal.PlainDate.from('2026-04-05').month` | `4` |
| Android/Hermes 런타임 에러 없음 | — |

### 실행 순서

**Step 1** — Expo 프로젝트 초기화 (지금 가능)
```bash
npx create-expo-app@latest . --template blank-typescript
```
- verify: `cat app.json | grep jsEngine` → `"hermes"`

**Step 2** — 의존성 설치 (지금 가능)
```bash
npm install computus@3
npm install @js-temporal/polyfill@^0.4.4
```

**Step 3** — 검증 컴포넌트 작성 `src/debug/HermesValidation.tsx` (지금 가능)
```tsx
import { computus } from 'computus'
import { Temporal } from '@js-temporal/polyfill'

// App.tsx에서 렌더링, 에뮬레이터에서 결과 확인
```

**Step 4** — Android 에뮬레이터에서 실행 (에뮬레이터 설정 후)
```bash
npx expo run:android
```

**Step 5** — 결과 기록
- PASS → `CLAUDE.md` Gotchas 업데이트, `TODOS.md` TODO-07 완료, `src/debug/` 삭제
- FAIL → 대안 라이브러리 결정 후 엔지니어링 메모리 업데이트

---

## Phase 1 — 프로젝트 기반 설정

**전제**: Phase 0 완료 (Expo 프로젝트 이미 초기화됨)

### 디렉토리 구조

```
/Users/macbook/seisho-app/
├── src/
│   ├── screens/          # 화면 컴포넌트
│   ├── components/       # 재사용 UI
│   ├── hooks/            # Custom hooks
│   ├── utils/
│   │   └── date.ts       # getTodayKST(), getKSTDateString()
│   ├── lib/
│   │   ├── supabase.ts   # Supabase 클라이언트
│   │   └── db.ts         # SQLite 연결
│   └── types/            # TypeScript 타입 정의
├── assets/
│   ├── bible/
│   │   └── ko.db         # 번들 성경 SQLite
│   └── liturgy/
│       └── calendar-2025-2030.json
└── app.json
```

### 핵심 의존성 설치

```bash
npm install @supabase/supabase-js react-native-mmkv expo-sqlite
```

### `utils/date.ts` 구현 (엔지니어링 결정 #4)

```typescript
import { Temporal } from '@js-temporal/polyfill'

export function getTodayKST(): Temporal.PlainDate {
  return Temporal.Now.plainDateISO('Asia/Seoul')
}

export function getKSTDateString(date: Temporal.PlainDate): string {
  return date.toString() // "YYYY-MM-DD"
}
```

---

## Phase 2 — 성경 데이터 레이어 (Feature 3)

**목표**: 번들 SQLite로 오프라인 성경 읽기 구현

### 주요 작업

1. `ko.db` 번들 파일 준비 (개역한글 또는 오픈 바이블 CC BY-SA 4.0)
2. `expo-sqlite` + `expo-file-system` 로 앱 번들에서 SQLite 복사
3. `DatabaseInitScreen` (TODO-08) — 로딩 UI (5~10초 대기)
4. `lib/db.ts` — `getVersesByChapter()`, `getVerseRange()` 쿼리
5. TDD: `db.test.ts` — 쿼리 결과 검증

### 데이터 스키마 (SQLite)

```sql
-- books: 구약 39 + 신약 27
-- chapters: 각 장
-- verses: 절 (book_id, chapter, verse, text)
CREATE INDEX idx_verses ON verses(book_id, chapter, verse);
```

---

## Phase 3 — 절기 엔진 (Feature 1)

**목표**: 교회력 자동 감지 + `calendar-2025-2030.json` 생성

### 주요 작업

1. `calendar-2025-2030.json` 사전 계산 & 번들
   - computus로 2025-2030 부활절 날짜 생성
   - 절기 경계 (사순절 40일, 대림절 4주 등) 계산
2. `src/utils/season.ts` — `getCurrentSeason(date)` → `LiturgySeason`
3. TDD: `season.test.ts`
   - 사순절/성주간 경계 케이스 (엔지니어링 결정 미해결 항목)
   - 2025-2030 전 연도 검증

### 절기 타입

```typescript
type LiturgySeason =
  | 'advent' | 'christmas' | 'epiphany'
  | 'lent' | 'holy_week' | 'easter' | 'ordinary'
```

---

## Phase 4 — 코어 기능 (단독/오프라인)

Features 1, 2, 3, 4, 5, 8, 9 — Supabase 없이 동작

### Feature 순서 (의존성 기준)

| 순서 | Feature | 의존 |
|------|---------|------|
| 1 | **온보딩** (F9) | 없음 |
| 2 | **절기 감지** (F1) | Phase 3 |
| 3 | **오늘의 말씀** (F2) | F1, Phase 2 |
| 4 | **성경 읽기** (F3) | Phase 2 |
| 5 | **읽기 완료 체크** (F4) | F3, MMKV |
| 6 | **연속 읽기 카운터** (F8) | F4 |
| 7 | **잔디 그래프** (F5) | F4, F8 |

### Cold Start 감지 (엔지니어링 결정 #6)

```typescript
const isColdStart = useRef(true)
useEffect(() => { isColdStart.current = false }, [])
// AppState 'active' 이벤트에서 isColdStart.current 체크
```

---

## Phase 5 — Supabase 백엔드

**목표**: DB 스키마, RLS, 익명 인증, RPC 함수

### 테이블 & 인덱스 (엔지니어링 결정 #8, #9)

```sql
-- groups, member_status, feed_posts, analytics_events
CREATE INDEX ON feed_posts(group_code, date);
CREATE INDEX ON member_status(group_code, date);

-- analytics_events CHECK constraint (#9)
ALTER TABLE analytics_events ADD CONSTRAINT valid_event_type
  CHECK (event_type IN ('verse_read', 'share', 'group_join'));
```

### RLS 정책 (엔지니어링 결정 #10)

```sql
-- ⚠️ 구현 시 반드시 활성화 (현재 주석 처리됨)
ALTER TABLE feed_posts ENABLE ROW LEVEL SECURITY;
-- 그룹 멤버만 피드 조회 가능
```

### `generate_group_code()` RPC (엔지니어링 결정 #7)

```sql
CREATE OR REPLACE FUNCTION generate_group_code()
RETURNS text AS $$
DECLARE
  code text; attempt int := 0;
BEGIN
  LOOP
    code := upper(substring(md5(random()::text) from 1 for 6));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM groups WHERE group_code = code);
    attempt := attempt + 1;
    IF attempt >= 10 THEN RAISE EXCEPTION 'code_gen_failed'; END IF;
  END LOOP;
  RETURN code;
END; $$ LANGUAGE plpgsql;
```

---

## Phase 6 — 소그룹 기능 (Features 6, 7)

**전제**: Phase 4(개인 기능) + Phase 5(백엔드) 완료

### Feature 6 — 소그룹 코드 생성/참여

- 코드 생성: `generate_group_code()` RPC 호출
- 코드 공유: 클립보드 복사 (TODO-03 카카오톡/LINE은 v1 이후)
- 참여: 6자리 코드 입력 → `member_status` upsert

### Feature 7 — 소그룹 피드

- 하루 1문장 나눔 작성/조회
- Supabase Realtime으로 실시간 업데이트
- 피드 항목: 닉네임, 날짜, 1문장

---

## Phase 7 — 테스트 & 품질

### 테스트 전략

| 레이어 | 도구 | 대상 |
|--------|------|------|
| 단위 | Jest + React Native Testing Library | utils, hooks |
| 통합 | Jest | DB 쿼리, Supabase RPC |
| E2E | Maestro 또는 Detox | Critical user flows |

### Critical 테스트 케이스

- `season.test.ts`: 사순절/성주간 경계 2025-2030 전 연도
- `db.test.ts`: 창세기 1:1 조회, 요한계시록 22:21 조회
- `groupCode.test.ts`: `generate_group_code()` 충돌 시 재시도 10회

### 품질 체크리스트

- [ ] 80%+ 테스트 커버리지
- [ ] TypeScript strict mode 에러 0건
- [ ] RLS 정책 활성화 확인
- [ ] 오프라인 시나리오 수동 테스트

---

## Phase 8 — 배포 (EAS Build + Submit)

### App Store (iOS) + Play Store (Android)

```bash
npm install -g eas-cli
eas login
eas build --platform all
eas submit --platform all
```

### 배포 체크리스트

- [ ] `app.json` 버전 1.0.0
- [ ] 환경변수 `.env.production` 준비 (Supabase URL/anon key)
- [ ] iOS Bundle ID: `com.seisho.app`
- [ ] Android Package: `com.seisho.app`
- [ ] 아이콘 & 스플래시 스크린 (1024×1024)
- [ ] Privacy Policy URL 준비

---

## 참조 파일

| 파일 | 내용 |
|------|------|
| `TODOS.md` | 9개 이연 작업 (P0/P1/P2) |
| `plan/seisho-app-v1-design-doc.md` | MVP 아키텍처 & 기능 명세 |
| `plan/seisho-app-eng-review-2026-03-25.md` | 엔지니어링 결정 10건 |
| `~/.claude/projects/.../memory/project_seisho_v1_eng_decisions.md` | 결정 요약 (메모리) |
