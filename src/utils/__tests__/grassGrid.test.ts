import { buildGridDates } from '../grassGrid'

describe('buildGridDates', () => {
  it('오늘 하루만 → [today]', () => {
    expect(buildGridDates('2026-04-01', 1)).toEqual(['2026-04-01'])
  })

  it('7일 → 오늘 포함 7개, 오래된 것부터 순서', () => {
    const result = buildGridDates('2026-04-01', 7)
    expect(result).toHaveLength(7)
    expect(result[0]).toBe('2026-03-26')
    expect(result[6]).toBe('2026-04-01')
  })

  it('84일(12주) → 84개', () => {
    expect(buildGridDates('2026-04-01', 84)).toHaveLength(84)
  })

  it('연월 경계 넘기 (3/1 기준 7일 → 2월 포함)', () => {
    const result = buildGridDates('2026-03-01', 7)
    expect(result[0]).toBe('2026-02-23')
    expect(result[6]).toBe('2026-03-01')
  })

  it('윤년 경계 (2028-03-01 기준 3일 → 2028-02-29 포함)', () => {
    const result = buildGridDates('2028-03-01', 3)
    expect(result).toEqual(['2028-02-28', '2028-02-29', '2028-03-01'])
  })
})
