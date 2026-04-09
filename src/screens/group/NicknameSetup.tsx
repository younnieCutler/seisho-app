import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import { Colors, FontSize, CommonStyles } from '../../utils/theme'

interface Props {
  onSave: (nickname: string) => void
}

export function NicknameSetup({ onSave }: Props) {
  const [nicknameInput, setNicknameInput] = useState('')

  return (
    <View style={CommonStyles.center}>
      <Text style={styles.title}>나눔에서 사용할 별명을 입력해주세요</Text>
      <TextInput
        style={styles.input}
        value={nicknameInput}
        onChangeText={setNicknameInput}
        placeholder="예: 말씀이"
        maxLength={20}
      />
      <TouchableOpacity style={styles.button} onPress={() => onSave(nicknameInput)}>
        <Text style={CommonStyles.buttonText}>저장</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  title: { fontSize: FontSize.md, fontWeight: '600', marginBottom: 16, textAlign: 'center', color: Colors.text },
  input: {
    width: '100%', borderWidth: 1, borderColor: Colors.border, borderRadius: 8,
    padding: 12, marginBottom: 16, fontSize: FontSize.md, color: Colors.text
  },
  button: { ...CommonStyles.button, width: '100%', padding: 12 }
})
