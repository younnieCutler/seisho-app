import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { getReadDates, getMeditationNotes, MeditationNote } from '../lib/storage'
import { calcStreak } from '../utils/streak'
import { getTodayKST, getKSTDateString } from '../utils/date'
import { GrassGraph } from '../components/GrassGraph'
import { useTheme, FontFamily, FontSize, CommonStyles } from '../utils/theme'

export function RecordScreen() {
  const insets = useSafeAreaInsets()
  const { colors } = useTheme()
  const dates = getReadDates()
  const today = getKSTDateString(getTodayKST())
  const streak = calcStreak(dates, today)
  const recentNotes = getMeditationNotes()
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 7)

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={[styles.title, { color: colors.text }]}>나의 성과</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>꾸준함이 영성을 만듭니다</Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface }, CommonStyles.shadow]}>
        <View style={styles.streakInfo}>
          <Text style={[styles.streakNum, { color: colors.primary }]}>{streak}</Text>
          <Text style={[styles.streakLabel, { color: colors.textMuted }]}>Days Streak</Text>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>활동 기록</Text>
        <GrassGraph readDates={dates} />
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface, marginTop: 16 }, CommonStyles.shadow]}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>묵상 노트</Text>

        {recentNotes.length === 0 ? (
          <Text style={[styles.emptyNote, { color: colors.textMuted }]}>
            아직 묵상 노트가 없습니다.{'\n'}읽기를 완료하고 첫 기록을 남겨보세요.
          </Text>
        ) : (
          recentNotes.map(note => (
            <View key={note.date} style={[styles.noteItem, { borderBottomColor: colors.border }]}>
              <Text style={[styles.noteDate, { color: colors.textMuted }]}>{note.date}</Text>
              <Text style={[styles.noteContent, { color: colors.text }]}>{note.content}</Text>
            </View>
          ))
        )}
      </View>

      <View style={{ height: insets.bottom + 24 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 32,
    marginBottom: 32,
  },
  title: { 
    fontFamily: FontFamily.interfaceBold, 
    fontSize: FontSize.xl,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: FontFamily.interface,
    fontSize: FontSize.sm,
  },
  card: {
    marginHorizontal: 24,
    padding: 32,
    borderRadius: 32,
  },
  streakInfo: { 
    alignItems: 'center', 
    marginBottom: 24 
  },
  streakNum: { 
    fontSize: FontSize.xxl, 
    fontFamily: FontFamily.interfaceBold,
    lineHeight: 70,
  },
  streakLabel: { 
    fontSize: FontSize.xs, 
    fontFamily: FontFamily.interface,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  divider: {
    height: 1,
    width: '100%',
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: FontFamily.interfaceBold,
    fontSize: FontSize.xs,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  emptyNote: {
    fontFamily: FontFamily.interface,
    fontSize: FontSize.sm,
    lineHeight: 22,
    textAlign: 'center',
    paddingVertical: 16,
  },
  noteItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  noteDate: {
    fontFamily: FontFamily.interface,
    fontSize: FontSize.xxs,
    marginBottom: 6,
  },
  noteContent: {
    fontFamily: FontFamily.content,
    fontSize: FontSize.md,
    lineHeight: 24,
  },
})

