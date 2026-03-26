import { createMMKV } from 'react-native-mmkv'
import { getTodayKST, getKSTDateString } from '../utils/date'

export const storage = createMMKV()

export const STORAGE_KEYS = {
  ONBOARDED: 'user.onboarded',
  AGE_GROUP: 'user.age_group',
  READ_DATES: 'reading.dates',  // JSON.stringify(string[]) — "YYYY-MM-DD" 배열
} as const

export function getReadDates(): string[] {
  const raw = storage.getString(STORAGE_KEYS.READ_DATES)
  return raw ? JSON.parse(raw) : []
}

export function markReadToday(): void {
  const today = getKSTDateString(getTodayKST())
  const dates = getReadDates()
  if (!dates.includes(today)) {
    storage.set(STORAGE_KEYS.READ_DATES, JSON.stringify([...dates, today]))
  }
}

export function isOnboarded(): boolean {
  return storage.getBoolean(STORAGE_KEYS.ONBOARDED) ?? false
}

export function setOnboarded(ageGroup: string): void {
  storage.set(STORAGE_KEYS.AGE_GROUP, ageGroup)
  storage.set(STORAGE_KEYS.ONBOARDED, true)
}

export function getAgeGroup(): string | undefined {
  return storage.getString(STORAGE_KEYS.AGE_GROUP)
}
