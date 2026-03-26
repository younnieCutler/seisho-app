import { useState } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Text } from 'react-native'
import { isOnboarded } from '../lib/storage'
import { OnboardingScreen } from '../screens/OnboardingScreen'
import { HomeScreen } from '../screens/HomeScreen'
import { ReadingScreen } from '../screens/ReadingScreen'
import { RecordScreen } from '../screens/RecordScreen'

const Tab = createBottomTabNavigator()

export function AppNavigator() {
  const [onboarded, setOnboarded] = useState(isOnboarded())

  if (!onboarded) {
    return <OnboardingScreen onComplete={() => setOnboarded(true)} />
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{ headerShown: false }}
      >
        <Tab.Screen
          name="Home"
          options={{ tabBarLabel: '오늘', tabBarIcon: () => <Text>📖</Text> }}
        >
          {() => <HomeScreen onGoToReading={() => {}} />}
        </Tab.Screen>
        <Tab.Screen
          name="Reading"
          component={ReadingScreen}
          options={{ tabBarLabel: '읽기', tabBarIcon: () => <Text>📚</Text> }}
        />
        <Tab.Screen
          name="Record"
          component={RecordScreen}
          options={{ tabBarLabel: '기록', tabBarIcon: () => <Text>🌿</Text> }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  )
}
