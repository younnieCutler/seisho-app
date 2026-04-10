import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import { useTheme, FontFamily, FontSize, CommonStyles } from '../../utils/theme'

interface Props {
  onCreate: () => void
  onJoin: (code: string) => void
  joinError: string
  setJoinError: (msg: string) => void
}

export function GroupJoinCreate({ onCreate, onJoin, joinError, setJoinError }: Props) {
  const { colors } = useTheme()
  const [joinCodeInput, setJoinCodeInput] = useState('')

  return (
    <View style={[CommonStyles.center, { padding: 32 }]}>
      <Text style={[styles.title, { color: colors.text }]}>소그룹 나눔</Text>
      
      <View style={[styles.card, { backgroundColor: colors.surface }, CommonStyles.shadow]}>
        <Text style={[styles.cardTitle, { color: colors.textSecondary }]}>참여 코드가 있다면</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
          value={joinCodeInput}
          onChangeText={(t) => { setJoinCodeInput(t); setJoinError('') }}
          placeholder="6자리 코드"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="characters"
          maxLength={6}
        />
        {joinError ? <Text style={[styles.errorText, { color: colors.danger }]}>{joinError}</Text> : null}
        <TouchableOpacity 
          style={[styles.joinButton, { backgroundColor: colors.primary }, !joinCodeInput && { opacity: 0.5 }]} 
          onPress={() => onJoin(joinCodeInput)}
          disabled={!joinCodeInput}
        >
          <Text style={styles.buttonText}>참여하기</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dividerRow}>
        <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        <Text style={[styles.dividerText, { color: colors.textMuted }]}>또는</Text>
        <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
      </View>

      <TouchableOpacity 
        style={[styles.createButton, { borderColor: colors.primary }]} 
        onPress={onCreate}
      >
        <Text style={[styles.createButtonText, { color: colors.primary }]}>새 그룹 만들기</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  title: { 
    fontFamily: FontFamily.interfaceBold,
    fontSize: FontSize.xl, 
    marginBottom: 40, 
    textAlign: 'center', 
  },
  card: {
    width: '100%',
    padding: 24,
    borderRadius: 24,
  },
  cardTitle: {
    fontFamily: FontFamily.interface,
    fontSize: FontSize.xs,
    marginBottom: 16,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  input: {
    width: '100%', 
    borderWidth: 1, 
    borderRadius: 16,
    padding: 16, 
    marginBottom: 12, 
    fontSize: FontSize.md,
    fontFamily: FontFamily.interface,
    textAlign: 'center',
    letterSpacing: 4,
  },
  joinButton: { 
    width: '100%', 
    padding: 18, 
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: FontFamily.interfaceBold,
    fontSize: FontSize.md,
    color: '#fff',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 40,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontFamily: FontFamily.interface,
    fontSize: FontSize.xs,
  },
  createButton: {
    width: '100%',
    padding: 18,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
  },
  createButtonText: {
    fontFamily: FontFamily.interfaceBold,
    fontSize: FontSize.md,
  },
  errorText: { 
    fontFamily: FontFamily.interface,
    fontSize: FontSize.xs, 
    marginBottom: 12,
    textAlign: 'center',
  },
})

