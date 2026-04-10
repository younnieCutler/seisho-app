import { useState } from 'react'
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Text, View, StyleSheet, Platform } from 'react-native'
import { isOnboarded } from '../lib/storage'
import { OnboardingScreen } from '../screens/OnboardingScreen'
import { HomeScreen } from '../screens/HomeScreen'
import { ReadingScreen } from '../screens/ReadingScreen'
import { RecordScreen } from '../screens/RecordScreen'
import { GroupFeedScreen } from '../screens/GroupFeedScreen'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme, FontFamily, FontSize, CommonStyles } from '../utils/theme'

const Tab = createBottomTabNavigator()

const TAB_ICONS: Record<string, string> = {
  Home:      '✦',
  Reading:   '⊛',
  Record:    '⊘',
  GroupFeed: '⊕',
}

const TAB_LABELS: Record<string, string> = {
  Home:      '오늘',
  Reading:   '읽기',
  Record:    '기록',
  GroupFeed: '나눔',
}

function TabIcon({ 
  name, 
  focused, 
  colors 
}: { 
  name: string; 
  focused: boolean;
  colors: any;
}) {
  return (
    <View style={iconStyles.container}>
      <View style={[
        iconStyles.pill, 
        focused ? { backgroundColor: colors.primary } : { backgroundColor: 'transparent' }
      ]}>
        <Text style={[
          iconStyles.icon, 
          { color: focused ? '#FFFFFF' : colors.textMuted }
        ]}>
          {TAB_ICONS[name]}
        </Text>
      </View>
      <Text style={[
        iconStyles.label, 
        { color: focused ? colors.text : colors.textMuted },
        focused && { fontFamily: FontFamily.interfaceBold }
      ]}>
        {TAB_LABELS[name]}
      </Text>
    </View>
  )
}

const iconStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 4,
  },
  pill: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 20,
  },
  icon: {
    fontSize: 18,
    lineHeight: 22,
    textAlign: 'center',
  },
  label: {
    fontSize: 10,
    fontFamily: FontFamily.interface,
  },
})

export function AppNavigator() {
  const insets = useSafeAreaInsets()
  const [onboarded, setOnboarded] = useState(isOnboarded())
  const { colors, isDark } = useTheme()

  const navTheme = isDark ? DarkTheme : DefaultTheme
  const customNavTheme = {
    ...navTheme,
    colors: {
      ...navTheme.colors,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      primary: colors.primary,
    }
  }

  if (!onboarded) {
    return (
      <View style={{ flex: 1 }}>
        <OnboardingScreen onComplete={() => setOnboarded(true)} />
      </View>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer theme={customNavTheme}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarShowLabel: false,
            tabBarStyle: { 
              backgroundColor: colors.surface, 
              borderTopWidth: 1,
              borderTopColor: colors.border,
              height: Platform.OS === 'ios' ? 60 + insets.bottom : 68,
              paddingBottom: Platform.OS === 'ios' ? insets.bottom : 8,
              paddingTop: 8,
              elevation: 0,
              shadowOpacity: 0,
            },
            tabBarIcon: ({ focused }) => (
              <TabIcon name={route.name} focused={focused} colors={colors} />
            ),
          })}
        >
          <Tab.Screen name="Home">
            {({ navigation }) => <HomeScreen onGoToReading={() => navigation.navigate('Reading')} />}
          </Tab.Screen>
          <Tab.Screen name="Reading" component={ReadingScreen} />
          <Tab.Screen name="Record" component={RecordScreen} />
          <Tab.Screen name="GroupFeed" component={GroupFeedScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </View>
  )
}


