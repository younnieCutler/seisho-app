jest.mock('../supabase', () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn(),
  },
}))

jest.mock('../storage', () => ({
  getUserId: jest.fn(),
}))

import { createGroup, joinGroup, leaveGroup, getMyGroups } from '../groups'
import { supabase } from '../supabase'
import { getUserId } from '../storage'

beforeEach(() => {
  jest.clearAllMocks()
  ;(getUserId as jest.Mock).mockReturnValue('user-uuid-1')
})

// ---- createGroup ----
describe('createGroup', () => {
  it('RPC 호출 후 groups + member_status에 insert하고 code 반환', async () => {
    ;(supabase.rpc as jest.Mock).mockResolvedValue({ data: 'ABC123', error: null })
    const mockInsert = jest.fn().mockResolvedValue({ error: null })
    ;(supabase.from as jest.Mock).mockReturnValue({ insert: mockInsert })

    const code = await createGroup()

    expect(supabase.rpc).toHaveBeenCalledWith('generate_group_code')
    expect(supabase.from).toHaveBeenCalledWith('groups')
    expect(supabase.from).toHaveBeenCalledWith('member_status')
    expect(code).toBe('ABC123')
  })

  it('인증 없으면 throw', async () => {
    ;(getUserId as jest.Mock).mockReturnValue(undefined)
    await expect(createGroup()).rejects.toThrow('Not authenticated')
  })

  it('RPC 에러 시 throw', async () => {
    ;(supabase.rpc as jest.Mock).mockResolvedValue({ data: null, error: { message: 'rpc_failed' } })
    await expect(createGroup()).rejects.toThrow('rpc_failed')
  })
})

// ---- joinGroup ----
describe('joinGroup', () => {
  it('유효한 코드 + 미가입 → member_status insert', async () => {
    const mockInsert = jest.fn().mockResolvedValue({ error: null })
    ;(supabase.from as jest.Mock)
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: { group_code: 'ABC123' }, error: null }),
          }),
        }),
      })
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
        }),
      })
      .mockReturnValueOnce({ insert: mockInsert })

    await joinGroup('abc123')

    expect(mockInsert).toHaveBeenCalledWith({ user_id: 'user-uuid-1', group_code: 'ABC123' })
  })

  it('없는 코드 → GROUP_NOT_FOUND throw', async () => {
    ;(supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null, error: { message: 'not found' } }),
        }),
      }),
    })

    await expect(joinGroup('XXXXXX')).rejects.toThrow('GROUP_NOT_FOUND')
  })

  it('이미 가입 → ALREADY_MEMBER throw', async () => {
    ;(supabase.from as jest.Mock)
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: { group_code: 'ABC123' }, error: null }),
          }),
        }),
      })
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              maybeSingle: jest.fn().mockResolvedValue({ data: { id: 'existing' }, error: null }),
            }),
          }),
        }),
      })

    await expect(joinGroup('ABC123')).rejects.toThrow('ALREADY_MEMBER')
  })
})

// ---- leaveGroup ----
describe('leaveGroup', () => {
  it('member_status에서 해당 레코드 delete', async () => {
    const mockDeleteChain = jest.fn().mockResolvedValue({ error: null })
    const mockEq2 = jest.fn().mockReturnValue(mockDeleteChain)
    const mockEq1 = jest.fn().mockReturnValue({ eq: mockEq2 })
    ;(supabase.from as jest.Mock).mockReturnValue({
      delete: jest.fn().mockReturnValue({ eq: mockEq1 }),
    })

    await leaveGroup('ABC123')

    expect(supabase.from).toHaveBeenCalledWith('member_status')
    expect(mockEq1).toHaveBeenCalledWith('user_id', 'user-uuid-1')
    expect(mockEq2).toHaveBeenCalledWith('group_code', 'ABC123')
  })

  it('에러 시 throw', async () => {
    ;(supabase.from as jest.Mock).mockReturnValue({
      delete: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: { message: 'delete failed' } }),
        }),
      }),
    })

    await expect(leaveGroup('ABC123')).rejects.toThrow('delete failed')
  })
})

// ---- getMyGroups ----
describe('getMyGroups', () => {
  it('userId가 없으면 빈 배열 반환', async () => {
    ;(getUserId as jest.Mock).mockReturnValue(undefined)
    const result = await getMyGroups()
    expect(result).toEqual([])
    expect(supabase.from).not.toHaveBeenCalled()
  })

  it('group_code 목록 반환', async () => {
    ;(supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: [{ group_code: 'ABC123' }, { group_code: 'DEF456' }],
          error: null,
        }),
      }),
    })

    const result = await getMyGroups()
    expect(result).toEqual(['ABC123', 'DEF456'])
  })

  it('Supabase 에러 시 빈 배열 반환', async () => {
    ;(supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ data: null, error: { message: 'fetch failed' } }),
      }),
    })

    const result = await getMyGroups()
    expect(result).toEqual([])
  })
})

// ---- 커버리지 갭 채우기 ----
describe('createGroup — 에러 경로', () => {
  it('groups.insert 에러 시 throw', async () => {
    ;(supabase.rpc as jest.Mock).mockResolvedValue({ data: 'ABC123', error: null })
    ;(supabase.from as jest.Mock).mockReturnValueOnce({
      insert: jest.fn().mockResolvedValue({ error: { message: 'insert failed' } }),
    })
    await expect(createGroup()).rejects.toThrow('insert failed')
  })

  it('member_status.insert 에러 시 throw', async () => {
    ;(supabase.rpc as jest.Mock).mockResolvedValue({ data: 'ABC123', error: null })
    ;(supabase.from as jest.Mock)
      .mockReturnValueOnce({ insert: jest.fn().mockResolvedValue({ error: null }) })
      .mockReturnValueOnce({ insert: jest.fn().mockResolvedValue({ error: { message: 'member failed' } }) })
    await expect(createGroup()).rejects.toThrow('member failed')
  })
})

describe('joinGroup — 에러 경로', () => {
  it('인증 없으면 throw', async () => {
    ;(getUserId as jest.Mock).mockReturnValueOnce(undefined)
    await expect(joinGroup('ABC123')).rejects.toThrow('Not authenticated')
  })

  it('member insert 에러 시 throw', async () => {
    ;(supabase.from as jest.Mock)
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: { group_code: 'ABC123' }, error: null }),
          }),
        }),
      })
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        insert: jest.fn().mockResolvedValue({ error: { message: 'insert err' } }),
      })
    await expect(joinGroup('ABC123')).rejects.toThrow('insert err')
  })
})

describe('leaveGroup — 에러 경로', () => {
  it('인증 없으면 throw', async () => {
    ;(getUserId as jest.Mock).mockReturnValueOnce(undefined)
    await expect(leaveGroup('ABC123')).rejects.toThrow('Not authenticated')
  })
})
