# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**seisho-app** — 신앙생활을 더욱 똑똑하고 효율적으로 지속적으로 하기위해 만듭니다.
("An app to make faith-based living smarter and more sustainable.")

## Development Guidelines

- **Primary Resource**: Always refer to the `seisho-app` skill (`~/.agents/skills/seisho-app/SKILL.md`) for domain-specific knowledge and "Gotchas".
- **Rule Enforcement**: Follow the guidelines in the `seisho-app` skill for Bible API and Gemini API integration.

## Behavior Guidelines (Karpathy Guidelines)

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

1. **Think Before Coding (생각하고 코딩하기)**
   - Don't assume. Don't hide confusion. Surface tradeoffs.
   - If something is unclear, stop. Name what's confusing. Ask.

2. **Simplicity First (단순함 우선)**
   - Minimum code that solves the problem. Nothing speculative.
   - No "flexibility" or "configurability" that wasn't requested.
   - If you write 200 lines and it could be 50, rewrite it.

3. **Surgical Changes (수술적 수준의 정밀한 변경)**
   - Touch only what you must. Clean up only your own mess.
   - Match existing style. Don't "improve" adjacent code unless asked.
   - Every changed line should trace directly to the requested feature or fix.

4. **Goal-Driven Execution (목표 주도 실행)**
   - Define success criteria. Loop until verified.
   - Transform tasks into verifiable goals (e.g. "Add validation" → "Write test, make it pass").
   - Strong success criteria let you loop independently.

## Status

**2026-04-01**: Phase 5 완료 — P0~P5 전부 완료.
- ✅ P0: Hermes 호환성 검증 (computus + @js-temporal/polyfill)
- ✅ P1: 프로젝트 기반 설정 (폴더 구조, expo-sqlite, mmkv)
- ✅ P2: 성경 데이터 레이어 (ko.db 30,929절, expo-sqlite)
- ✅ P3: 절기 엔진 (season.ts, 48 tests pass)
- ✅ P4: 코어 기능 (streak, grassGrid, storage, navigation)
- ✅ P5: Supabase 백엔드 (익명 인증, DB 스키마, sync.ts) — 80 tests pass
- 다음: P6 소그룹 기능

## Gotchas

> ⚠️ Claude가 실패하기 쉬운 지점들을 기록합니다. 발견할 때마다 여기에 추가하세요.

<!-- 예시 형식:
- **[모듈/API]**: 문제 상황 → 올바른 해결 방법
-->

### api.bible
- (아직 없음 — 실제 사용 중 발견되면 추가)

### Gemini API
- (아직 없음 — 실제 사용 중 발견되면 추가)

### Supabase
- **supabase.ts 모듈 레벨 env 검증 + Jest**: `process.env` 설정 후 `jest.isolateModules(() => { require('../supabase') })` 패턴 필수. 일반 `import`로는 env 검증 throw 발생.
- **supabase import를 컴포넌트에서 사용 시 Jest**: 컴포넌트가 `initAnonAuth` 등을 직접 import하면 테스트에서 `jest.mock('../../lib/supabase', () => ({ initAnonAuth: jest.fn() }))` 필수. 없으면 모듈 레벨 throw로 전체 suite 실패.
- **익명 인증 레이스 컨디션**: `initAnonAuth()`는 App.tsx의 useEffect에서 비동기 실행. 사용자가 빠르게 소그룹 탭 진입 시 `getUserId()`가 undefined → "Not authenticated" 에러. 각 화면에서 첫 로드 시 `if (!getUserId()) await initAnonAuth()` 패턴으로 방어.

### react-native-safe-area-context
- **useSafeAreaInsets + Jest**: `SafeAreaProvider` 없이 `useSafeAreaInsets` 사용하는 컴포넌트 테스트 시 "No safe area value available" 에러 발생. 테스트 파일 상단에 `jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }) }))` 추가 필수.
- **Expo Go에서 paddingTop 고정값 금지**: 노치 기기(iPhone 14+)에서 status bar 높이가 ~50px. `paddingTop: 24` 같은 고정값은 겹침 발생. 반드시 `useSafeAreaInsets().top`으로 동적 계산.

### 성경 DB (ko.db)
- **HTML 엔티티 인코딩**: ko.db의 절 텍스트에 `&#x27;`(apostrophe), `&amp;` 등 HTML 엔티티 포함. `getVersesByChapter` 결과를 그대로 렌더링하면 깨진 텍스트 표시. `db.ts`의 쿼리 결과에서 디코딩 처리 필수.

### expo-clipboard
- **Expo Go 미지원**: `expo-clipboard`는 Expo Go(SDK 54)에서 "Cannot find native module 'ExpoClipboard'" 에러 발생. EAS Build 전용. Expo Go 개발 단계에서는 React Native 내장 `Share` API(`import { Share } from 'react-native'`) 사용.

### 일반
- **npm 캐시 권한 오류**: `npm install` 시 `EACCES` 오류 발생 가능 → `sudo chown -R 501:20 "/Users/macbook/.npm"` 로 해결
- **Expo 초기화**: 기존 파일이 있는 디렉토리에 `create-expo-app .` 불가 → 임시 디렉토리에 생성 후 필요 파일만 복사
- **Expo Go SDK 버전 불일치**: App Store Expo Go가 최신 SDK를 즉시 지원 안 할 수 있음 → `npx expo install expo@~54.0.0`으로 다운그레이드 후 `npx expo start --clear`
- **Hermes 확인됨 (2026-03-26)**: `computus@3.0.1` + `@js-temporal/polyfill@^0.4.4` → iOS Expo Go SDK 54 Hermes에서 정상 동작. 대안 불필요.
- **expo-sqlite assetSource 형식**: `assetSource={require('./assets/bible/ko.db')}` (숫자 직접) → 오류. 내부 `hooks.js`에서 `assetSource.assetId`를 꺼내기 때문. 반드시 `assetSource={{ assetId: require('./assets/bible/ko.db') }}` 형태로 전달.

## Bug Reports

- UI/UX 버그 스크린샷은 `bug_report/` 디렉토리에 저장됨
- UI 작업 또는 화면 관련 플랜 수립 전에 **항상 `bug_report/` 먼저 확인**
- 스크린샷이 있으면 해당 화면의 현재 상태를 시각적으로 파악한 후 계획 수립
- **버그 수정 완료 후**: 해당 스크린샷 파일명 앞에 `해결완료-` 접두사 추가 (예: `노치부분-텍스트-겹침.png` → `해결완료-노치부분-텍스트-겹침.png`)

## Task-Type Approach Guide

각 요청 유형에 따라 아래 컨텍스트를 기준으로 접근하라. 코딩 전에 반드시 해당 섹션을 참고할 것.

### 1. 청사진 / 기능 범위 논의
> "이 기능 만들 가치 있어?", "P6 설계해줘", "소그룹 기능 어떻게 구성하지?"

수석 아키텍트처럼 접근하라:
- **앱**: seisho-app (신앙 지속성 도구)
- **사용자**: 한국 기독교인, 소그룹(구역/셀) 리더 포함
- **문제**: 신앙생활 루틴 유지 + 소그룹 공동체 연결
- 출력: 페르소나, 핵심 가치, MVP/v1/v2 기능 분리, 사용자 흐름, 기술/UX 위험

### 2. 앱 구조 / 아키텍처 결정
> "폴더 구조 어떻게 할까?", "컴포넌트 분리 기준은?", "상태관리 어떻게?"

선임 React Native 아키텍트처럼 접근하라:
- **스택**: React Native (Expo SDK 54) + TypeScript + Supabase + expo-sqlite
- **네비게이션**: React Navigation (Tab + Stack)
- **상태**: Zustand 또는 React Context (전역 최소화)
- **저장소**: MMKV (로컬 빠른 접근) + expo-sqlite (성경 DB) + Supabase (원격 동기화)
- **인증**: Supabase 익명 인증 (`initAnonAuth` 패턴)
- 출력: 폴더 트리, 레이어 역할 명세, 의존성 방향

### 3. UX 흐름 설계
> "이 화면 UX 어떻게?", "온보딩 흐름은?", "빈 상태 처리는?"

고급 모바일 UX 디자이너처럼 접근하라:
- **사용자**: 디지털 친숙도 다양한 한국 기독교인 (20대~60대)
- **스타일**: 차분하고 영적인 느낌 + 한국 감성 (과하지 않은 여백, 가독성 우선)
- 각 화면별 명세: 목표, 주요 액션, UI 요소, 빈 상태/로딩/오류 처리, CTA, 마이크로카피
- Expo Go 제약 (expo-clipboard 불가 등) 반드시 반영

### 4. PRD / 요구사항 정의
> "이 기능 스펙 써줘", "어디까지 만들어야 해?"

CTO + PM처럼 접근하라:
- 포함 항목: 제품 개요, 사용자 문제, 목표/비목표, 핵심 기능, 엣지 케이스, 기술 고려사항, 성공 지표
- **비목표 명시 필수**: scope creep 방지
- MVP 친화적으로 작성. 과도한 설계 금지.

### 5. 백엔드 / DB 설계
> "테이블 어떻게 짜?", "RLS 설정은?", "API 어떻게 구성해?"

시니어 백엔드 아키텍트처럼 접근하라:
- **DB**: Supabase PostgreSQL
- **인증**: 익명 auth (`auth.uid()` 기반 RLS 필수)
- **스키마 원칙**: 최소 컬럼, `created_at` 기본 포함, 인덱스는 조회 패턴 기준
- **보안**: RLS 빠짐 없이, service role key는 서버 전용
- **마이그레이션**: `supabase/migrations/` 순번 파일로 관리 (`004_feed_nickname.sql` 형식)
- 출력: CREATE TABLE SQL + RLS 정책 + 인덱스 + API 호출 패턴

### 6. UI 디자인 시스템
> "색상 팔레트는?", "버튼 스타일 통일해줘", "타이포그래피 기준은?"

세계 최고 수준의 모바일 UI 디자이너처럼 접근하라:
- **브랜드**: 차분함, 영적 집중, 신뢰감 — 과하지 않은 미니멀
- **팔레트**: `src/utils/theme.ts` 참조 (변경 시 해당 파일 먼저 확인)
- 포함: 색상 토큰, 타이포그래피 스케일, 간격 시스템, 버튼/입력/카드 컴포넌트, 네비게이션 패턴
- 노치 대응 필수: `useSafeAreaInsets()` 동적 계산 사용

### 7. 코드 구현
> "이 기능 코드 짜줘", "컴포넌트 만들어줘"

React Native 선임 엔지니어처럼 접근하라:
- **언어**: TypeScript (strict)
- **컴포넌트**: 함수형 + hooks 전용
- **불변성**: 객체 mutation 금지, spread 패턴 사용
- **파일 크기**: 800줄 이하, 함수 50줄 이하
- **테스트**: Jest + React Native Testing Library, 새 로직에는 반드시 테스트 추가
- **모킹**: Supabase / expo-sqlite / safe-area 는 Gotchas 패턴 참고

### 8. 코드 감사 / 리뷰
> "이 코드 문제 없어?", "리뷰해줘", "기술 부채 뭐야?"

모바일 QA 리더 + 성장 PM처럼 접근하라:
- UX 약점, 혼란스러운 흐름, 유지율 위험
- 기술 부채: 불변성 위반, 파일 비대화, 테스트 누락
- 보안: RLS 누락, env 하드코딩, 입력 미검증
- 출력: 발견된 문제 목록 + 심각도(CRITICAL/HIGH/MEDIUM) + 수정 제안

### 9. 출시 / 배포 계획
> "EAS Build 어떻게?", "앱스토어 제출 준비는?", "베타 어떻게 돌려?"

모바일 출시 전략가처럼 접근하라:
- **현재 환경**: Expo Go (개발) → EAS Build (프로덕션)
- 체크리스트: 앱스토어 메타데이터, 아이콘/스플래시, env secrets, EAS 설정
- 베타: TestFlight (iOS) / 내부 트랙 (Android)
- 출시 후 30일 지표: DAU, streak 유지율, 소그룹 참여율

### 10. 전략적 판단 / 로드맵
> "다음 뭐 만들어야 해?", "P6 어떻게 쪼개?", "우선순위 어떻게?"

앱 선임 리더처럼 접근하라:
- **현재 완료**: P0~P5 (성경 DB, 절기 엔진, streak, Supabase 동기화)
- **진행 중**: P6 소그룹 기능 (GroupFeedScreen, 닉네임, 코드 공유)
- 단계 분리: 전략 → UX → 아키텍처 → 백엔드 → 코드 → QA → 출시
- 각 단계 출력: 결정 사항, 위험, 다음 액션

---

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review
- Save progress, checkpoint, resume → invoke checkpoint
- Code quality, health check → invoke health
