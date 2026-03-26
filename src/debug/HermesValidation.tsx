import { computus } from 'computus'
import { Temporal } from '@js-temporal/polyfill'
import { ScrollView, Text, View, StyleSheet } from 'react-native'

type Result = { label: string; expected: string; actual: string; pass: boolean }

function run(): Result[] {
  const easter2026 = computus(2026)
  const today = Temporal.Now.plainDateISO('Asia/Seoul')
  const april5 = Temporal.PlainDate.from('2026-04-05')

  return [
    {
      label: 'computus(2026).month',
      expected: '4',
      actual: String(easter2026.month),
      pass: easter2026.month === 4,
    },
    {
      label: 'computus(2026).day',
      expected: '5',
      actual: String(easter2026.day),
      pass: easter2026.day === 5,
    },
    {
      label: 'Temporal.Now.plainDateISO (KST)',
      expected: 'YYYY-MM-DD',
      actual: today.toString(),
      pass: /^\d{4}-\d{2}-\d{2}$/.test(today.toString()),
    },
    {
      label: "Temporal.PlainDate.from('2026-04-05').month",
      expected: '4',
      actual: String(april5.month),
      pass: april5.month === 4,
    },
  ]
}

export function HermesValidation() {
  const isHermes = !!(global as any).HermesInternal
  let results: Result[] = []
  let error: string | null = null

  try {
    results = run()
  } catch (e) {
    error = String(e)
  }

  const allPass = results.length > 0 && results.every((r) => r.pass)

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Hermes Validation</Text>
      <Text style={[styles.badge, isHermes ? styles.pass : styles.fail]}>
        {isHermes ? '✅ Hermes 엔진' : '⚠️ JSC (not Hermes)'}
      </Text>

      {error ? (
        <Text style={styles.error}>오류: {error}</Text>
      ) : (
        <>
          {results.map((r) => (
            <View key={r.label} style={styles.row}>
              <Text style={styles.label}>{r.label}</Text>
              <Text style={styles.value}>
                예상: {r.expected} / 실제: {r.actual}
              </Text>
              <Text style={r.pass ? styles.pass : styles.fail}>
                {r.pass ? '✅ PASS' : '❌ FAIL'}
              </Text>
            </View>
          ))}
          <Text style={[styles.summary, allPass ? styles.pass : styles.fail]}>
            {allPass ? '🎉 TODO-07 PASS — Phase 0 완료' : '❌ TODO-07 FAIL — 대안 필요'}
          </Text>
        </>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  badge: { fontSize: 16, marginBottom: 16, fontWeight: '600' },
  row: { marginBottom: 12, borderBottomWidth: 1, borderColor: '#eee', paddingBottom: 8 },
  label: { fontSize: 13, color: '#555', fontFamily: 'monospace' },
  value: { fontSize: 12, color: '#333', marginTop: 2 },
  summary: { fontSize: 18, fontWeight: 'bold', marginTop: 20, textAlign: 'center' },
  pass: { color: '#16a34a' },
  fail: { color: '#dc2626' },
  error: { color: '#dc2626', fontFamily: 'monospace' },
})
