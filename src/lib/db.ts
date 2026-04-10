import type { SQLiteDatabase } from 'expo-sqlite'

export type { SQLiteDatabase }

function decodeHtml(text: string): string {
  return text
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

export type Verse = {
  book: string
  chapter: number
  verse: number
  text: string
}

const SELECT_VERSES = `
  SELECT b.name as book, v.chapter, v.verse, v.text
  FROM verses v
  JOIN books b ON v.book_id = b.id
  WHERE b.name = ? AND v.chapter = ?
  ORDER BY v.verse
`

const SELECT_VERSE_RANGE = `
  SELECT b.name as book, v.chapter, v.verse, v.text
  FROM verses v
  JOIN books b ON v.book_id = b.id
  WHERE b.name = ? AND v.chapter = ? AND v.verse >= ? AND v.verse <= ?
  ORDER BY v.verse
`

export async function getVersesByChapter(
  db: SQLiteDatabase,
  book: string,
  chapter: number,
): Promise<Verse[]> {
  const rows = await db.getAllAsync<Verse>(SELECT_VERSES, [book, chapter])
  return rows.map((v) => ({ ...v, text: decodeHtml(v.text) }))
}

export async function getVerseRange(
  db: SQLiteDatabase,
  book: string,
  chapter: number,
  startVerse: number,
  endVerse: number,
): Promise<Verse[]> {
  const rows = await db.getAllAsync<Verse>(SELECT_VERSE_RANGE, [book, chapter, startVerse, endVerse])
  return rows.map((v) => ({ ...v, text: decodeHtml(v.text) }))
}
