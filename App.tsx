import { Suspense, useEffect } from 'react'
import { StatusBar } from 'expo-status-bar'
import { SQLiteProvider } from 'expo-sqlite'
import { DatabaseInitScreen } from './src/screens/DatabaseInitScreen'
import { AppNavigator } from './src/navigation/AppNavigator'
import { authReady } from './src/lib/supabase'

export default function App() {
  useEffect(() => {
    authReady
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
