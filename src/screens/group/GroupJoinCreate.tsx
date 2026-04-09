import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import { Colors, FontSize, CommonStyles } from '../../utils/theme'

interface Props {
  onCreate: () => void
  onJoin: (code: string) => void
  joinError: string
  setJoinError: (msg: string) => void
}

export function GroupJoinCreate({ onCreate, onJoin, joinError, setJoinError }: Props) {
  const [joinCodeInput, setJoinCodeInput] = useState('')

  return (
    <View style={CommonStyles.center}>
      <Text style={styles.title}>소그룹에 참여하거나 새로 만드세요</Text>
      <TouchableOpacity style={styles.button} onPress={onCreate}>
        <Text style={CommonStyles.buttonText}>새 그룹 만들기</Text>
      </TouchableOpacity>
      <Text style={styles.divider}>또는</Text>
      <TextInput
        style={styles.input}
        value={joinCodeInput}
        onChangeText={(t) => { setJoinCodeInput(t); setJoinError('') }}
        placeholder="6자리 코드 입력"
        autoCapitalize="characters"
        maxLength={6}
      />
      {joinError ? <Text style={styles.errorText}>{joinError}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={() => onJoin(joinCodeInput)}>
        <Text style={CommonStyles.buttonText}>참여하기</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  title: { fontSize: FontSize.md, fontWeight: '600', marginBottom: 16, textAlign: 'center', color: Colors.text },
  input: {
    width: '100%', borderWidth: 1, borderColor: Colors.border, borderRadius: 8,
    padding: 12, marginBottom: 8, fontSize: FontSize.md, color: Colors.text
  },
  button: { ...CommonStyles.button, width: '100%', padding: 12 },
  divider: { color: Colors.textMuted, marginVertical: 16 },
  errorText: { color: Colors.danger, fontSize: FontSize.sm, marginBottom: 8 },
})
