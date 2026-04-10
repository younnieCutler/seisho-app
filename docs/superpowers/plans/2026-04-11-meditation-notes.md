# 묵상 노트 (Meditation Notes) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 사용자가 성경 읽기를 완료한 후 짧은 묵상 메모를 기록할 수 있도록 하여, 앱이 "읽기 트래커"가 아닌 "묵상 앱"이 되도록 한다.

**Architecture:** 읽기 완료 버튼 탭 시 같은 화면 하단에 텍스트 입력창이 인라인으로 펼쳐진다 (새 화면 이동 없음, 마찰 최소화). 노트는 MMKV에 로컬 저장 (`meditation.notes` 키, JSON 배열). 기록 화면(RecordScreen)에 최근 노트 목록을 GrassGraph 아래에 추가한다.

**Tech Stack:** React Native (Expo SDK 54), TypeScript, react-native-mmkv, Jest + React Native Testing Library

---

## File Map

| 경로 | 변경 유형 | 역할 |
|------|----------|------|
| `src/lib/storage.ts` | Modify | `MeditationNote` 타입 + CRUD 함수 추가 |
| `src/lib/__tests__/storage.test.ts` | Modify | 노트 함수 테스트 추가 |
| `src/screens/ReadingScreen.tsx` | Modify | 읽기 완료 후 노트 입력 UI (인라인 펼치기) |
| `src/screens/RecordScreen.tsx` | Modify | 최근 묵상 노트 목록 섹션 추가 |

새 파일 없음. 기존 패턴 그대로 확장.

---

## Task 1: 노트 저장 로직 추가 (`storage.ts`)

**Files:**
- Modify: `src/lib/storage.ts`
- Test: `src/lib/__tests__/storage.test.ts`

### 배경

`storage.ts`는 MMKV 기반 로컬 저장소를 관리한다. `STORAGE_KEYS`에 새 키를 추가하고, 노트 CRUD 함수 4개를 추가한다. 기존 `getReadDates` / `markReadToday` 패턴을 그대로 따른다.

**추가할 타입:**
```typescript
export interface MeditationNote {
  date: string    // "YYYY-MM-DD"
  content: string // 사용자 입력 텍스트
}
```

**추가할 스토리지 키:**
```typescript
MEDITATION_NOTES: 'meditation.notes',  // JSON.stringify(MeditationNote[])
```

**추가할 함수:**
```typescript
getMeditationNotes(): MeditationNote[]
saveMeditationNote(date: string, content: string): void
getMeditationNoteByDate(date: string): MeditationNote | undefined
deleteMeditationNote(date: string): void
```

- [ ] **Step 1: 실패 테스트 작성**

`src/lib/__tests__/storage.test.ts` 파일 끝에 다음을 추가한다:

```typescript
describe('getMeditationNotes / saveMeditationNote', () => {
  it('저장 전에는 빈 배열 반환', () => {
    expect(getMeditationNotes()).toEqual([])
  })

  it('노트 저장 후 조회', () => {
    saveMeditationNote('2026-04-01', '오늘 시편 23편이 마음에 닿았다')
    const notes = getMeditationNotes()
    expect(notes).toHaveLength(1)
    expect(notes[0]).toEqual({ date: '2026-04-01', content: '오늘 시편 23편이 마음에 닿았다' })
  })

  it('같은 날짜 중복 저장 시 최신값으로 덮어씀', () => {
    saveMeditationNote('2026-04-01', '처음 메모')
    saveMeditationNote('2026-04-01', '수정된 메모')
    const notes = getMeditationNotes()
    expect(notes).toHaveLength(1)
    expect(notes[0].content).toBe('수정된 메모')
  })

  it('빈 content 저장 시 아무것도 저장 안 함', () => {
    saveMeditationNote('2026-04-01', '  ')
    expect(getMeditationNotes()).toEqual([])
  })

  it('getMeditationNoteByDate — 없는 날짜는 undefined', () => {
    expect(getMeditationNoteByDate('2026-04-01')).toBeUndefined()
  })

  it('getMeditationNoteByDate — 저장된 날짜는 노트 반환', () => {
    saveMeditationNote('2026-04-01', '말씀 묵상')
    const note = getMeditationNoteByDate('2026-04-01')
    expect(note).toEqual({ date: '2026-04-01', content: '말씀 묵상' })
  })

  it('deleteMeditationNote — 해당 날짜 노트만 삭제', () => {
    saveMeditationNote('2026-04-01', 'A')
    saveMeditationNote('2026-03-31', 'B')
    deleteMeditationNote('2026-04-01')
    const notes = getMeditationNotes()
    expect(notes).toHaveLength(1)
    expect(notes[0].date).toBe('2026-03-31')
  })
})
```

import 줄도 업데이트한다 (파일 상단):
```typescript
import { storage, getReadDates, markReadToday, isOnboarded, setOnboarded, getAgeGroup, getUserId, setUserId, getNickname, setNickname, STORAGE_KEYS, getMeditationNotes, saveMeditationNote, getMeditationNoteByDate, deleteMeditationNote } from '../storage'
```

- [ ] **Step 2: 테스트 실행 → FAIL 확인**

```bash
cd /Users/macbook/seisho-app && npx jest src/lib/__tests__/storage.test.ts --no-coverage 2>&1 | tail -20
```

Expected: `getMeditationNotes is not a function` 같은 에러로 FAIL

- [ ] **Step 3: `storage.ts` 구현 추가**

`src/lib/storage.ts`의 `STORAGE_KEYS` 상수에 한 줄 추가:
```typescript
export const STORAGE_KEYS = {
  ONBOARDED: 'user.onboarded',
  AGE_GROUP: 'user.age_group',
  READ_DATES: 'reading.dates',
  USER_ID: 'user.id',
  NICKNAME: 'user.nickname',
  MEDITATION_NOTES: 'meditation.notes',  // ← 추가
} as const
```

파일 끝에 타입 + 함수 4개 추가:
```typescript
export interface MeditationNote {
  date: string
  content: string
}

export function getMeditationNotes(): MeditationNote[] {
  const raw = storage.getString(STORAGE_KEYS.MEDITATION_NOTES)
  return raw ? JSON.parse(raw) : []
}

export function saveMeditationNote(date: string, content: string): void {
  if (!content.trim()) return
  const notes = getMeditationNotes().filter(n => n.date !== date)
  storage.set(STORAGE_KEYS.MEDITATION_NOTES, JSON.stringify([...notes, { date, content: content.trim() }]))
}

export function getMeditationNoteByDate(date: string): MeditationNote | undefined {
  return getMeditationNotes().find(n => n.date === date)
}

export function deleteMeditationNote(date: string): void {
  const notes = getMeditationNotes().filter(n => n.date !== date)
  storage.set(STORAGE_KEYS.MEDITATION_NOTES, JSON.stringify(notes))
}
```

- [ ] **Step 4: 테스트 실행 → PASS 확인**

```bash
cd /Users/macbook/seisho-app && npx jest src/lib/__tests__/storage.test.ts --no-coverage 2>&1 | tail -10
```

Expected: 모든 테스트 PASS, 0 failures

- [ ] **Step 5: 커밋**

```bash
cd /Users/macbook/seisho-app && git add src/lib/storage.ts src/lib/__tests__/storage.test.ts && git commit -m "feat: add meditation note storage functions"
```

---

## Task 2: ReadingScreen에 노트 입력 UI 추가

**Files:**
- Modify: `src/screens/ReadingScreen.tsx`

### 배경

"묵상 완료" 버튼을 탭하면 두 단계로 동작한다:
1. `readToday` 상태를 true로 바꾸고 기존 로직 실행 (변경 없음)
2. 버튼 아래에 `noteVisible` 상태가 true이면 TextInput + "저장" / "건너뛰기" 버튼이 나타남

노트 입력은 선택사항이다. "건너뛰기"를 누르면 닫힘. "저장"을 누르면 `saveMeditationNote` 호출 후 닫힘.

기존에 `readToday`가 이미 true이면 (당일 재진입 시), 버튼 대신 "✦ 오늘 읽기 완료"가 표시된다. 이미 노트가 있으면 노트 내용을 TextInput에 preload한다.

### 상태 추가

```typescript
const [noteVisible, setNoteVisible] = useState(false)
const [noteText, setNoteText] = useState('')
```

### `handleMarkRead` 수정

기존:
```typescript
function handleMarkRead() {
  markReadToday()
  syncVerseRead(getUserId() || null, getKSTDateString()).catch(() => {})
  setReadToday(true)
}
```

변경 후:
```typescript
function handleMarkRead() {
  markReadToday()
  syncVerseRead(getUserId() || null, getKSTDateString()).catch(() => {})
  setReadToday(true)
  const existing = getMeditationNoteByDate(getKSTDateString(getTodayKST()))
  setNoteText(existing?.content ?? '')
  setNoteVisible(true)
}
```

### 노트 저장/건너뛰기 핸들러

```typescript
function handleSaveNote() {
  if (noteText.trim()) {
    saveMeditationNote(getKSTDateString(getTodayKST()), noteText)
  }
  setNoteVisible(false)
}

function handleSkipNote() {
  setNoteVisible(false)
}
```

### UI 추가 (footer 영역)

현재 footer는 button 하나만 있다. `noteVisible`이 true일 때 버튼 위에 노트 입력 패널을 추가한다:

```tsx
<View style={[styles.footer, { paddingBottom: insets.bottom + 20, backgroundColor: `${colors.background}cc` }]}>
  {noteVisible && (
    <View style={[styles.notePanel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.noteLabel, { color: colors.textSecondary }]}>오늘 묵상을 짧게 기록해보세요</Text>
      <TextInput
        style={[styles.noteInput, { color: colors.text, borderColor: colors.border }]}
        value={noteText}
        onChangeText={setNoteText}
        placeholder="마음에 닿은 말씀이나 생각..."
        placeholderTextColor={colors.textMuted}
        multiline
        autoFocus
        maxLength={500}
      />
      <View style={styles.noteActions}>
        <TouchableOpacity onPress={handleSkipNote} style={styles.skipButton}>
          <Text style={[styles.skipText, { color: colors.textMuted }]}>건너뛰기</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSaveNote}
          style={[styles.saveNoteButton, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.saveNoteText}>저장</Text>
        </TouchableOpacity>
      </View>
    </View>
  )}

  <TouchableOpacity
    style={[styles.button, { backgroundColor: colors.primary }, readToday && { backgroundColor: colors.border }]}
    onPress={handleMarkRead}
    disabled={readToday}
    activeOpacity={0.8}
  >
    <Text style={[styles.buttonText, readToday && { color: colors.textMuted }]}>
      {readToday ? '✦ 오늘 읽기 완료' : '묵상 완료'}
    </Text>
  </TouchableOpacity>
</View>
```

### 추가할 스타일

```typescript
notePanel: {
  borderRadius: 20,
  padding: 16,
  marginBottom: 12,
  borderWidth: 1,
},
noteLabel: {
  fontFamily: FontFamily.interface,
  fontSize: FontSize.xs,
  marginBottom: 10,
},
noteInput: {
  fontFamily: FontFamily.content,
  fontSize: FontSize.md,
  lineHeight: 24,
  minHeight: 80,
  maxHeight: 140,
  borderWidth: 1,
  borderRadius: 12,
  padding: 12,
  marginBottom: 12,
  textAlignVertical: 'top',
},
noteActions: {
  flexDirection: 'row',
  justifyContent: 'flex-end',
  gap: 12,
},
skipButton: {
  paddingVertical: 8,
  paddingHorizontal: 16,
},
skipText: {
  fontFamily: FontFamily.interface,
  fontSize: FontSize.sm,
},
saveNoteButton: {
  paddingVertical: 8,
  paddingHorizontal: 20,
  borderRadius: 20,
},
saveNoteText: {
  fontFamily: FontFamily.interfaceBold,
  fontSize: FontSize.sm,
  color: '#fff',
},
```

### import 추가 필요

```typescript
import { markReadToday, getReadDates, getUserId, getMeditationNoteByDate, saveMeditationNote } from '../lib/storage'
```

- [ ] **Step 1: ReadingScreen.tsx 전체를 위 명세대로 수정**

수정 포인트 체크리스트:
- [ ] `import` 줄에 `getMeditationNoteByDate`, `saveMeditationNote` 추가
- [ ] `import { TextInput }` — 이미 있는지 확인 (없으면 추가)
- [ ] `noteVisible`, `noteText` useState 추가
- [ ] `handleMarkRead` 수정
- [ ] `handleSaveNote`, `handleSkipNote` 함수 추가
- [ ] JSX footer 영역에 `notePanel` 추가
- [ ] `styles` 객체에 6개 스타일 추가

- [ ] **Step 2: 앱 수동 확인**

```bash
cd /Users/macbook/seisho-app && npx expo start --clear
```

시뮬레이터에서:
1. Reading 탭 → "묵상 완료" 탭
2. 노트 입력창이 버튼 위에 나타나는지 확인
3. 텍스트 입력 후 "저장" → 패널 사라지는지 확인
4. "건너뛰기" → 패널 사라지는지 확인
5. 앱 재시작 후 Reading 탭 → 버튼이 "✦ 오늘 읽기 완료"인지 확인

- [ ] **Step 3: 커밋**

```bash
cd /Users/macbook/seisho-app && git add src/screens/ReadingScreen.tsx && git commit -m "feat: add meditation note input panel to reading completion"
```

---

## Task 3: RecordScreen에 최근 묵상 노트 목록 추가

**Files:**
- Modify: `src/screens/RecordScreen.tsx`

### 배경

RecordScreen은 현재 스트릭 숫자 + GrassGraph만 표시한다. GrassGraph 아래에 "묵상 노트" 섹션을 추가한다. 최근 7개 노트를 날짜 역순으로 보여준다. 노트가 없으면 빈 상태 문구를 표시한다.

### 추가할 내용

**import 추가:**
```typescript
import { ScrollView } from 'react-native'
import { getMeditationNotes, MeditationNote } from '../lib/storage'
```

**컴포넌트 내부에 데이터 추가:**
```typescript
const recentNotes = getMeditationNotes()
  .sort((a, b) => b.date.localeCompare(a.date))
  .slice(0, 7)
```

**JSX 구조 변경:**

현재 `View`를 `ScrollView`로 교체하고, 카드 내부에 노트 섹션 추가:

```tsx
export function RecordScreen() {
  const insets = useSafeAreaInsets()
  const { colors } = useTheme()
  const dates = getReadDates()
  const today = getKSTDateString(getTodayKST())
  const streak = calcStreak(dates, today)
  const recentNotes = getMeditationNotes()
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 7)

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={[styles.title, { color: colors.text }]}>나의 성과</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>꾸준함이 영성을 만듭니다</Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface }, CommonStyles.shadow]}>
        <View style={styles.streakInfo}>
          <Text style={[styles.streakNum, { color: colors.primary }]}>{streak}</Text>
          <Text style={[styles.streakLabel, { color: colors.textMuted }]}>Days Streak</Text>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>활동 기록</Text>
        <GrassGraph readDates={dates} />
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface, marginTop: 16 }, CommonStyles.shadow]}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>묵상 노트</Text>

        {recentNotes.length === 0 ? (
          <Text style={[styles.emptyNote, { color: colors.textMuted }]}>
            아직 묵상 노트가 없습니다.{'\n'}읽기를 완료하고 첫 기록을 남겨보세요.
          </Text>
        ) : (
          recentNotes.map(note => (
            <View key={note.date} style={[styles.noteItem, { borderBottomColor: colors.border }]}>
              <Text style={[styles.noteDate, { color: colors.textMuted }]}>{note.date}</Text>
              <Text style={[styles.noteContent, { color: colors.text }]}>{note.content}</Text>
            </View>
          ))
        )}
      </View>

      <View style={{ height: insets.bottom + 24 }} />
    </ScrollView>
  )
}
```

**추가할 스타일:**
```typescript
emptyNote: {
  fontFamily: FontFamily.interface,
  fontSize: FontSize.sm,
  lineHeight: 22,
  textAlign: 'center',
  paddingVertical: 16,
},
noteItem: {
  paddingVertical: 16,
  borderBottomWidth: 1,
},
noteDate: {
  fontFamily: FontFamily.interface,
  fontSize: FontSize.xxs,
  marginBottom: 6,
},
noteContent: {
  fontFamily: FontFamily.content,
  fontSize: FontSize.md,
  lineHeight: 24,
},
```

기존 `container` 스타일에서 `flex: 1`은 그대로 유지한다.

- [ ] **Step 1: RecordScreen.tsx 전체를 위 명세대로 수정**

수정 포인트 체크리스트:
- [ ] `import { View, Text, StyleSheet }` → `import { View, Text, StyleSheet, ScrollView }` 로 변경
- [ ] `import { getMeditationNotes, MeditationNote }` 추가 (MeditationNote는 타입으로만 사용)
- [ ] `recentNotes` 변수 추가
- [ ] 최상위 `View` → `ScrollView`로 교체
- [ ] 두 번째 카드 블록(묵상 노트 섹션) 추가
- [ ] 하단 여백 `View` 추가
- [ ] 스타일 4개 추가

- [ ] **Step 2: 앱 수동 확인**

```bash
cd /Users/macbook/seisho-app && npx expo start --clear
```

시뮬레이터에서:
1. Reading 탭 → 묵상 완료 + 노트 입력 + 저장
2. Record 탭 → "묵상 노트" 섹션에 방금 입력한 내용 표시 확인
3. 노트가 없는 초기 상태에서는 안내 문구 표시 확인
4. 스크롤이 부드럽게 동작하는지 확인

- [ ] **Step 3: 커밋**

```bash
cd /Users/macbook/seisho-app && git add src/screens/RecordScreen.tsx && git commit -m "feat: show meditation notes history in record screen"
```

---

## Self-Review

### Spec Coverage 체크

| 요구사항 | 구현 태스크 |
|---------|------------|
| 묵상 노트 CRUD 로직 | Task 1 — storage.ts |
| 읽기 완료 후 노트 입력 UI | Task 2 — ReadingScreen |
| 노트 목록 조회 (RecordScreen) | Task 3 — RecordScreen |
| 같은 날 재입력 시 덮어쓰기 | Task 1 — `saveMeditationNote` 필터 로직 |
| 빈 입력 저장 방지 | Task 1 — `if (!content.trim()) return` |
| 건너뛰기 (선택적 입력) | Task 2 — `handleSkipNote` |
| 기존 노트 preload (재진입 시) | Task 2 — `handleMarkRead`의 `existing` |

### Placeholder 스캔
없음. 모든 단계에 실제 코드 포함.

### Type 일관성
- `MeditationNote` 타입은 Task 1에서 정의, Task 2-3에서 import해서 사용
- `saveMeditationNote(date, content)` 시그니처가 Task 1 정의와 Task 2 호출에서 일치
- `getMeditationNoteByDate(date)` 반환 타입 `MeditationNote | undefined`가 Task 2 optional chaining (`existing?.content`)과 일치

---

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | — | — |
| Codex Review | `/codex review` | Independent 2nd opinion | 0 | — | — |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 0 | — | — |
| Design Review | `/plan-design-review` | UI/UX gaps | 0 | — | — |
| DX Review | `/plan-devex-review` | Developer experience gaps | 0 | — | — |

**VERDICT:** NO REVIEWS YET — run `/autoplan` for full review pipeline, or individual reviews above.
