import { supabase, authReady } from './supabase'
import { getUserId, storage } from './storage'
import { getKSTDateString } from '../utils/date'

export interface FeedPost {
  id: string
  group_code: string
  user_id: string
  content: string
  date: string
  created_at: string
}

const CACHE_PREFIX = 'feed.cache.'

export async function getFeedPosts(
  groupCode: string
): Promise<{ posts: FeedPost[]; fromCache: boolean }> {
  await authReady
  const { data, error } = await supabase
    .from('feed_posts')
    .select('*')
    .eq('group_code', groupCode)
    .order('date', { ascending: false })

  if (error) {
    const cached = storage.getString(CACHE_PREFIX + groupCode)
    return { posts: cached ? JSON.parse(cached) : [], fromCache: true }
  }

  const posts = (data ?? []) as FeedPost[]
  storage.set(CACHE_PREFIX + groupCode, JSON.stringify(posts))
  return { posts, fromCache: false }
}

export async function upsertTodayPost(groupCode: string, content: string): Promise<void> {
  await authReady
  const userId = getUserId()
  if (!userId) throw new Error('Not authenticated')

  const today = getKSTDateString()

  const { error } = await supabase
    .from('feed_posts')
    .upsert(
      { group_code: groupCode, user_id: userId, content, date: today },
      { onConflict: 'user_id,group_code,date' }
    )

  if (error) throw new Error(error.message)
}

export function subscribeToFeed(
  groupCode: string,
  callback: (posts: FeedPost[]) => void
): () => void {
  const channel = supabase
    .channel(`feed:${groupCode}`)
    .on(
      'postgres_changes' as any,
      { event: '*', schema: 'public', table: 'feed_posts', filter: `group_code=eq.${groupCode}` },
      async () => {
        const { posts } = await getFeedPosts(groupCode)
        callback(posts)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
