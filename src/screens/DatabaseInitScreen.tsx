import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'

/**
 * TODO-08: SQLite 첫 실행 시 로딩 UI
 * SQLiteProvider의 Suspense fallback으로 사용.
 * ko.db가 DocumentDirectory에 복사될 때까지 표시됨.
 */
export function DatabaseInitScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#4A90E2" />
      <Text style={styles.text}>성경 데이터를 준비 중입니다...</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  text: {
    fontSize: 16,
    color: '#555',
  },
})
