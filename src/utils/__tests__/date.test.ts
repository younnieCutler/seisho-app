import { getTodayKST, getKSTDateString } from '../date'

describe('getTodayKST', () => {
  it('Temporal.PlainDate를 반환한다', () => {
    const result = getTodayKST()
    expect(result).toBeDefined()
    expect(typeof result.year).toBe('number')
    expect(typeof result.month).toBe('number')
    expect(typeof result.day).toBe('number')
  })

  it('month는 1~12 범위이다', () => {
    const result = getTodayKST()
    expect(result.month).toBeGreaterThanOrEqual(1)
    expect(result.month).toBeLessThanOrEqual(12)
  })

  it('day는 1~31 범위이다', () => {
    const result = getTodayKST()
    expect(result.day).toBeGreaterThanOrEqual(1)
    expect(result.day).toBeLessThanOrEqual(31)
  })
})

describe('getKSTDateString', () => {
  it('YYYY-MM-DD 형식 문자열을 반환한다', () => {
    const result = getKSTDateString()
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('오늘 날짜와 일치한다', () => {
    const result = getKSTDateString()
    const today = getTodayKST()
    expect(result).toBe(today.toString())
  })
})
