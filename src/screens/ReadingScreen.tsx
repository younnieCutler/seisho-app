import { useEffect, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { useSQLiteContext } from 'expo-sqlite'
import { Temporal } from '@js-temporal/polyfill'
import { getCurrentSeason } from '../utils/season'
import { getVersesByChapter } from '../lib/db'
import { markReadToday, getReadDates } from '../lib/storage'
import { getTodayKST, getKSTDateString } from '../utils/date'

const SEASON_PLAN: Record<string, { book: string; chapter: number }> = {
  ADVENT:    { book: '이사야', chapter: 40 },
  CHRISTMAS: { book: '누가복음', chapter: 2 },
  EPIPHANY:  { book: '마태복음', chapter: 2 },
  LENT:      { book: '시편', chapter: 51 },
  HOLY_WEEK: { book: '마가복음', chapter: 15 },
  EASTER:    { book: '요한복음', chapter: 20 },
  PENTECOST: { book: '사도행전', chapter: 2 },
  ORDINARY:  { book: '시편', chapter: 23 },
}

interface Verse {
  verse: number
  text: string
}

export function ReadingScreen() {
  const db = useSQLiteContext()
  const [verses, setVerses] = useState<Verse[]>([])
  const [book, setBook] = useState('')
  const [chapter, setChapter] = useState(0)
  const [readToday, setReadToday] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const today = getTodayKST()
      const season = getCurrentSeason(Temporal.PlainDate.from(today))
      const plan = SEASON_PLAN[season]

      setBook(plan.book)
      setChapter(plan.chapter)

      const data = await getVersesByChapter(db, plan.book, plan.chapter)
      setVerses(data)

      const dates = getReadDates()
      setReadToday(dates.includes(getKSTDateString(today)))
      setLoading(false)
    }
    load()
  }, [])

  function handleMarkRead() {
    markReadToday()
    setReadToday(true)
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{book} {chapter}장</Text>

      <FlatList
        data={verses}
        keyExtractor={item => String(item.verse)}
        renderItem={({ item }) => (
          <View style={styles.verseRow}>
            <Text style={styles.verseNum}>{item.verse}</Text>
            <Text style={styles.verseText}>{item.text}</Text>
          </View>
        )}
        contentContainerStyle={styles.list}
      />

      <TouchableOpacity
        style={[styles.button, readToday && styles.buttonDone]}
        onPress={handleMarkRead}
        disabled={readToday}
      >
        <Text style={styles.buttonText}>{readToday ? '✓ 오늘 읽기 완료' : '읽기 완료'}</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { fontSize: 20, fontWeight: 'bold', color: '#1a1a1a', padding: 20, paddingBottom: 12 },
  list: { paddingHorizontal: 20, paddingBottom: 100 },
  verseRow: { flexDirection: 'row', marginBottom: 12 },
  verseNum: { fontSize: 12, color: '#aaa', minWidth: 28, marginTop: 3 },
  verseText: { flex: 1, fontSize: 16, lineHeight: 26, color: '#1a1a1a' },
  button: { position: 'absolute', bottom: 24, left: 20, right: 20, padding: 16, borderRadius: 12, backgroundColor: '#4A90E2', alignItems: 'center' },
  buttonDone: { backgroundColor: '#27AE60' },
  buttonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
})
