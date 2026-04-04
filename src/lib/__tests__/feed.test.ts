jest.mock('../supabase', () => ({
  supabase: {
    from: jest.fn(),
    channel: jest.fn(),
    removeChannel: jest.fn(),
  },
}))

jest.mock('../storage', () => ({
  getUserId: jest.fn(),
  storage: {
    getString: jest.fn(),
    set: jest.fn(),
  },
}))

jest.mock('../../utils/date', () => ({
  getKSTDateString: jest.fn().mockReturnValue('2026-04-04'),
}))

import { getFeedPosts, upsertTodayPost, subscribeToFeed } from '../feed'
import { supabase } from '../supabase'
import { getUserId, storage } from '../storage'

beforeEach(() => {
  jest.clearAllMocks()
  ;(getUserId as jest.Mock).mockReturnValue('user-uuid-1')
  ;(storage.getString as jest.Mock).mockReturnValue(null)
})

const MOCK_POSTS = [
  { id: '1', group_code: 'ABC123', user_id: 'user-uuid-1', content: '오늘 말씀 묵상', date: '2026-04-04', created_at: '2026-04-04T00:00:00Z' },
]

// ---- getFeedPosts ----
describe('getFeedPosts', () => {
  it('Supabase에서 posts 조회 후 MMKV 캐싱, fromCache=false 반환', async () => {
    const mockOrder = jest.fn().mockResolvedValue({ data: MOCK_POSTS, error: null })
    const mockEq = jest.fn().mockReturnValue({ order: mockOrder })
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq })
    ;(supabase.from as jest.Mock).mockReturnValue({ select: mockSelect })

    const { posts, fromCache } = await getFeedPosts('ABC123')

    expect(posts).toEqual(MOCK_POSTS)
    expect(fromCache).toBe(false)
    expect(storage.set).toHaveBeenCalledWith(
      'feed.cache.ABC123',
      JSON.stringify(MOCK_POSTS)
    )
  })

  it('Supabase 에러 시 MMKV 캐시 반환, fromCache=true', async () => {
    const mockOrder = jest.fn().mockResolvedValue({ data: null, error: { message: 'network error' } })
    const mockEq = jest.fn().mockReturnValue({ order: mockOrder })
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq })
    ;(supabase.from as jest.Mock).mockReturnValue({ select: mockSelect })
    ;(storage.getString as jest.Mock).mockReturnValue(JSON.stringify(MOCK_POSTS))

    const { posts, fromCache } = await getFeedPosts('ABC123')

    expect(posts).toEqual(MOCK_POSTS)
    expect(fromCache).toBe(true)
  })

  it('Supabase 에러 + 캐시 없으면 빈 배열 반환', async () => {
    const mockOrder = jest.fn().mockResolvedValue({ data: null, error: { message: 'error' } })
    ;(supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({ eq: jest.fn().mockReturnValue({ order: mockOrder }) }),
    })
    ;(storage.getString as jest.Mock).mockReturnValue(null)

    const { posts } = await getFeedPosts('ABC123')
    expect(posts).toEqual([])
  })
})

// ---- upsertTodayPost ----
describe('upsertTodayPost', () => {
  it('오늘 날짜와 content로 upsert 호출', async () => {
    const mockUpsert = jest.fn().mockResolvedValue({ error: null })
    ;(supabase.from as jest.Mock).mockReturnValue({ upsert: mockUpsert })

    await upsertTodayPost('ABC123', '오늘의 나눔입니다')

    expect(supabase.from).toHaveBeenCalledWith('feed_posts')
    expect(mockUpsert).toHaveBeenCalledWith(
      { group_code: 'ABC123', user_id: 'user-uuid-1', content: '오늘의 나눔입니다', date: '2026-04-04' },
      { onConflict: 'user_id,group_code,date' }
    )
  })

  it('인증 없으면 throw', async () => {
    ;(getUserId as jest.Mock).mockReturnValue(undefined)
    await expect(upsertTodayPost('ABC123', '내용')).rejects.toThrow('Not authenticated')
  })

  it('Supabase 에러 시 throw', async () => {
    ;(supabase.from as jest.Mock).mockReturnValue({
      upsert: jest.fn().mockResolvedValue({ error: { message: 'upsert failed' } }),
    })
    await expect(upsertTodayPost('ABC123', '내용')).rejects.toThrow('upsert failed')
  })
})

// ---- subscribeToFeed ----
describe('subscribeToFeed', () => {
  it('channel 구독 후 unsubscribe 함수 반환', () => {
    const mockChannel = { on: jest.fn(), subscribe: jest.fn() }
    mockChannel.on.mockReturnValue(mockChannel)
    mockChannel.subscribe.mockReturnValue(mockChannel)
    ;(supabase.channel as jest.Mock).mockReturnValue(mockChannel)

    const unsubscribe = subscribeToFeed('ABC123', jest.fn())

    expect(supabase.channel).toHaveBeenCalledWith('feed:ABC123')
    expect(typeof unsubscribe).toBe('function')

    unsubscribe()
    expect(supabase.removeChannel).toHaveBeenCalledWith(mockChannel)
  })

  it('Realtime 이벤트 수신 시 callback 호출', async () => {
    let capturedHandler: (() => Promise<void>) | null = null
    const mockSubscribe = jest.fn().mockReturnValue({})
    const mockOn = jest.fn().mockImplementation((_event: string, _filter: unknown, handler: () => Promise<void>) => {
      capturedHandler = handler
      return { subscribe: mockSubscribe }
    })
    ;(supabase.channel as jest.Mock).mockReturnValue({ on: mockOn })

    // getFeedPosts mock (supabase.from 체인)
    const mockOrder = jest.fn().mockResolvedValue({ data: [], error: null })
    const mockEq = jest.fn().mockReturnValue({ order: mockOrder })
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq })
    ;(supabase.from as jest.Mock).mockReturnValue({ select: mockSelect })

    const cb = jest.fn()
    subscribeToFeed('ABC123', cb)

    expect(capturedHandler).not.toBeNull()
    await capturedHandler!()
    expect(cb).toHaveBeenCalledWith([])
  })
})
