import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import { useTheme, FontFamily, FontSize, CommonStyles } from '../../utils/theme'

interface Props {
  onSave: (nickname: string) => void
}

export function NicknameSetup({ onSave }: Props) {
  const { colors } = useTheme()
  const [nicknameInput, setNicknameInput] = useState('')

  return (
    <View style={[CommonStyles.center, { padding: 32 }]}>
      <Text style={[styles.title, { color: colors.text }]}>나눔을 위해{"\n"}별명을 알려주세요</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
        value={nicknameInput}
        onChangeText={setNicknameInput}
        placeholder="예: 말씀이"
        placeholderTextColor={colors.textMuted}
        maxLength={20}
        autoFocus
      />
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: colors.primary }, !nicknameInput && { opacity: 0.5 }]} 
        onPress={() => nicknameInput && onSave(nicknameInput)}
        disabled={!nicknameInput}
      >
        <Text style={styles.buttonText}>시작하기</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  title: { 
    fontFamily: FontFamily.interfaceBold,
    fontSize: FontSize.xl, 
    marginBottom: 32, 
    textAlign: 'center', 
  },
  input: {
    width: '100%', 
    borderWidth: 1, 
    borderRadius: 16,
    padding: 16, 
    marginBottom: 24, 
    fontSize: FontSize.md,
    fontFamily: FontFamily.interface,
  },
  button: { 
    width: '100%', 
    padding: 18, 
    borderRadius: 20,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: FontFamily.interfaceBold,
    fontSize: FontSize.md,
    color: '#fff',
  }
})

