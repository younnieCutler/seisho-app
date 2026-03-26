import { calcStreak } from '../streak'

// 기준: 오늘 날짜를 주입받아 테스트 가능하게
// calcStreak(dates: string[], today: string): number
// dates: "YYYY-MM-DD" 배열 (중복 없음, 정렬 불필요)
// today: "YYYY-MM-DD" 오늘 날짜

describe('calcStreak', () => {
  describe('빈 배열', () => {
    it('읽은 날이 없으면 0', () => {
      expect(calcStreak([], '2026-04-01')).toBe(0)
    })
  })

  describe('오늘 하루만 읽음', () => {
    it('오늘만 읽었으면 스트릭 1', () => {
      expect(calcStreak(['2026-04-01'], '2026-04-01')).toBe(1)
    })
  })

  describe('연속 읽기', () => {
    it('오늘 포함 3일 연속 → 3', () => {
      const dates = ['2026-03-30', '2026-03-31', '2026-04-01']
      expect(calcStreak(dates, '2026-04-01')).toBe(3)
    })

    it('어제까지 3일 연속, 오늘 안 읽음 → 0', () => {
      const dates = ['2026-03-29', '2026-03-30', '2026-03-31']
      expect(calcStreak(dates, '2026-04-01')).toBe(0)
    })

    it('오늘 포함 7일 연속 → 7', () => {
      const dates = [
        '2026-03-26', '2026-03-27', '2026-03-28',
        '2026-03-29', '2026-03-30', '2026-03-31', '2026-04-01',
      ]
      expect(calcStreak(dates, '2026-04-01')).toBe(7)
    })
  })

  describe('중간 단절', () => {
    it('오늘 읽고 어제 쉬고 그제 읽음 → 1 (오늘만)', () => {
      const dates = ['2026-03-30', '2026-04-01']
      expect(calcStreak(dates, '2026-04-01')).toBe(1)
    })

    it('오늘 안 읽고 이틀 전 읽고 사흘 전 읽음 → 0', () => {
      const dates = ['2026-03-30', '2026-03-29']
      expect(calcStreak(dates, '2026-04-01')).toBe(0)
    })
  })

  describe('배열 순서 무관', () => {
    it('역순으로 전달해도 동일 결과', () => {
      const dates = ['2026-04-01', '2026-03-31', '2026-03-30']
      expect(calcStreak(dates, '2026-04-01')).toBe(3)
    })

    it('섞인 순서도 동일 결과', () => {
      const dates = ['2026-03-31', '2026-04-01', '2026-03-30']
      expect(calcStreak(dates, '2026-04-01')).toBe(3)
    })
  })

  describe('어제 읽음 + 오늘 아직 안 읽음', () => {
    it('어제만 읽음 → 0 (오늘 연속 아님)', () => {
      expect(calcStreak(['2026-03-31'], '2026-04-01')).toBe(0)
    })
  })

  describe('중복 날짜 방어', () => {
    it('같은 날 중복 있어도 1로 카운트', () => {
      const dates = ['2026-04-01', '2026-04-01', '2026-03-31']
      expect(calcStreak(dates, '2026-04-01')).toBe(2)
    })
  })
})
