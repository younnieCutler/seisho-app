jest.mock('../supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}))

import { syncVerseRead } from '../sync'
import { supabase } from '../supabase'

describe('syncVerseRead', () => {
  const mockInsert = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(supabase.from as jest.Mock).mockReturnValue({
      insert: mockInsert.mockReturnValue({ error: null }),
    })
  })

  it('inserts verse_read event with user_id and date', async () => {
    await syncVerseRead('user-uuid-123', '2026-04-01')

    expect(supabase.from).toHaveBeenCalledWith('analytics_events')
    expect(mockInsert).toHaveBeenCalledWith({
      user_id: 'user-uuid-123',
      event_type: 'verse_read',
      event_data: { date: '2026-04-01' },
    })
  })

  it('does not throw on Supabase error', async () => {
    ;(supabase.from as jest.Mock).mockReturnValue({
      insert: jest.fn().mockReturnValue({ error: { message: 'insert failed' } }),
    })

    await expect(syncVerseRead('user-uuid-123', '2026-04-01')).resolves.not.toThrow()
  })

  it('does not throw if userId is null (offline state)', async () => {
    await expect(syncVerseRead(null, '2026-04-01')).resolves.not.toThrow()
    expect(supabase.from).not.toHaveBeenCalled()
  })
})
