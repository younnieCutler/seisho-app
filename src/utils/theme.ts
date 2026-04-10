import { StyleSheet, useColorScheme } from 'react-native'

export const Colors = {
  light: {
    primary: '#6B8E7B',      // Calm Sage Green
    background: '#F9FAF9',   // Muted Mist
    surface: '#FFFFFF',      // Pure White
    text: '#2C3E50',         // Obsidian Slate
    textSecondary: '#5D6D7E',
    textMuted: '#8C9BA5',
    border: '#E5E8E8',
    accent: '#EADCC8',       // Soft Sand
    success: '#6B8E7B',
    danger: '#E53935',
  },
  dark: {
    primary: '#6B8E7B',      // Sage stays core
    background: '#121612',   // Deep Obsidian
    surface: '#1E231E',      // Elevated Moss
    text: '#E0E0E0',         // Soft Pearl
    textSecondary: '#AAB7B8',
    textMuted: '#7F8C8D',
    border: '#2C3E2C',
    accent: '#D4C4A8',       // Warm Sand
    success: '#829E8E',
    danger: '#EF5350',
  }
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

export const FontFamily = {
  content: 'NotoSerifKR_400Regular',
  interface: 'Inter_500Medium',
  interfaceBold: 'Inter_600SemiBold',
}

export const useTheme = () => {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const colors = isDark ? Colors.dark : Colors.light

  return { colors, isDark }
}

export const CommonStyles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3,
  }
})
