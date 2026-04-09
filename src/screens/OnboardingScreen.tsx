import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { setOnboarded } from '../lib/storage'

const AGE_GROUPS = ['10대', '20대', '30대', '40대', '50대+'] as const

interface Props {
  onComplete: () => void
}

export function OnboardingScreen({ onComplete }: Props) {
  const [selected, setSelected] = useState<string | null>(null)

  function handleComplete() {
    if (!selected) return
    setOnboarded(selected)
    onComplete()
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>성경 읽기를 시작합니다</Text>
      <Text style={styles.subtitle}>연령대를 선택해주세요</Text>

      <View style={styles.options}>
        {AGE_GROUPS.map(group => (
          <TouchableOpacity
            key={group}
            style={[styles.option, selected === group && styles.optionSelected]}
            onPress={() => setSelected(group)}
          >
            <Text style={[styles.optionText, selected === group && styles.optionTextSelected]}>
              {group}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.button, !selected && styles.buttonDisabled]}
        onPress={handleComplete}
        disabled={!selected}
      >
        <Text style={styles.buttonText}>시작하기</Text>
      </TouchableOpacity>
    </View>
  )
}

import { Colors, FontSize, CommonStyles } from '../utils/theme'

const styles = StyleSheet.create({
  container: { ...CommonStyles.container, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: FontSize.xl, fontWeight: 'bold', color: Colors.text, marginBottom: 8 },
  subtitle: { fontSize: FontSize.md, color: Colors.textSecondary, marginBottom: 40 },
  options: { width: '100%', gap: 12, marginBottom: 40 },
  option: { padding: 16, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center' },
  optionSelected: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  optionText: { fontSize: FontSize.md, color: Colors.text },
  optionTextSelected: { color: Colors.primary, fontWeight: '600' },
  button: { ...CommonStyles.button, width: '100%', padding: 16 },
  buttonDisabled: CommonStyles.buttonDisabled,
  buttonText: CommonStyles.buttonText,
})
