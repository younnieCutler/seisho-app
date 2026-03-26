---
title: "Seisho-App v1 엔지니어링 리뷰 결과 (plan-eng-review)"
date: 2026-03-25
tags: [project/seisho-app, dev/engineering-review, dev/mobile, dev/react-native]
aliases: ["seisho 엔지니어링 리뷰", "seisho app 기술 결정", "성경 앱 아키텍처"]
description: "seisho-app MVP v1 plan-eng-review 세션 결과. computus@3.x 채택, DB 인덱스/RPC SQL 확정, Hermes 호환성 P0 이슈 발견 등 10개 기술 결정 정리."
source: "~/.gstack/projects/seisho-app/ceo-plans/2026-03-24-seisho-app-mvp.md"
---

# Seisho-App v1 엔지니어링 리뷰 결과

> /plan-eng-review 세션 · 2026-03-25 · Status: DONE_WITH_CONCERNS

---

## 핵심 기술 결정 (10건)

### 1. computus@3.x 채택 ✅
- `import { computus } from 'computus'` → `Temporal.PlainDate` 반환
- `.month` **1-indexed** (변환 불필요), `.day` 직접 사용
- `@js-temporal/polyfill@^0.4.4` 함께 설치 필수
- 이전 플랜의 "0-indexed month" 오류 수정됨

### 2. Hermes 호환성 검증 필수 (P0) ⚠️
- Android React Native = Hermes 엔진
- Temporal.PlainDate 네이티브 미지원 → 폴리필 의존
- **구현 시작 전 Expo + Android 에뮬레이터에서 검증 필수**
- 실패 시 대안: computus@1.x (`gregorian(year)` → Date 객체, `.getMonth()` 0-indexed + 1)

### 3. 날짜 유틸리티 공유 모듈
- `utils/date.ts`: `getTodayKST()`, `getKSTDateString(date)`
- 6개 이상 컴포넌트에서 중복 방지

### 4. calendar JSON 경로 확정 ✅
```
assets/liturgy/calendar-2025-2030.json
assets/bible/ko.db
```

### 5. Cold start 감지 패턴 ✅
```typescript
const isColdStart = useRef(true);

useEffect(() => {
  if (isColdStart.current) {
    triggerInProgressStatus(); // member_status 'in_progress'
    isColdStart.current = false;
  }
  // background→foreground: 아무 작업 안 함
}, []);
```

### 6. generate_group_code() RPC SQL ✅
```sql
CREATE OR REPLACE FUNCTION generate_group_code()
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
  new_code TEXT;
  attempts INT := 0;
BEGIN
  LOOP
    new_code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 6));
    BEGIN
      INSERT INTO groups (code, leader_user_id) VALUES (new_code, auth.uid());
      RETURN new_code;
    EXCEPTION WHEN unique_violation THEN
      attempts := attempts + 1;
      IF attempts >= 10 THEN RAISE EXCEPTION 'code_gen_failed'; END IF;
    END;
  END LOOP;
END;
$$;
```

### 7. DB 인덱스 추가 ✅
```sql
CREATE INDEX ON feed_posts(group_code, date);
CREATE INDEX ON member_status(group_code, date);
```
- PRIMARY KEY가 (user_id, group_code, date)라 group_code 단독 쿼리가 느림 → 인덱스 필요

### 8. analytics_events CHECK constraint ✅
```sql
event_type TEXT NOT NULL CHECK (event_type IN (
  'reading_completed','group_feed_posted','onboarding_completed'
))
```

### 9. RLS 정책 SQL (구현 시 적용) ⚠️
```sql
-- 미적용 상태 — 구현 시 주석 해제
CREATE POLICY "group_members_read_feed" ON feed_posts FOR SELECT
  USING (group_code IN (SELECT group_code FROM memberships WHERE user_id = auth.uid()));
CREATE POLICY "group_members_read_status" ON member_status FOR SELECT
  USING (group_code IN (SELECT group_code FROM memberships WHERE user_id = auth.uid()));
```
- **잊으면 모든 인증된 사용자가 모든 그룹 피드를 읽을 수 있음 — 보안 경계**

### 10. DatabaseErrorScreen + 로딩 UI
- SQLite 복사 실패: 전체화면 에러 + [다시 시도] 버튼 (최대 3회)
- 로딩 중: 스피너 + "성경 데이터를 준비 중입니다..." (TODO-08)

---

## TODOS.md 추가 항목

| ID | 우선순위 | 내용 |
|----|---------|------|
| TODO-07 | **P0** | computus@3.x + Temporal.PlainDate Hermes 호환성 검증 (구현 시작 전) |
| TODO-08 | P1 | SQLite 첫 실행 로딩 UI (DatabaseInitScreen) |

---

## 미해결 사항

1. **RLS SQL** — 구현 시 적용 (보안 경계 — 잊지 말 것)
2. **사순절/성주간 경계 테스트** — `season.test.ts` 구현 시 2026~2030 전체 연도 검증 필수

---

## Outside Voice 발견 (Claude subagent)

1. 익명 인증 오프라인 의존성 — launch blocker 가능성 (TODO-01 이미 있음)
2. computus Hermes 미검증 → **P0로 상향** (TODO-07 신규 추가)
3. Feature 11 (Realtime) — WAU 10 목표 대비 과도한 복잡도 (CEO Review ACCEPTED로 유지)
4. SQLite 로딩 UX 없음 → TODO-08 추가
5. RLS 보안 경계 deferred 위험 → 경고 유지

---

## 테스트 플랜 위치

`~/.gstack/projects/seisho-app/macbook-main-eng-review-test-plan-20260324-235954.md`

**Critical 테스트:**
- 사순절/성주간 경계 중첩 없음 (2026~2030)
- 부활절 KST UTC+9 보정 (2026-04-05)
- SQLite 3회 재시도 실패 → DatabaseErrorScreen

---

## 관련 파일

- CEO Plan: `~/.gstack/projects/seisho-app/ceo-plans/2026-03-24-seisho-app-mvp.md`
- TODOS.md: `/Users/macbook/seisho-app/TODOS.md`
- Design Doc: `~/.gstack/projects/seisho-app/macbook-main-design-*.md`

## 내 생각

- **Hermes 이슈가 제일 무서웠다**: computus@3.x 쓰기로 결정하고 나서야 "이거 Android에서 되냐?"라는 질문이 나왔다. 라이브러리 결정 전에 런타임 호환성부터 확인하는 순서를 반대로 했던 것. 앞으로는 외부 라이브러리 결정 시 "iOS/Android 모두 동작 확인"을 체크리스트 1번으로.
- **RLS를 deferred한 게 계속 걸린다**: 보안 경계를 "나중에"로 미루는 건 기술 부채가 아니라 보안 취약점이다. 작은 앱이라도 신앙 나눔 데이터는 민감하다. 구현 PR에서 RLS SQL을 체크리스트 필수 항목으로 걸어둘 것.
- **AI 리뷰가 사람보다 꼼꼼하다는 걸 새삼 느꼈다**: 혼자 계획하면 "이 정도면 됐지"하고 넘어갈 것들을 10개씩 짚어줬다. 특히 Outside Voice(다른 AI)가 내 리뷰어와 다른 각도로 봐준 게 유익했다.

## Related Content to Explore

- [[seisho-app-v1-design-doc]] — v1 설계 문서 (office hours 결과)
- [[seisho-app-bible-data-hearing-questions]] — 성경 데이터 히어링 질문 시트
- [[seisho-app-implementation-plan]] — 구현 계획 (이번 리뷰 이전 버전)
- [[seisho-app-competitor-analysis]] — 경쟁사 분석
