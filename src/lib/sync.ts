import { supabase } from './supabase'

export async function syncVerseRead(userId: string | null, date: string): Promise<void> {
  if (!userId) return

  const { error } = await supabase.from('analytics_events').insert({
    user_id: userId,
    event_type: 'verse_read',
    event_data: { date },
  })

  if (error) {
    console.error('[sync] syncVerseRead failed:', error.message)
  }
}
