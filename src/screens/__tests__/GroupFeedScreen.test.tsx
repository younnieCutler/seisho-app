import React from 'react'
import { render, waitFor } from '@testing-library/react-native'
import { GroupFeedScreen } from '../GroupFeedScreen'
import { getNickname } from '../../lib/storage'
import { getMyGroups } from '../../lib/groups'
import { getFeedPosts, subscribeToFeed } from '../../lib/feed'

jest.mock('../../lib/groups', () => ({
  getMyGroups: jest.fn(),
  createGroup: jest.fn(),
  joinGroup: jest.fn(),
  leaveGroup: jest.fn(),
}))

jest.mock('../../lib/feed', () => ({
  getFeedPosts: jest.fn(),
  upsertTodayPost: jest.fn(),
  subscribeToFeed: jest.fn(),
}))

jest.mock('../../lib/storage', () => ({
  getNickname: jest.fn(),
  setNickname: jest.fn(),
  getUserId: jest.fn().mockReturnValue('user-uuid-1'),
}))

jest.mock('../../utils/date', () => ({
  getKSTDateString: jest.fn().mockReturnValue('2026-04-05'),
}))

jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}))

beforeEach(() => {
  jest.clearAllMocks()
  ;(subscribeToFeed as jest.Mock).mockReturnValue(jest.fn()) // unsubscribe fn
})

describe('GroupFeedScreen', () => {
  it('닉네임 미설정 시 별명 입력 프롬프트 표시', async () => {
    ;(getNickname as jest.Mock).mockReturnValue(undefined)
    const { getByText } = render(<GroupFeedScreen />)
    await waitFor(() => {
      expect(getByText(/별명을 입력해주세요/)).toBeTruthy()
    })
  })

  it('닉네임 있고 그룹 없으면 그룹 없음 UI 표시', async () => {
    ;(getNickname as jest.Mock).mockReturnValue('TestUser')
    ;(getMyGroups as jest.Mock).mockResolvedValue([])
    const { getByText } = render(<GroupFeedScreen />)
    await waitFor(() => {
      expect(getByText(/새 그룹 만들기/)).toBeTruthy()
    })
  })

  it('닉네임 있고 그룹 있으면 피드 UI 표시', async () => {
    ;(getNickname as jest.Mock).mockReturnValue('TestUser')
    ;(getMyGroups as jest.Mock).mockResolvedValue(['ABC123'])
    ;(getFeedPosts as jest.Mock).mockResolvedValue({ posts: [], fromCache: false })
    const { getByText } = render(<GroupFeedScreen />)
    await waitFor(() => {
      expect(getByText(/아직 나눔이 없습니다/)).toBeTruthy()
    })
  })
})
