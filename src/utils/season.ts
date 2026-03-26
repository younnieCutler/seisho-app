import { Temporal } from '@js-temporal/polyfill'
import computus from 'computus'

export type LiturgySeason =
  | 'ADVENT'     // 대림절
  | 'CHRISTMAS'  // 성탄절
  | 'EPIPHANY'   // 주현절
  | 'LENT'       // 사순절
  | 'HOLY_WEEK'  // 고난주간
  | 'EASTER'     // 부활절
  | 'PENTECOST'  // 성령강림절
  | 'ORDINARY'   // 일반 주일

function getEaster(year: number): Temporal.PlainDate {
  const { month, day } = computus(year)
  return Temporal.PlainDate.from({ year, month, day })
}

// 대림절 첫날: 성탄절 전 4번째 일요일 (11/27 ~ 12/3 사이)
function getAdventStart(year: number): Temporal.PlainDate {
  const dec25 = Temporal.PlainDate.from({ year, month: 12, day: 25 })
  // Temporal: 1=월, 7=일
  const dow = dec25.dayOfWeek
  // dow: Mon=1 ... Sun=7. 크리스마스 직전 일요일까지의 거리 = dow (일요일이면 7)
  return dec25.subtract({ days: dow + 21 })
}

function isBetween(
  date: Temporal.PlainDate,
  start: Temporal.PlainDate,
  end: Temporal.PlainDate,
): boolean {
  return (
    Temporal.PlainDate.compare(date, start) >= 0 &&
    Temporal.PlainDate.compare(date, end) <= 0
  )
}

export function getCurrentSeason(date: Temporal.PlainDate): LiturgySeason {
  const year = date.year

  // --- 성탄절: 12/25 ~ 다음해 1/5 ---
  const dec25 = Temporal.PlainDate.from({ year, month: 12, day: 25 })
  if (Temporal.PlainDate.compare(date, dec25) >= 0) {
    return 'CHRISTMAS'
  }
  const jan5 = Temporal.PlainDate.from({ year, month: 1, day: 5 })
  if (Temporal.PlainDate.compare(date, jan5) <= 0) {
    return 'CHRISTMAS'
  }

  // 이 시점: 1/6 ~ 12/24 범위

  // --- 대림절: adventStart ~ 12/24 ---
  const dec24 = Temporal.PlainDate.from({ year, month: 12, day: 24 })
  const adventStart = getAdventStart(year)
  if (isBetween(date, adventStart, dec24)) {
    return 'ADVENT'
  }

  // --- 부활절 기준 절기 ---
  const easter = getEaster(year)
  const ashWednesday = easter.subtract({ days: 46 })
  const palmSunday = easter.subtract({ days: 7 })
  const holySaturday = easter.subtract({ days: 1 })
  const pentecost = easter.add({ days: 49 })

  // 고난주간: 종려주일 ~ 성토요일
  if (isBetween(date, palmSunday, holySaturday)) {
    return 'HOLY_WEEK'
  }
  // 사순절: 재의 수요일 ~ 종려주일 전날
  if (isBetween(date, ashWednesday, palmSunday.subtract({ days: 1 }))) {
    return 'LENT'
  }
  // 부활절: 부활절 ~ 성령강림절 전날
  if (isBetween(date, easter, pentecost.subtract({ days: 1 }))) {
    return 'EASTER'
  }
  // 성령강림절
  if (Temporal.PlainDate.compare(date, pentecost) === 0) {
    return 'PENTECOST'
  }
  // 주현절: 1/6 ~ 재의 수요일 전날
  const jan6 = Temporal.PlainDate.from({ year, month: 1, day: 6 })
  if (isBetween(date, jan6, ashWednesday.subtract({ days: 1 }))) {
    return 'EPIPHANY'
  }

  return 'ORDINARY'
}
