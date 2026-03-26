import { Suspense } from 'react'
import { StatusBar } from 'expo-status-bar'
import { SQLiteProvider } from 'expo-sqlite'
import { DatabaseInitScreen } from './src/screens/DatabaseInitScreen'
import { AppNavigator } from './src/navigation/AppNavigator'

export default function App() {
  return (
    <Suspense fallback={<DatabaseInitScreen />}>
      <SQLiteProvider
        databaseName="ko.db"
        assetSource={require('./assets/bible/ko.db')}
        useSuspense
      >
        <StatusBar style="auto" />
        <AppNavigator />
      </SQLiteProvider>
    </Suspense>
  )
}
