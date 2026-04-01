import { Suspense, useEffect } from 'react'
import { StatusBar } from 'expo-status-bar'
import { SQLiteProvider } from 'expo-sqlite'
import { DatabaseInitScreen } from './src/screens/DatabaseInitScreen'
import { AppNavigator } from './src/navigation/AppNavigator'
import { initAnonAuth } from './src/lib/supabase'

export default function App() {
  useEffect(() => {
    initAnonAuth().catch(() => {
      // 오프라인 시 무시 — 앱은 오프라인 모드로 계속 동작
    })
  }, [])

  return (
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
  )
}
