import React from 'react'
import { render, waitFor, fireEvent } from '@testing-library/react-native'
import { GroupFeedScreen } from '../GroupFeedScreen'
import { getNickname, setNickname } from '../../lib/storage'
import { getMyGroups, createGroup, joinGroup } from '../../lib/groups'
import { getFeedPosts, subscribeToFeed } from '../../lib/feed'

jest.mock('../../lib/groups', () => ({
  getMyGroups: jest.fn(),
  createGroup: jest.fn(),
  joinGroup: jest.fn(),
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

  it('닉네임 입력 후 저장 버튼 → 그룹 없음 화면으로 이동', async () => {
    ;(getNickname as jest.Mock).mockReturnValue(undefined)
    ;(getMyGroups as jest.Mock).mockResolvedValue([])
    const { getByText, getByPlaceholderText } = render(<GroupFeedScreen />)
    await waitFor(() => getByText(/별명을 입력해주세요/))

    fireEvent.changeText(getByPlaceholderText('예: 말씀이'), '테스트유저')
    fireEvent.press(getByText('저장'))

    await waitFor(() => expect(setNickname).toHaveBeenCalledWith('테스트유저'))
  })

  it('새 그룹 만들기 버튼 → has_group 상태로 전환', async () => {
    ;(getNickname as jest.Mock).mockReturnValue('TestUser')
    ;(getMyGroups as jest.Mock).mockResolvedValue([])
    ;(createGroup as jest.Mock).mockResolvedValue('NEW123')
    ;(getFeedPosts as jest.Mock).mockResolvedValue({ posts: [], fromCache: false })
    const { getByText } = render(<GroupFeedScreen />)
    await waitFor(() => getByText(/새 그룹 만들기/))

    fireEvent.press(getByText('새 그룹 만들기'))

    await waitFor(() => expect(createGroup).toHaveBeenCalled())
  })

  it('코드 6자리 미만 입력 시 에러 메시지 표시', async () => {
    ;(getNickname as jest.Mock).mockReturnValue('TestUser')
    ;(getMyGroups as jest.Mock).mockResolvedValue([])
    const { getByText, getByPlaceholderText } = render(<GroupFeedScreen />)
    await waitFor(() => getByText(/새 그룹 만들기/))

    fireEvent.changeText(getByPlaceholderText('6자리 코드 입력'), 'AB')
    fireEvent.press(getByText('참여하기'))

    await waitFor(() => expect(getByText('6자리 코드를 입력해주세요')).toBeTruthy())
  })

  it('유효한 코드로 참여 시 joinGroup 호출', async () => {
    ;(getNickname as jest.Mock).mockReturnValue('TestUser')
    ;(getMyGroups as jest.Mock)
      .mockResolvedValueOnce([])          // 최초 로드
      .mockResolvedValueOnce(['ABC123'])  // joinGroup 후 로드
    ;(joinGroup as jest.Mock).mockResolvedValue(undefined)
    ;(getFeedPosts as jest.Mock).mockResolvedValue({ posts: [], fromCache: false })
    const { getByText, getByPlaceholderText } = render(<GroupFeedScreen />)
    await waitFor(() => getByText(/새 그룹 만들기/))

    fireEvent.changeText(getByPlaceholderText('6자리 코드 입력'), 'ABC123')
    fireEvent.press(getByText('참여하기'))

    await waitFor(() => expect(joinGroup).toHaveBeenCalledWith('ABC123'))
  })
})
