import { createClient } from '@supabase/supabase-js'
import { getUserId, setUserId } from './storage'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase env vars not set: EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * 익명 인증 초기화.
 * - MMKV에 user_id가 있으면 Supabase 호출 없이 반환
 * - 없으면 signInAnonymously 호출 후 MMKV에 저장
 * - 오프라인/에러 시 null 반환 (앱은 계속 동작)
 */
export async function initAnonAuth(): Promise<string | null> {
  const existing = getUserId()
  if (existing) return existing

  const { data, error } = await supabase.auth.signInAnonymously()
  if (error || !data.user) return null

  setUserId(data.user.id)
  return data.user.id
}
