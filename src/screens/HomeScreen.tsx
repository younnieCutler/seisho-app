import { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { useSQLiteContext } from 'expo-sqlite'
import { Temporal } from '@js-temporal/polyfill'
import { getCurrentSeason, SEASON_PLAN } from '../utils/season'
import { getVersesByChapter } from '../lib/db'
import { getReadDates } from '../lib/storage'
import { calcStreak } from '../utils/streak'
import { getTodayKST, getKSTDateString } from '../utils/date'
import { useTheme, FontFamily, FontSize, CommonStyles } from '../utils/theme'

const SEASON_COLOR: Record<string, string> = {
  ADVENT: '#5D6D7E',
  CHRISTMAS: '#A66B6B',
  EPIPHANY: '#D4AC0D',
  LENT: '#7D6B91',
  HOLY_WEEK: '#5D666D',
  EASTER: '#C5A059',
  PENTECOST: '#B36B6B',
  ORDINARY: '#6B8E7B',
}

const SEASON_KR: Record<string, string> = {
  ADVENT: '대림절', CHRISTMAS: '성탄절', EPIPHANY: '주현절',
  LENT: '사순절', HOLY_WEEK: '고난주간', EASTER: '부활절',
  PENTECOST: '성령강림절', ORDINARY: '일반 주간',
}

interface Props {
  onGoToReading: () => void
}

export function HomeScreen({ onGoToReading }: Props) {
  const { colors } = useTheme()
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
      <View style={[CommonStyles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: colors.surface }, CommonStyles.shadow]}>
        <View style={[styles.seasonBadge, { backgroundColor: `${SEASON_COLOR[season]}22` }]}>
          <Text style={[styles.seasonText, { color: SEASON_COLOR[season] }]}>{SEASON_KR[season]}</Text>
        </View>

        <Text style={[styles.reference, { color: colors.textMuted }]}>{reference}</Text>
        <Text style={[styles.verse, { color: colors.text }]}>{verse}</Text>
        
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.streakRow}>
          <View>
            <Text style={[styles.streakLabel, { color: colors.textSecondary }]}>지속 가능한 묵상</Text>
            <Text style={[styles.streakDays, { color: colors.text }]}>{streak}일째 이어가는 중</Text>
          </View>
          <View style={[styles.streakBadge, { backgroundColor: colors.primary }]}>
             <Text style={styles.streakIcon}>✦</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.button, { backgroundColor: colors.primary }]} 
        onPress={onGoToReading}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>오늘의 말씀 읽기</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  card: {
    padding: 32,
    borderRadius: 32,
    marginBottom: 40,
  },
  seasonBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 24,
  },
  seasonText: {
    fontFamily: FontFamily.interfaceBold,
    fontSize: FontSize.xs,
  },
  reference: {
    fontFamily: FontFamily.interface,
    fontSize: FontSize.sm,
    marginBottom: 12,
  },
  verse: {
    fontFamily: FontFamily.content,
    fontSize: FontSize.xl,
    lineHeight: 38,
    marginBottom: 32,
  },
  divider: {
    height: 1,
    width: '100%',
    marginBottom: 24,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  streakLabel: {
    fontFamily: FontFamily.interface,
    fontSize: FontSize.xs,
    marginBottom: 4,
  },
  streakDays: {
    fontFamily: FontFamily.interfaceBold,
    fontSize: FontSize.md,
  },
  streakBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakIcon: {
    color: '#fff',
    fontSize: 20,
  },
  button: {
    padding: 20,
    borderRadius: 24,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: FontFamily.interfaceBold,
    fontSize: FontSize.md,
    color: '#fff',
  },
})

