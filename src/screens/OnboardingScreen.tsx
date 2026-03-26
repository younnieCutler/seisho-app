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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 40 },
  options: { width: '100%', gap: 12, marginBottom: 40 },
  option: { padding: 16, borderRadius: 12, borderWidth: 1.5, borderColor: '#ddd', alignItems: 'center' },
  optionSelected: { borderColor: '#4A90E2', backgroundColor: '#EBF3FD' },
  optionText: { fontSize: 16, color: '#333' },
  optionTextSelected: { color: '#4A90E2', fontWeight: '600' },
  button: { width: '100%', padding: 16, borderRadius: 12, backgroundColor: '#4A90E2', alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#ccc' },
  buttonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
})
