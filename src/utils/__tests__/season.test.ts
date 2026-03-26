import { Temporal } from '@js-temporal/polyfill'
import { getCurrentSeason } from '../season'

function d(dateStr: string) {
  return Temporal.PlainDate.from(dateStr)
}

// 연도별 핵심 날짜 (computus 기반)
// Year  Easter     AshWed     PalmSun    Pentecost  Advent
// 2025  2025-04-20 2025-03-05 2025-04-13 2025-06-08 2025-11-30
// 2026  2026-04-05 2026-02-18 2026-03-29 2026-05-24 2026-11-29
// 2027  2027-03-28 2027-02-10 2027-03-21 2027-05-16 2027-11-28
// 2028  2028-04-16 2028-02-29 2028-04-09 2028-06-04 2028-12-03
// 2029  2029-04-01 2029-02-14 2029-03-25 2029-05-20 2029-12-02
// 2030  2030-04-21 2030-03-06 2030-04-14 2030-06-09 2030-12-01

describe('getCurrentSeason — 2026 기준', () => {
  // 부활절: 2026-04-05 (computus 확인됨)
  // 재의 수요일: 2026-02-18
  // 종려주일: 2026-03-29
  // 성령강림절: 2026-05-24
  // 대림절 시작: 2026-11-29

  describe('EASTER (부활절)', () => {
    it('부활절 당일은 EASTER', () => {
      expect(getCurrentSeason(d('2026-04-05'))).toBe('EASTER')
    })
    it('부활절 후 49일차(성령강림절 전날)는 EASTER', () => {
      expect(getCurrentSeason(d('2026-05-23'))).toBe('EASTER')
    })
    it('부활절 후 20일은 EASTER', () => {
      expect(getCurrentSeason(d('2026-04-25'))).toBe('EASTER')
    })
  })

  describe('PENTECOST (성령강림절)', () => {
    it('성령강림절은 PENTECOST', () => {
      expect(getCurrentSeason(d('2026-05-24'))).toBe('PENTECOST')
    })
  })

  describe('HOLY_WEEK (고난주간)', () => {
    it('종려주일은 HOLY_WEEK', () => {
      expect(getCurrentSeason(d('2026-03-29'))).toBe('HOLY_WEEK')
    })
    it('성토요일(부활절 전날)은 HOLY_WEEK', () => {
      expect(getCurrentSeason(d('2026-04-04'))).toBe('HOLY_WEEK')
    })
    it('고난주간 중간(수요일)은 HOLY_WEEK', () => {
      expect(getCurrentSeason(d('2026-04-01'))).toBe('HOLY_WEEK')
    })
  })

  describe('LENT (사순절)', () => {
    it('재의 수요일은 LENT', () => {
      expect(getCurrentSeason(d('2026-02-18'))).toBe('LENT')
    })
    it('종려주일 전날은 LENT', () => {
      expect(getCurrentSeason(d('2026-03-28'))).toBe('LENT')
    })
    it('사순절 중간은 LENT', () => {
      expect(getCurrentSeason(d('2026-03-01'))).toBe('LENT')
    })
  })

  describe('ADVENT (대림절)', () => {
    it('대림절 첫날(2026-11-29)은 ADVENT', () => {
      expect(getCurrentSeason(d('2026-11-29'))).toBe('ADVENT')
    })
    it('12월 중순은 ADVENT', () => {
      expect(getCurrentSeason(d('2026-12-15'))).toBe('ADVENT')
    })
    it('성탄 전날(12-24)은 ADVENT', () => {
      expect(getCurrentSeason(d('2026-12-24'))).toBe('ADVENT')
    })
  })

  describe('CHRISTMAS (성탄절)', () => {
    it('12월 25일은 CHRISTMAS', () => {
      expect(getCurrentSeason(d('2026-12-25'))).toBe('CHRISTMAS')
    })
    it('12월 31일은 CHRISTMAS', () => {
      expect(getCurrentSeason(d('2026-12-31'))).toBe('CHRISTMAS')
    })
    it('1월 5일은 CHRISTMAS (성탄 12일)', () => {
      expect(getCurrentSeason(d('2027-01-05'))).toBe('CHRISTMAS')
    })
  })

  describe('EPIPHANY (주현절)', () => {
    it('1월 6일은 EPIPHANY', () => {
      expect(getCurrentSeason(d('2026-01-06'))).toBe('EPIPHANY')
    })
    it('재의 수요일 전날은 EPIPHANY', () => {
      expect(getCurrentSeason(d('2026-02-17'))).toBe('EPIPHANY')
    })
  })

  describe('ORDINARY (일반 주일)', () => {
    it('성령강림절 다음날은 ORDINARY', () => {
      expect(getCurrentSeason(d('2026-05-25'))).toBe('ORDINARY')
    })
    it('여름은 ORDINARY', () => {
      expect(getCurrentSeason(d('2026-07-04'))).toBe('ORDINARY')
    })
    it('대림절 전날은 ORDINARY', () => {
      expect(getCurrentSeason(d('2026-11-28'))).toBe('ORDINARY')
    })
  })
})

describe('getCurrentSeason — 2025-2030 연도별 경계 검증', () => {
  it('2025 부활절(4/20)은 EASTER', () => {
    expect(getCurrentSeason(d('2025-04-20'))).toBe('EASTER')
  })
  it('2025 재의 수요일(3/5)은 LENT', () => {
    expect(getCurrentSeason(d('2025-03-05'))).toBe('LENT')
  })
  it('2025 성령강림절(6/8)은 PENTECOST', () => {
    expect(getCurrentSeason(d('2025-06-08'))).toBe('PENTECOST')
  })
  it('2025 대림절 시작(11/30)은 ADVENT', () => {
    expect(getCurrentSeason(d('2025-11-30'))).toBe('ADVENT')
  })

  it('2027 부활절(3/28)은 EASTER', () => {
    expect(getCurrentSeason(d('2027-03-28'))).toBe('EASTER')
  })
  it('2027 종려주일(3/21)은 HOLY_WEEK', () => {
    expect(getCurrentSeason(d('2027-03-21'))).toBe('HOLY_WEEK')
  })
  it('2027 대림절 시작(11/28)은 ADVENT', () => {
    expect(getCurrentSeason(d('2027-11-28'))).toBe('ADVENT')
  })

  it('2028 부활절(4/16)은 EASTER', () => {
    expect(getCurrentSeason(d('2028-04-16'))).toBe('EASTER')
  })
  it('2028 재의 수요일(3/1)은 LENT', () => {
    expect(getCurrentSeason(d('2028-03-01'))).toBe('LENT')
  })
  it('2028 2/29(윤날)은 EPIPHANY (재의수요일 전)', () => {
    expect(getCurrentSeason(d('2028-02-29'))).toBe('EPIPHANY')
  })
  it('2028 대림절 시작(12/3)은 ADVENT', () => {
    expect(getCurrentSeason(d('2028-12-03'))).toBe('ADVENT')
  })

  it('2029 부활절(4/1)은 EASTER', () => {
    expect(getCurrentSeason(d('2029-04-01'))).toBe('EASTER')
  })
  it('2029 성령강림절(5/20)은 PENTECOST', () => {
    expect(getCurrentSeason(d('2029-05-20'))).toBe('PENTECOST')
  })

  it('2030 부활절(4/21)은 EASTER', () => {
    expect(getCurrentSeason(d('2030-04-21'))).toBe('EASTER')
  })
  it('2030 대림절 시작(12/1)은 ADVENT', () => {
    expect(getCurrentSeason(d('2030-12-01'))).toBe('ADVENT')
  })
})
