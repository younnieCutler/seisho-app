import { View, Text, StyleSheet } from 'react-native'
import { getReadDates } from '../lib/storage'
import { calcStreak } from '../utils/streak'
import { getTodayKST, getKSTDateString } from '../utils/date'
import { GrassGraph } from '../components/GrassGraph'

export function RecordScreen() {
  const dates = getReadDates()
  const today = getKSTDateString(getTodayKST())
  const streak = calcStreak(dates, today)

  return (
    <View style={styles.container}>
      <Text style={styles.title}>읽기 기록</Text>

      <View style={styles.streakCard}>
        <Text style={styles.streakNum}>{streak}</Text>
        <Text style={styles.streakLabel}>일 연속</Text>
      </View>

      <GrassGraph readDates={dates} />
    </View>
  )
}

import { Colors, FontSize, CommonStyles } from '../utils/theme'

const styles = StyleSheet.create({
  container: { ...CommonStyles.container, paddingTop: 24 },
  title: { fontSize: FontSize.lg, fontWeight: 'bold', color: Colors.text, paddingHorizontal: 20, marginBottom: 24 },
  streakCard: { alignItems: 'center', marginBottom: 32 },
  streakNum: { fontSize: FontSize.xxl, fontWeight: 'bold', color: Colors.primary },
  streakLabel: { fontSize: FontSize.md, color: Colors.textMuted },
})
