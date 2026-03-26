# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**seisho-app** — 신앙생활을 더욱 똑똑하고 효율적으로 지속적으로 하기위해 만듭니다.
("An app to make faith-based living smarter and more sustainable.")

## Development Guidelines

- **Primary Resource**: Always refer to the `seisho-app` skill (`~/.agents/skills/seisho-app/SKILL.md`) for domain-specific knowledge and "Gotchas".
- **Rule Enforcement**: Follow the guidelines in the `seisho-app` skill for Bible API and Gemini API integration.

## Status

**2026-03-26**: Phase 0 진행 중.
- Expo (React Native) + TypeScript 프로젝트 초기화 완료
- `computus@3`, `@js-temporal/polyfill@^0.4.4` 설치 완료
- `src/debug/HermesValidation.tsx` 작성 완료 → 실기기 Expo Go 테스트 대기 중 (TODO-07)
- TODO-07 결과에 따라 Phase 1 진행 또는 대안 라이브러리 결정

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
