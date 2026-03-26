/**
 * src/lib/__tests__/db.test.ts
 *
 * db.ts TDD 테스트 — better-sqlite3로 실제 ko.db에 쿼리.
 * jest-expo 환경에서는 expo-sqlite를 직접 쓸 수 없으므로
 * better-sqlite3 기반 어댑터로 SQLiteDatabase 인터페이스를 만족시킴.
 */
import path from 'path'
import BetterSqlite3 from 'better-sqlite3'
import { getVersesByChapter, getVerseRange } from '../db'
import type { SQLiteDatabase } from '../db'

const DB_PATH = path.resolve(__dirname, '../../../assets/bible/ko.db')

function openDb(): SQLiteDatabase {
  const raw = new BetterSqlite3(DB_PATH, { readonly: true })

  // expo-sqlite SQLiteDatabase 인터페이스 중 db.ts에서 사용하는 getAllAsync만 구현
  return {
    getAllAsync<T>(sql: string, params: unknown[]): Promise<T[]> {
      const stmt = raw.prepare(sql)
      const rows = stmt.all(...params) as T[]
      return Promise.resolve(rows)
    },
  } as SQLiteDatabase
}

describe('getVersesByChapter', () => {
  let db: SQLiteDatabase

  beforeAll(() => {
    db = openDb()
  })

  it('창세기 1장 31절 전체 반환', async () => {
    const verses = await getVersesByChapter(db, '창세기', 1)
    expect(verses).toHaveLength(31)
    expect(verses[0].text).toBe('태초에 하나님이 천지를 창조하시니라')
    expect(verses[0].verse).toBe(1)
  })

  it('창세기 1:1 필드 구조 확인', async () => {
    const verses = await getVersesByChapter(db, '창세기', 1)
    expect(verses[0]).toMatchObject({
      book: '창세기',
      chapter: 1,
      verse: 1,
    })
  })

  it('존재하지 않는 장은 빈 배열 반환', async () => {
    const verses = await getVersesByChapter(db, '창세기', 999)
    expect(verses).toHaveLength(0)
  })

  it('존재하지 않는 책은 빈 배열 반환', async () => {
    const verses = await getVersesByChapter(db, '없는책', 1)
    expect(verses).toHaveLength(0)
  })
})

describe('getVerseRange', () => {
  let db: SQLiteDatabase

  beforeAll(() => {
    db = openDb()
  })

  it('요한복음 3:16-17 2절 반환', async () => {
    const verses = await getVerseRange(db, '요한복음', 3, 16, 17)
    expect(verses).toHaveLength(2)
    expect(verses[0].verse).toBe(16)
    expect(verses[1].verse).toBe(17)
  })

  it('단일 절 범위 (start === end) 1절 반환', async () => {
    const verses = await getVerseRange(db, '창세기', 1, 1, 1)
    expect(verses).toHaveLength(1)
    expect(verses[0].text).toBe('태초에 하나님이 천지를 창조하시니라')
  })

  it('존재하지 않는 범위는 빈 배열 반환', async () => {
    const verses = await getVerseRange(db, '창세기', 999, 1, 5)
    expect(verses).toHaveLength(0)
  })
})
