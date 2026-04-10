// storage.ts 테스트 — MMKV는 __mocks__/react-native-mmkv.ts로 모킹

// date 모킹: 오늘 날짜를 고정값으로 제어
jest.mock('../../utils/date', () => ({
  getTodayKST: () => ({ year: 2026, month: 4, day: 1 }),
  getKSTDateString: (d: { year: number; month: number; day: number }) =>
    `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`,
}))

import { storage, getReadDates, markReadToday, isOnboarded, setOnboarded, getAgeGroup, getUserId, setUserId, getNickname, setNickname, STORAGE_KEYS, getMeditationNotes, saveMeditationNote, getMeditationNoteByDate, deleteMeditationNote } from '../storage'

beforeEach(() => {
  // MMKV 인스턴스는 모듈 레벨에서 생성되므로 테스트 간 격리를 위해 clearAll
  ;(storage as any).clearAll()
})

describe('getReadDates', () => {
  it('저장 전에는 빈 배열 반환', () => {
    expect(getReadDates()).toEqual([])
  })

  it('저장된 날짜 배열 반환', () => {
    storage.set(STORAGE_KEYS.READ_DATES, JSON.stringify(['2026-04-01', '2026-03-31']))
    expect(getReadDates()).toEqual(['2026-04-01', '2026-03-31'])
  })
})

describe('markReadToday', () => {
  it('오늘 날짜(2026-04-01)를 추가', () => {
    markReadToday()
    expect(getReadDates()).toContain('2026-04-01')
  })

  it('중복 호출 시 중복 저장 방지', () => {
    markReadToday()
    markReadToday()
    const dates = getReadDates()
    expect(dates.filter(d => d === '2026-04-01').length).toBe(1)
  })

  it('기존 날짜를 유지하며 오늘 추가', () => {
    storage.set(STORAGE_KEYS.READ_DATES, JSON.stringify(['2026-03-31']))
    markReadToday()
    const dates = getReadDates()
    expect(dates).toContain('2026-03-31')
    expect(dates).toContain('2026-04-01')
  })
})

describe('getUserId / setUserId', () => {
  it('returns undefined when no user_id stored', () => {
    expect(getUserId()).toBeUndefined()
  })

  it('stores and retrieves user_id', () => {
    const id = '550e8400-e29b-41d4-a716-446655440000'
    setUserId(id)
    expect(getUserId()).toBe(id)
  })
})

describe('isOnboarded / setOnboarded', () => {
  it('기본값 false', () => {
    expect(isOnboarded()).toBe(false)
  })

  it('setOnboarded 후 true', () => {
    setOnboarded('20대')
    expect(isOnboarded()).toBe(true)
  })

  it('getAgeGroup이 setOnboarded의 ageGroup 반환', () => {
    setOnboarded('30대')
    expect(getAgeGroup()).toBe('30대')
  })
})

describe('getNickname / setNickname', () => {
  it('저장 전에는 undefined 반환', () => {
    expect(getNickname()).toBeUndefined()
  })

  it('setNickname 후 getNickname 반환', () => {
    setNickname('말씀이')
    expect(getNickname()).toBe('말씀이')
  })
})

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
