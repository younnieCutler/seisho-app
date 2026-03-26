# seisho-app 기술스택 Best Practice 스킬 검색 결과

> 검색일: 2026-03-25 | 기반: [v1 설계 문서](file:///Users/macbook/seisho-app/plan/seisho-app-v1-design-doc.md)

---

## 확정된 기술스택 요약

| 레이어 | 기술 | 비고 |
|--------|------|------|
| 프론트엔드 | **React Native (Expo)** | iOS/Android 동시 지원 |
| 백엔드 | **Supabase** | 인증, DB, Realtime |
| 언어 | **TypeScript** | 타입 안전성 |
| 성경 데이터 | **SQLite** (`expo-sqlite`) | 로컬 번들 |
| 유저 데이터 | **react-native-mmkv** | 고성능 로컬 저장소 |
| 절기 데이터 | 로컬 JSON + `computus@3.x` | 절기 계산 |

---

## 1. React Native + Expo

> [!IMPORTANT]
> 프론트엔드 코어 기술. 가장 많은 스킬이 존재합니다.

| 스킬 | 설치 수 | 설명 | 설치 명령 |
|------|---------|------|-----------|
| **react-native-expo** | 744 | RN + Expo 종합 Best Practice | `npx skills add jezweb/claude-skills@react-native-expo -g -y` |
| **expo-react-native-typescript** | 345 | Expo + RN + TS 통합 가이드 | `npx skills add mindrally/skills@expo-react-native-typescript -g -y` |
| **expo-react-native-performance** | 307 | 성능 최적화 가이드 | `npx skills add pproenca/dot-skills@expo-react-native-performance -g -y` |
| expo-react-native-javascript-best-practices | 130 | JS 코딩 패턴 | `npx skills add mindrally/skills@expo-react-native-javascript-best-practices -g -y` |
| animating-react-native-expo | 93 | 애니메이션 패턴 | `npx skills add tristanmanchester/agent-skills@animating-react-native-expo -g -y` |
| expo-react-native-coder | 87 | Expo 코딩 도우미 | `npx skills add pproenca/dot-skills@expo-react-native-coder -g -y` |

> [!TIP]
> **추천 조합**: `react-native-expo` (종합) + `expo-react-native-performance` (성능)

---

## 2. Supabase (백엔드 + 인증)

> [!IMPORTANT]
> Supabase 공식 스킬이 49.5K 설치로 압도적. 필수 설치 권장.

| 스킬 | 설치 수 | 설명 | 설치 명령 |
|------|---------|------|-----------|
| **supabase-postgres-best-practices** ⭐ | 49.5K | **Supabase 공식** Postgres BP | `npx skills add supabase/agent-skills@supabase-postgres-best-practices -g -y` |
| supabase-best-practices | 307 | Supabase 종합 BP | `npx skills add pedrobarretocw/supabase-best-practices@supabase-best-practices -g -y` |
| supabase-backend-platform | 287 | 백엔드 플랫폼 가이드 | `npx skills add bobmatnyc/claude-mpm-skills@supabase-backend-platform -g -y` |

> [!TIP]
> **추천**: `supabase-postgres-best-practices` (공식, 필수) — RLS 정책, 인덱스 설계, RPC 함수 등 seisho-app에 직접 관련

---

## 3. TypeScript

| 스킬 | 설치 수 | 설명 | 설치 명령 |
|------|---------|------|-----------|
| **typescript-best-practices** | 1.2K | TS 코딩 패턴 및 규칙 | `npx skills add 0xbigboss/claude-code@typescript-best-practices -g -y` |
| add-typescript-best-practices | 231 | TS BP 자동 적용 | `npx skills add neolabhq/context-engineering-kit@tech-stack:add-typescript-best-practices -g -y` |
| typescript-best-practices (jwynia) | 183 | TS BP 대안 | `npx skills add jwynia/agent-skills@typescript-best-practices -g -y` |

> [!TIP]
> **추천**: `0xbigboss/claude-code@typescript-best-practices` (가장 인기)

---

## 4. SQLite (성경 데이터)

| 스킬 | 설치 수 | 설명 | 설치 명령 |
|------|---------|------|-----------|
| **sqlite database expert** | 729 | SQLite 전문가 가이드 | `npx skills add martinholovsky/claude-skills-generator@sqlite database expert -g -y` |
| sqlite-expert | 35 | SQLite 최적화 | `npx skills add rightnow-ai/openfang@sqlite-expert -g -y` |

> [!NOTE]
> expo-sqlite 전용 스킬은 없음. 일반 SQLite BP + Expo 스킬 조합으로 커버.

---

## 5. 배포 (Expo EAS)

| 스킬 | 설치 수 | 설명 | 설치 명령 |
|------|---------|------|-----------|
| **expo-deployment** ⭐ | 12.8K | **Expo 공식** 배포 가이드 | `npx skills add expo/skills@expo-deployment -g -y` |

> [!TIP]
> Expo 공식 스킬. EAS Build + Submit 가이드 포함. v1 배포 시 필수.

---

## 6. 테스트

| 스킬 | 설치 수 | 설명 | 설치 명령 |
|------|---------|------|-----------|
| mobile-app-testing | 315 | 모바일 앱 테스트 전략 | `npx skills add aj-geddes/useful-ai-prompts@mobile-app-testing -g -y` |
| mobile-testing | 79 | 모바일 QE 가이드 | `npx skills add proffesor-for-testing/agentic-qe@mobile-testing -g -y` |

---

## ⭐ 최종 추천 (설치 우선순위)

> [!IMPORTANT]
> seisho-app 기술스택에 가장 직접적으로 관련된 스킬 TOP 5

| 순위 | 스킬 | 이유 |
|------|------|------|
| 1 | `supabase/agent-skills@supabase-postgres-best-practices` | **공식 49.5K** — RLS, 인덱스, RPC 모두 해당 |
| 2 | `expo/skills@expo-deployment` | **공식 12.8K** — v1 배포 필수 |
| 3 | `jezweb/claude-skills@react-native-expo` | RN + Expo 종합 BP |
| 4 | `0xbigboss/claude-code@typescript-best-practices` | TS 코딩 표준 |
| 5 | `pproenca/dot-skills@expo-react-native-performance` | 성능 최적화 (SQLite 번들 + MMKV 관련) |

### 한 번에 설치하기

```bash
npx skills add supabase/agent-skills@supabase-postgres-best-practices -g -y
npx skills add expo/skills@expo-deployment -g -y
npx skills add jezweb/claude-skills@react-native-expo -g -y
npx skills add 0xbigboss/claude-code@typescript-best-practices -g -y
npx skills add pproenca/dot-skills@expo-react-native-performance -g -y
```

---

## 검색했으나 직접 매칭 스킬 없음

| 기술 | 상태 | 대안 |
|------|------|------|
| `react-native-mmkv` | 전용 스킬 없음 | RN 종합 스킬로 커버 |
| `computus` (절기 계산) | 전용 스킬 없음 | 프로젝트 내 seisho-app 스킬로 커버 |
| `@js-temporal/polyfill` | 전용 스킬 없음 | TS BP 스킬로 커버 |
