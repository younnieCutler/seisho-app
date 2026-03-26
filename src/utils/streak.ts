/**
 * 연속 읽기 스트릭 계산
 * @param dates - "YYYY-MM-DD" 형식의 읽은 날 배열 (순서/중복 무관)
 * @param today - "YYYY-MM-DD" 형식의 오늘 날짜
 * @returns 오늘 포함 연속 읽기 일수. 오늘 읽지 않았으면 0.
 */
export function calcStreak(dates: string[], today: string): number {
  // 중복 제거 후 Set으로 빠른 조회
  const dateSet = new Set(dates)

  // 오늘 읽지 않았으면 스트릭 없음
  if (!dateSet.has(today)) return 0

  // 오늘부터 역순으로 연속 날짜 카운트
  let streak = 0
  let current = today

  while (dateSet.has(current)) {
    streak++
    current = subtractOneDay(current)
  }

  return streak
}

function subtractOneDay(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const d = new Date(Date.UTC(year, month - 1, day - 1))
  return d.toISOString().slice(0, 10)
}
