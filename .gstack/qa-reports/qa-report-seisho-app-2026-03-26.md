# QA Report — seisho-app (P0~P3 완료 검증)
**Date:** 2026-03-26 | **Branch:** main | **Mode:** 정적 QA (Mobile React Native — 브라우저 없음)
**Scope:** P0~P3 구현 완료 코드 전체 (db.ts, season.ts, date.ts, DatabaseInitScreen, App.tsx)
**Tester:** qa-only skill

---

## 요약

| 항목 | 결과 |
|------|------|
| App 테스트 | ✅ 33/33 pass (3 suites) |
| TypeScript | ✅ 0 errors |
| CRITICAL 이슈 | 0 |
| HIGH 이슈 | 1 |
| MEDIUM 이슈 | 2 |
| LOW 이슈 | 1 |

**Health Score: 78/100**

---

## 테스트 결과 상세

### src/ 테스트 (33/33 pass ✅)

| Suite | Tests | Result |
|-------|-------|--------|
| `src/utils/__tests__/date.test.ts` | 5 | ✅ all pass |
| `src/utils/__tests__/season.test.ts` | 21 | ✅ all pass |
| `src/lib/__tests__/db.test.ts` | 7 | ✅ all pass |

### 전체 Jest 실행 (문제 있음 ⚠️)

`npm test` (testPathPattern 없이 실행) 시 `.claude/skills/gstack/test/` 내 bun 테스트들이 Jest에서 실패:
- `Cannot find module 'bun:test'` — 10개 이상 suite 실패
- `import.meta is not supported in Hermes` — 1개 suite 실패
→ **HIGH 이슈 #1** 참고

---

## ISSUE-001 [HIGH] Jest가 .claude/skills/gstack 테스트를 픽업 — 잘못된 실패 노출

**현상:** `npm test` 실행 시 `.claude/skills/gstack/test/` 디렉토리의 bun:test 파일들이 Jest에 포함됨. 11개 suite가 `Cannot find module 'bun:test'` 또는 `import.meta` 오류로 실패.

**영향:** CI/CD에서 `npm test` 실행 시 실패로 기록됨. 앱 코드 문제와 무관하므로 혼란 초래.

**근인:** `package.json`의 Jest 설정에 `testPathIgnorePatterns`가 없어 `.claude/` 디렉토리가 제외되지 않음.

**재현:** `npm test` → 11 suite FAIL (bun 관련), 3 suite PASS (앱 코드)

**수정 방법:**
```json
// package.json jest config에 추가:
{
  "jest": {
    "testPathIgnorePatterns": [
      "/node_modules/",
      "/.claude/"
    ]
  }
}
```

---

## ISSUE-002 [MEDIUM] season.ts — getAdventStart가 12/25가 일요일인 해에 오류

**현상:** `getAdventStart(year)` 함수가 12월 25일이 일요일인 연도(2022, 2033)에 잘못된 날짜 반환.

**검증:**
```
2022: Dec 25 = Sun → formula 결과: Dec 4 ❌ (올바른 값: Nov 27)
2033: Dec 25 = Sun → formula 결과: Dec 4 ❌ (올바른 값: Nov 27)
```

**영향:** 지원 범위(2025-2030)에서는 12/25가 일요일인 해 없음 → 현재 앱에는 영향 없음. 하지만 앱 장기 지원 시 문제.

**근인:**
```typescript
const daysToSunday = dow % 7  // Sun(7) % 7 = 0
return dec25.subtract({ days: daysToSunday + 21 })
// Dec 25가 일요일이면 0 + 21 = 21일 감산 → Dec 4
// 올바른 결과: 28일 감산 → Nov 27
```

**현재 테스트:** 2026년만 검증 → 버그 미탐지

---

## ISSUE-003 [MEDIUM] season 테스트 커버리지 — 2026년 단일 연도만 검증

**현상:** 계획 문서(impl-phases.md)에 "2025-2030 전 연도 검증" 명시. 실제 구현된 테스트는 2026년 기준 21개 케이스만 커버.

**영향:** 연도별 부활절 날짜 계산 편차, 대림절 시작일 변화를 검증하지 않음. Issue-002의 버그가 테스트로 탐지되지 않음.

**권고:** 각 연도별(2025-2030) 주요 절기 날짜 검증 케이스 추가 필요.

---

## ISSUE-004 [LOW] Watchman MustScanSubDirs 경고

**현상:** `npm test` 실행마다 아래 경고 출력:
```
watchman warning: Recrawled this watch 1 time, most recently because: MustScanSubDirs UserDroppedTo
```

**영향:** 기능적 영향 없음. 출력 노이즈.

**해결:** `watchman watch-del '/Users/macbook/seisho-app' ; watchman watch-project '/Users/macbook/seisho-app'`

---

## 코드 품질 점검

### src/utils/season.ts ✅
- 로직 구조 명확, 절기 순서 올바름
- `getEaster`, `getAdventStart`, `isBetween` 헬퍼 적절히 분리
- Issue-002 외 추가 버그 없음

### src/lib/db.ts ✅
- SQL 파라미터 바인딩 사용 (인젝션 안전)
- `db: SQLiteDatabase` 주입 방식 — Hook 없이 테스트 가능
- 두 함수 모두 정상 동작 확인

### App.tsx ⚠️
- `<Suspense>` 사용했으나 `SQLiteProvider`에 `useSuspense` prop 미전달
- expo-sqlite 16.x에서 Suspense가 실제로 동작하는지 디바이스 테스트 필요
- 현재는 기능적으로 동작할 가능성 높으나 미검증

### assets/bible/ko.db ✅
- 5.3MB, 정상 존재
- 30,929절 수록 (Open Bible CC BY-SA 4.0)
- 창세기 1:1 = "태초에 하나님이 천지를 창조하시니라" ✅

---

## Health Score 계산

| 카테고리 | 점수 |
|----------|------|
| 기능 정확성 (Tests 33/33 pass) | 100 |
| TypeScript | 100 |
| 버그 위험도 (Issue-002) | 70 |
| 테스트 커버리지 (Issue-003) | 60 |
| 빌드/설정 (Issue-001) | 55 |
| **weighted avg** | **78** |

---

## P4 착수 전 권고 조치

| 우선순위 | 조치 | 영향 |
|----------|------|------|
| ① 즉시 | Jest testPathIgnorePatterns 추가 | `npm test` 신뢰성 복구 |
| ② P4 착수 전 | season 테스트 2025-2030 연도 확장 | 커버리지 완성 |
| ③ 선택 | getAdventStart 버그 수정 | 2033년 대비 |
| ④ 선택 | Watchman 캐시 재설정 | 노이즈 제거 |
