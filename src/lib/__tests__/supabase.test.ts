const mockSignInAnonymously = jest.fn()

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: { signInAnonymously: mockSignInAnonymously },
  })),
}))

jest.mock('../storage', () => ({
  getUserId: jest.fn(),
  setUserId: jest.fn(),
}))

describe('initAnonAuth', () => {
  let initAnonAuth: () => Promise<string | null>
  let mockGetUserId: jest.Mock
  let mockSetUserId: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

    jest.isolateModules(() => {
      const supabaseModule = require('../supabase')
      const storageModule = require('../storage')
      initAnonAuth = supabaseModule.initAnonAuth
      mockGetUserId = storageModule.getUserId
      mockSetUserId = storageModule.setUserId
    })
  })

  it('returns existing user_id from MMKV without calling Supabase', async () => {
    mockGetUserId.mockReturnValue('existing-uuid')

    const result = await initAnonAuth()

    expect(result).toBe('existing-uuid')
    expect(mockSignInAnonymously).not.toHaveBeenCalled()
  })

  it('calls signInAnonymously and stores user_id when no existing id', async () => {
    mockGetUserId.mockReturnValue(undefined)
    mockSignInAnonymously.mockResolvedValue({
      data: { user: { id: 'new-uuid-1234' } },
      error: null,
    })

    const result = await initAnonAuth()

    expect(mockSignInAnonymously).toHaveBeenCalledTimes(1)
    expect(mockSetUserId).toHaveBeenCalledWith('new-uuid-1234')
    expect(result).toBe('new-uuid-1234')
  })

  it('returns null and does not throw on Supabase error (offline)', async () => {
    mockGetUserId.mockReturnValue(undefined)
    mockSignInAnonymously.mockResolvedValue({
      data: { user: null },
      error: { message: 'Network error' },
    })

    const result = await initAnonAuth()

    expect(result).toBeNull()
    expect(mockSetUserId).not.toHaveBeenCalled()
  })
})
