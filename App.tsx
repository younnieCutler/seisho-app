import { Suspense, useEffect, useState, useCallback } from 'react'
import { StatusBar } from 'expo-status-bar'
import { SQLiteProvider } from 'expo-sqlite'
import * as SplashScreen from 'expo-splash-screen'
import { 
  useFonts, 
  NotoSerifKR_400Regular 
} from '@expo-google-fonts/noto-serif-kr'
import { 
  Inter_500Medium, 
  Inter_600SemiBold 
} from '@expo-google-fonts/inter'

import { SafeAreaProvider } from 'react-native-safe-area-context'
import { DatabaseInitScreen } from './src/screens/DatabaseInitScreen'
import { AppNavigator } from './src/navigation/AppNavigator'
import { authReady } from './src/lib/supabase'

// 앱 구동 시 스플래시 화면 유지
SplashScreen.preventAutoHideAsync()

export default function App() {
  const [appReady, setAppReady] = useState(false)
  
  const [fontsLoaded] = useFonts({
    NotoSerifKR_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  })

  useEffect(() => {
    async function prepare() {
      try {
        // 인증 준비 완료 대기
        await authReady
      } catch (e) {
        console.warn(e)
      } finally {
        setAppReady(true)
      }
    }
    prepare()
  }, [])

  const onLayoutRootView = useCallback(async () => {
    if (appReady && fontsLoaded) {
      await SplashScreen.hideAsync()
    }
  }, [appReady, fontsLoaded])

  if (!appReady || !fontsLoaded) {
    return null
  }

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <Suspense fallback={<DatabaseInitScreen />}>
        <SQLiteProvider
          databaseName="ko.db"
          assetSource={{ assetId: require('./assets/bible/ko.db') }}
          useSuspense
        >
          <StatusBar style="auto" />
          <AppNavigator />
        </SQLiteProvider>
      </Suspense>
    </SafeAreaProvider>
  )
}
