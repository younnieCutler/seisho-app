import { View, Text, StyleSheet } from 'react-native'
import { buildGridDates } from '../utils/grassGrid'
import { getKSTDateString, getTodayKST } from '../utils/date'

const WEEKS = 12
const DAYS = WEEKS * 7  // 84일

interface Props {
  readDates: string[]
}

export function GrassGraph({ readDates }: Props) {
  const today = getKSTDateString(getTodayKST())
  const grid = buildGridDates(today, DAYS)
  const readSet = new Set(readDates)

  // 12주 × 7일 2D 배열 (열 = 주, 행 = 요일)
  const weeks: string[][] = []
  for (let w = 0; w < WEEKS; w++) {
    weeks.push(grid.slice(w * 7, w * 7 + 7))
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>최근 12주 읽기 기록</Text>
      <View style={styles.grid}>
        {weeks.map((week, wi) => (
          <View key={wi} style={styles.week}>
            {week.map(date => (
              <View
                key={date}
                style={[styles.cell, readSet.has(date) && styles.cellRead]}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20 },
  label: { fontSize: 14, color: '#888', marginBottom: 12 },
  grid: { flexDirection: 'row', gap: 3 },
  week: { flexDirection: 'column', gap: 3 },
  cell: { width: 14, height: 14, borderRadius: 3, backgroundColor: '#E8E8E8' },
  cellRead: { backgroundColor: '#27AE60' },
})
