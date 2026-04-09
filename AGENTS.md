# AGENTS.md

Agent instructions for seisho-app. These override default agent behavior.

## Project Context

**seisho-app** — React Native (Expo SDK 54, RN 0.81.5) 신앙생활 앱.
- Language: TypeScript
- Backend: Supabase (anon auth, PostgreSQL)
- Local storage: react-native-mmkv
- DB: expo-sqlite (ko.db, 30,929 성경절)
- Testing: Jest + @testing-library/react-native
- Current phase: P6 소그룹 기능

## Behavior Rules

1. **No code without a plan** — features touching 3+ files require `/plan` first.
2. **TDD required** — write failing tests before implementation. 80% coverage minimum.
3. **Surgical changes** — only change what was requested. No adjacent cleanup.
4. **Korean copy** — all user-facing text is Korean. Match existing tone.
5. **Verify before claiming done** — run tests and show output. No speculative completion.

## Tech Constraints

- **Hermes engine** — no features requiring V8-only APIs.
- **Expo Go** — no bare native modules without EAS build setup.
- **expo-clipboard** — use instead of RN core Clipboard (removed in RN 0.81.5).
- **No toast library** — use in-component state for transient feedback.
- **NotoSerifKR** — deferred (TODO-10). Use `Platform.select({ ios: 'Georgia', android: 'serif' })` until then.

## Test Patterns

- Mock `../../lib/supabase` at module level.
- Use `jest.isolateModules` for supabase env validation tests.
- Mock `../../utils/date` → `getKSTDateString` returns fixed `'2026-04-04'` or `'2026-04-05'`.
- `subscribeToFeed` mock must return an unsubscribe function: `jest.fn().mockReturnValue(jest.fn())`.

## File Structure

```
src/
  lib/          — Supabase queries, storage, groups, feed
  screens/      — React Native screens
  navigation/   — AppNavigator
  utils/        — date, etc.
  __tests__/    — mirrors src/ structure
supabase/
  migrations/   — SQL migration files (001–004)
assets/
  bible/ko.db   — SQLite 성경 DB
```

## Supabase Gotcha

`supabase.ts` validates env vars at module level. In Jest, always use:
```typescript
jest.isolateModules(() => { require('../supabase') })
```
Plain `import` will throw before the test runs.
