import { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { useSQLiteContext } from 'expo-sqlite'
import { Temporal } from '@js-temporal/polyfill'
import { getCurrentSeason, SEASON_PLAN } from '../utils/season'
import { getVersesByChapter } from '../lib/db'
import { getReadDates, markReadToday } from '../lib/storage'
import { calcStreak } from '../utils/streak'
import { getTodayKST, getKSTDateString } from '../utils/date'

// 절별 읽기 플랜은 season.ts에서 관리

const SEASON_COLOR: Record<string, string> = {
  ADVENT: '#4A6FA5',
  CHRISTMAS: '#C0392B',
  EPIPHANY: '#F39C12',
  LENT: '#8E44AD',
  HOLY_WEEK: '#7F8C8D',
  EASTER: '#F1C40F',
  PENTECOST: '#E74C3C',
  ORDINARY: '#27AE60',
}

const SEASON_KR: Record<string, string> = {
  ADVENT: '대림절', CHRISTMAS: '성탄절', EPIPHANY: '주현절',
  LENT: '사순절', HOLY_WEEK: '고난주간', EASTER: '부활절',
  PENTECOST: '성령강림절', ORDINARY: '일반 주일',
}

interface Props {
  onGoToReading: () => void
}

export function HomeScreen({ onGoToReading }: Props) {
  const db = useSQLiteContext()
  const [verse, setVerse] = useState<string>('')
  const [reference, setReference] = useState<string>('')
  const [season, setSeason] = useState<string>('ORDINARY')
  const [streak, setStreak] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const today = getTodayKST()
      const todayDate = Temporal.PlainDate.from(today)
      const currentSeason = getCurrentSeason(todayDate)
      setSeason(currentSeason)

      const plan = SEASON_PLAN[currentSeason]
      const verses = await getVersesByChapter(db, plan.book, plan.chapter)

      if (verses.length > 0) {
        const idx = todayDate.dayOfYear % verses.length
        const v = verses[idx]
        setVerse(v.text)
        setReference(`${plan.book} ${plan.chapter}:${v.verse}`)
      }

      const dates = getReadDates()
      setStreak(calcStreak(dates, getKSTDateString(today)))
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={[styles.seasonBadge, { backgroundColor: SEASON_COLOR[season] }]}>
        <Text style={styles.seasonText}>{SEASON_KR[season]}</Text>
      </View>

      <Text style={styles.reference}>{reference}</Text>
      <Text style={styles.verse}>{verse}</Text>

      <View style={styles.streakRow}>
        <Text style={styles.streakLabel}>연속 읽기</Text>
        <Text style={styles.streakCount}>{streak}일</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={onGoToReading}>
        <Text style={styles.buttonText}>성경 읽기 시작</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24, justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  seasonBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 20 },
  seasonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  reference: { fontSize: 14, color: '#888', marginBottom: 8 },
  verse: { fontSize: 20, lineHeight: 32, color: '#1a1a1a', marginBottom: 32 },
  streakRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  streakLabel: { fontSize: 16, color: '#666' },
  streakCount: { fontSize: 24, fontWeight: 'bold', color: '#4A90E2' },
  button: { padding: 16, borderRadius: 12, backgroundColor: '#4A90E2', alignItems: 'center' },
  buttonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
})
