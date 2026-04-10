import React from 'react'
import { render, waitFor, fireEvent, act } from '@testing-library/react-native'
import { Share } from 'react-native'
import { GroupFeedScreen } from '../GroupFeedScreen'
import { getNickname, setNickname } from '../../lib/storage'
import { getMyGroups, createGroup, joinGroup } from '../../lib/groups'
import { getFeedPosts, upsertTodayPost, subscribeToFeed } from '../../lib/feed'


jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}))

jest.mock('../../lib/supabase', () => ({
  initAnonAuth: jest.fn().mockResolvedValue('user-uuid-1'),
}))

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
      expect(getByText(/이름을 알려주세요/)).toBeTruthy()
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
      expect(getByText(/아직 오늘 나눔이 없어요/)).toBeTruthy()
    })
  })

  it('닉네임 입력 후 저장 버튼 → 그룹 없음 화면으로 이동', async () => {
    ;(getNickname as jest.Mock).mockReturnValue(undefined)
    ;(getMyGroups as jest.Mock).mockResolvedValue([])
    const { getByText, getByPlaceholderText } = render(<GroupFeedScreen />)
    await waitFor(() => getByText(/이름을 알려주세요/))

    fireEvent.changeText(getByPlaceholderText('예: 말씀이, 은혜랑'), '테스트유저')
    fireEvent.press(getByText('시작하기'))

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

    fireEvent.changeText(getByPlaceholderText('6자리 코드'), 'AB')
    fireEvent.press(getByText('참여'))

    await waitFor(() => expect(getByText('6자리 코드를 입력해 주세요')).toBeTruthy())
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

    fireEvent.changeText(getByPlaceholderText('6자리 코드'), 'ABC123')
    fireEvent.press(getByText('참여'))

    await waitFor(() => expect(joinGroup).toHaveBeenCalledWith('ABC123'))
  })

  // ---- 신규 테스트 ----

  it('나눔 저장 시 upsertTodayPost에 nickname 전달', async () => {
    ;(getNickname as jest.Mock).mockReturnValue('말씀이')
    ;(getMyGroups as jest.Mock).mockResolvedValue(['ABC123'])
    ;(getFeedPosts as jest.Mock).mockResolvedValue({ posts: [], fromCache: false })
    ;(upsertTodayPost as jest.Mock).mockResolvedValue(undefined)

    const { getByPlaceholderText, getByText } = render(<GroupFeedScreen />)
    await waitFor(() => getByText(/아직 오늘 나눔이 없어요/))

    fireEvent.changeText(getByPlaceholderText('오늘 말씀에서 받은 은혜를...'), '테스트 나눔')
    fireEvent.press(getByText('나눔 올리기'))

    await waitFor(() =>
      expect(upsertTodayPost).toHaveBeenCalledWith('ABC123', '테스트 나눔', '말씀이')
    )
  })

  it('내 포스트 카드에 nickname (나) 표시', async () => {
    ;(getNickname as jest.Mock).mockReturnValue('말씀이')
    ;(getMyGroups as jest.Mock).mockResolvedValue(['ABC123'])
    ;(getFeedPosts as jest.Mock).mockResolvedValue({
      posts: [
        { id: '1', group_code: 'ABC123', user_id: 'user-uuid-1', nickname: '말씀이', content: '내 나눔', date: '2026-04-05', created_at: '' },
      ],
      fromCache: false,
    })

    const { getByText } = render(<GroupFeedScreen />)
    await waitFor(() => expect(getByText(/말씀이.*나/)).toBeTruthy())
  })

  it('글자수 카운터 렌더링 및 입력 반영', async () => {
    ;(getNickname as jest.Mock).mockReturnValue('TestUser')
    ;(getMyGroups as jest.Mock).mockResolvedValue(['ABC123'])
    ;(getFeedPosts as jest.Mock).mockResolvedValue({ posts: [], fromCache: false })

    const { getByText, getByPlaceholderText } = render(<GroupFeedScreen />)
    await waitFor(() => getByText(/아직 오늘 나눔이 없어요/))

    expect(getByText('0')).toBeTruthy()

    fireEvent.changeText(getByPlaceholderText('오늘 말씀에서 받은 은혜를...'), '안녕')
    expect(getByText('2')).toBeTruthy()
  })

  it('그룹 코드 배지 터치 → Share.share 호출', async () => {
    const shareSpy = jest.spyOn(Share, 'share').mockResolvedValue({ action: 'sharedAction' })
    ;(getNickname as jest.Mock).mockReturnValue('TestUser')
    ;(getMyGroups as jest.Mock).mockResolvedValue(['ABC123'])
    ;(getFeedPosts as jest.Mock).mockResolvedValue({ posts: [], fromCache: false })

    const { getByText } = render(<GroupFeedScreen />)
    await waitFor(() => getByText('ABC123'))

    await act(async () => {
      fireEvent.press(getByText('ABC123'))
    })

    expect(shareSpy).toHaveBeenCalledWith({ message: '세이쇼 소그룹 코드: ABC123' })
    shareSpy.mockRestore()
  })
})
