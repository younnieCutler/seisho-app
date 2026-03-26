// storage.ts 테스트 — MMKV는 __mocks__/react-native-mmkv.ts로 모킹

// date 모킹: 오늘 날짜를 고정값으로 제어
jest.mock('../../utils/date', () => ({
  getTodayKST: () => ({ year: 2026, month: 4, day: 1 }),
  getKSTDateString: (d: { year: number; month: number; day: number }) =>
    `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`,
}))

import { storage, getReadDates, markReadToday, isOnboarded, setOnboarded, getAgeGroup, STORAGE_KEYS } from '../storage'

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
