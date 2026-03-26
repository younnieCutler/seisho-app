/**
 * 잔디 그래프용 날짜 그리드 생성
 * 최근 N일의 날짜 배열을 반환 (오늘 포함, 오래된 것 → 최신 순)
 */
export function buildGridDates(today: string, days: number): string[] {
  const result: string[] = []
  for (let i = days - 1; i >= 0; i--) {
    result.push(subtractDays(today, i))
  }
  return result
}

function subtractDays(dateStr: string, n: number): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const d = new Date(Date.UTC(year, month - 1, day - n))
  return d.toISOString().slice(0, 10)
}
