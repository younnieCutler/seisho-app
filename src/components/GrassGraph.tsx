import { View, StyleSheet } from 'react-native'
import { buildGridDates } from '../utils/grassGrid'
import { getKSTDateString, getTodayKST } from '../utils/date'
import { useTheme } from '../utils/theme'

const WEEKS = 12
const DAYS = WEEKS * 7

interface Props {
  readDates: string[]
}

export function GrassGraph({ readDates }: Props) {
  const { colors } = useTheme()
  const today = getKSTDateString(getTodayKST())
  const grid = buildGridDates(today, DAYS)
  const readSet = new Set(readDates)

  const weeks: string[][] = []
  for (let w = 0; w < WEEKS; w++) {
    weeks.push(grid.slice(w * 7, w * 7 + 7))
  }

  return (
    <View style={styles.grid}>
      {weeks.map((week, wi) => (
        <View key={wi} style={styles.week}>
          {week.map(date => (
            <View
              key={date}
              style={[
                styles.cell, 
                { backgroundColor: colors.border },
                readSet.has(date) && { backgroundColor: colors.primary }
              ]}
            />
          ))}
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', gap: 4 },
  week: { flexDirection: 'column', gap: 4 },
  cell: { width: 14, height: 14, borderRadius: 4 },
})

