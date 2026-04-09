import { createClient } from '@supabase/supabase-js'
import { getUserId, setUserId, storage } from './storage'

// MMKV-backed storage adapter
const mmkvAdapter = {
  getItem: (key: string) => storage.getString(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, value),
  removeItem: (key: string) => storage.delete(key),
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase env vars not set: EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: mmkvAdapter,
    autoRefreshToken: true,
    persistSession: true,
  },
})

/**
 * 익명 인증 초기화.
 * - Supabase 세션을 확인 후 없으면 익명 로그인.
 * - 오프라인/에러 시 null 반환.
 */
export async function initAnonAuth(): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      setUserId(session.user.id)
      return session.user.id
    }

    const { data, error } = await supabase.auth.signInAnonymously()
    if (error || !data.user) return null

    setUserId(data.user.id)
    return data.user.id
  } catch (e) {
    return null
  }
}

export const authReady = initAnonAuth().catch(() => null)
