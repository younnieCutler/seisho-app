import { StyleSheet } from 'react-native'

export const Colors = {
  primary: '#4A90E2',      // 앱 메인 컬러 (파랑)
  success: '#27AE60',      // 읽기 완료 등
  danger: '#E53935',       // 에러, 그룹 탈퇴
  background: '#ffffff',
  surface: '#F8F9FA',
  text: '#1a1a1a',         // 기본 텍스트
  textSecondary: '#666666',
  textMuted: '#999999',
  border: '#dddddd',
  primaryLight: '#EBF3FD'
}

export const FontSize = {
  xxl: 64,
  xl: 24,
  lg: 20,
  md: 16,
  sm: 14,
  xs: 12,
  xxs: 11,
}

export const CommonStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { fontSize: FontSize.md, fontWeight: '600', color: '#fff' },
  buttonDisabled: { backgroundColor: '#ccc' },
})
