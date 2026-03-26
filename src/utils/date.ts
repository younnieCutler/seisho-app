import { Temporal } from '@js-temporal/polyfill'

const KST = 'Asia/Seoul'

export function getTodayKST(): Temporal.PlainDate {
  return Temporal.Now.plainDateISO(KST)
}

export function getKSTDateString(date?: Temporal.PlainDate): string {
  return (date ?? getTodayKST()).toString()
}
