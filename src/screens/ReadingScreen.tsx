import { useEffect, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { useSQLiteContext } from 'expo-sqlite'
import { Temporal } from '@js-temporal/polyfill'
import { getCurrentSeason, SEASON_PLAN } from '../utils/season'
import { getVersesByChapter } from '../lib/db'
import { markReadToday, getReadDates, getUserId } from '../lib/storage'
import { syncVerseRead } from '../lib/sync'
import { getTodayKST, getKSTDateString } from '../utils/date'

// 절별 읽기 플랜은 season.ts에서 관리

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
    syncVerseRead(getUserId() || null, getKSTDateString()).catch(() => {})
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

import { Colors, FontSize, CommonStyles } from '../utils/theme'

const styles = StyleSheet.create({
  container: CommonStyles.container,
  center: CommonStyles.center,
  header: { fontSize: FontSize.lg, fontWeight: 'bold', color: Colors.text, padding: 20, paddingBottom: 12 },
  list: { paddingHorizontal: 20, paddingBottom: 100 },
  verseRow: { flexDirection: 'row', marginBottom: 12 },
  verseNum: { fontSize: FontSize.xs, color: Colors.textMuted, minWidth: 28, marginTop: 3 },
  verseText: { flex: 1, fontSize: FontSize.md, lineHeight: 26, color: Colors.text },
  button: { ...CommonStyles.button, position: 'absolute', bottom: 24, left: 20, right: 20, padding: 16 },
  buttonDone: { backgroundColor: Colors.success },
  buttonText: CommonStyles.buttonText,
})
