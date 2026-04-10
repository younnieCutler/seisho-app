import { createMMKV } from 'react-native-mmkv'
import { getTodayKST, getKSTDateString } from '../utils/date'

export const storage = createMMKV()

export const STORAGE_KEYS = {
  ONBOARDED: 'user.onboarded',
  AGE_GROUP: 'user.age_group',
  READ_DATES: 'reading.dates',  // JSON.stringify(string[]) — "YYYY-MM-DD" 배열
  USER_ID: 'user.id',           // Supabase 익명 인증 user_id
  NICKNAME: 'user.nickname',
  MEDITATION_NOTES: 'meditation.notes',
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

export function getUserId(): string | undefined {
  return storage.getString(STORAGE_KEYS.USER_ID)
}

export function setUserId(id: string): void {
  storage.set(STORAGE_KEYS.USER_ID, id)
}

export function getNickname(): string | undefined {
  return storage.getString(STORAGE_KEYS.NICKNAME)
}

export function setNickname(name: string): void {
  storage.set(STORAGE_KEYS.NICKNAME, name)
}

export interface MeditationNote {
  date: string
  content: string
}

export function getMeditationNotes(): MeditationNote[] {
  const raw = storage.getString(STORAGE_KEYS.MEDITATION_NOTES)
  return raw ? JSON.parse(raw) : []
}

export function saveMeditationNote(date: string, content: string): void {
  if (!content.trim()) return
  const notes = getMeditationNotes().filter(n => n.date !== date)
  storage.set(STORAGE_KEYS.MEDITATION_NOTES, JSON.stringify([...notes, { date, content: content.trim() }]))
}

export function getMeditationNoteByDate(date: string): MeditationNote | undefined {
  return getMeditationNotes().find(n => n.date === date)
}

export function deleteMeditationNote(date: string): void {
  const notes = getMeditationNotes().filter(n => n.date !== date)
  storage.set(STORAGE_KEYS.MEDITATION_NOTES, JSON.stringify(notes))
}
