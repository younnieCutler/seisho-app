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

**2026-03-26**: Phase 0 완료 → Phase 1 진행 중.
- ✅ Expo SDK 54 + TypeScript 프로젝트 초기화
- ✅ `computus@3.0.1`, `@js-temporal/polyfill@^0.4.4` 설치
- ✅ TODO-07 PASS: iOS Expo Go (Hermes)에서 4개 테스트 전부 통과
- Phase 1 시작: 프로젝트 기반 설정 (폴더 구조, supabase, mmkv, expo-sqlite)

## Gotchas

> ⚠️ Claude가 실패하기 쉬운 지점들을 기록합니다. 발견할 때마다 여기에 추가하세요.

<!-- 예시 형식:
- **[모듈/API]**: 문제 상황 → 올바른 해결 방법
-->

### api.bible
- (아직 없음 — 실제 사용 중 발견되면 추가)

### Gemini API
- (아직 없음 — 실제 사용 중 발견되면 추가)

### 일반
- **npm 캐시 권한 오류**: `npm install` 시 `EACCES` 오류 발생 가능 → `sudo chown -R 501:20 "/Users/macbook/.npm"` 로 해결
- **Expo 초기화**: 기존 파일이 있는 디렉토리에 `create-expo-app .` 불가 → 임시 디렉토리에 생성 후 필요 파일만 복사
- **Expo Go SDK 버전 불일치**: App Store Expo Go가 최신 SDK를 즉시 지원 안 할 수 있음 → `npx expo install expo@~54.0.0`으로 다운그레이드 후 `npx expo start --clear`
- **Hermes 확인됨 (2026-03-26)**: `computus@3.0.1` + `@js-temporal/polyfill@^0.4.4` → iOS Expo Go SDK 54 Hermes에서 정상 동작. 대안 불필요.
