import { useEffect, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useSQLiteContext } from 'expo-sqlite'
import { Temporal } from '@js-temporal/polyfill'
import { getCurrentSeason, SEASON_PLAN } from '../utils/season'
import { getVersesByChapter } from '../lib/db'
import { markReadToday, getReadDates, getUserId, getMeditationNoteByDate, saveMeditationNote } from '../lib/storage'
import { syncVerseRead } from '../lib/sync'
import { getTodayKST, getKSTDateString } from '../utils/date'
import { useTheme, FontFamily, FontSize, CommonStyles } from '../utils/theme'

interface Verse {
  verse: number
  text: string
}

export function ReadingScreen() {
  const insets = useSafeAreaInsets()
  const db = useSQLiteContext()
  const { colors } = useTheme()
  const [verses, setVerses] = useState<Verse[]>([])
  const [book, setBook] = useState('')
  const [chapter, setChapter] = useState(0)
  const [readToday, setReadToday] = useState(false)
  const [loading, setLoading] = useState(true)
  const [noteVisible, setNoteVisible] = useState(false)
  const [noteText, setNoteText] = useState('')

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
    const existing = getMeditationNoteByDate(getKSTDateString(getTodayKST()))
    setNoteText(existing?.content ?? '')
    setNoteVisible(true)
  }

  function handleSaveNote() {
    if (noteText.trim()) {
      saveMeditationNote(getKSTDateString(getTodayKST()), noteText)
    }
    setNoteVisible(false)
  }

  function handleSkipNote() {
    setNoteText('')
    setNoteVisible(false)
  }

  if (loading) {
    return (
      <View style={[CommonStyles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={[styles.headerTitle, { color: colors.textSecondary }]}>{book}</Text>
        <Text style={[styles.headerSubtitle, { color: colors.text }]}>{chapter}장</Text>
      </View>

      <FlatList
        data={verses}
        keyExtractor={item => String(item.verse)}
        renderItem={({ item }) => (
          <View style={styles.verseRow}>
            <Text style={[styles.verseNum, { color: colors.textMuted }]}>{item.verse}</Text>
            <Text style={[styles.verseText, { color: colors.text }]}>{item.text}</Text>
          </View>
        )}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20, backgroundColor: `${colors.background}cc` }]}>
        {noteVisible && (
          <View style={[styles.notePanel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.noteLabel, { color: colors.textSecondary }]}>오늘 묵상을 짧게 기록해보세요</Text>
            <TextInput
              style={[styles.noteInput, { color: colors.text, borderColor: colors.border }]}
              value={noteText}
              onChangeText={setNoteText}
              placeholder="마음에 닿은 말씀이나 생각..."
              placeholderTextColor={colors.textMuted}
              multiline
              autoFocus
              maxLength={500}
            />
            <View style={styles.noteActions}>
              <TouchableOpacity onPress={handleSkipNote} style={styles.skipButton}>
                <Text style={[styles.skipText, { color: colors.textMuted }]}>건너뛰기</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveNote}
                style={[styles.saveNoteButton, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.saveNoteText}>저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }, readToday && { backgroundColor: colors.border }]}
          onPress={handleMarkRead}
          disabled={readToday}
          activeOpacity={0.8}
        >
          <Text style={[styles.buttonText, readToday && { color: colors.textMuted }]}>
            {readToday ? '✦ 오늘 읽기 완료' : '묵상 완료'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 32,
    paddingBottom: 24,
  },
  headerTitle: {
    fontFamily: FontFamily.interface,
    fontSize: FontSize.sm,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontFamily: FontFamily.interfaceBold,
    fontSize: FontSize.xl,
  },
  list: { paddingHorizontal: 32 },
  verseRow: { flexDirection: 'row', marginBottom: 20 },
  verseNum: { 
    fontFamily: FontFamily.interface,
    fontSize: FontSize.xs, 
    minWidth: 32, 
    marginTop: 6 
  },
  verseText: { 
    flex: 1, 
    fontFamily: FontFamily.content,
    fontSize: FontSize.md, 
    lineHeight: 32, 
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 32,
    paddingTop: 16,
  },
  button: { 
    padding: 20, 
    borderRadius: 24, 
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: FontFamily.interfaceBold,
    fontSize: FontSize.md,
    color: '#fff',
  },
  notePanel: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  noteLabel: {
    fontFamily: FontFamily.interface,
    fontSize: FontSize.xs,
    marginBottom: 10,
  },
  noteInput: {
    fontFamily: FontFamily.content,
    fontSize: FontSize.md,
    lineHeight: 24,
    minHeight: 80,
    maxHeight: 140,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    textAlignVertical: 'top',
  },
  noteActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    fontFamily: FontFamily.interface,
    fontSize: FontSize.sm,
  },
  saveNoteButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  saveNoteText: {
    fontFamily: FontFamily.interfaceBold,
    fontSize: FontSize.sm,
    color: '#fff',
  },
})

