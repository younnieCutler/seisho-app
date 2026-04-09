import { useState, useEffect, useRef, useCallback } from 'react'
import { getMyGroups, joinGroup, createGroup, leaveGroup } from '../lib/groups'
import { getFeedPosts, subscribeToFeed, upsertTodayPost, FeedPost } from '../lib/feed'
import { getNickname, setNickname, getUserId } from '../lib/storage'
import { getKSTDateString } from '../utils/date'

export type ViewState = 'loading' | 'nickname_setup' | 'no_group' | 'has_group'

export function useGroupFeed() {
  const [viewState, setViewState] = useState<ViewState>('loading')
  const [groupCode, setGroupCode] = useState<string | null>(null)
  const [posts, setPosts] = useState<FeedPost[]>([])
  const [isOffline, setIsOffline] = useState(false)
  
  const [joinError, setJoinError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [postContent, setPostContent] = useState('')

  const hasInitializedInput = useRef(false)

  const loadFeed = useCallback(async (code: string) => {
    const { posts: fetched, fromCache } = await getFeedPosts(code)
    setPosts(fetched)
    setIsOffline(fromCache)
  }, [])

  const loadGroup = useCallback(async () => {
    setViewState('loading')
    const groups = await getMyGroups()
    if (groups.length === 0) {
      setViewState('no_group')
      return
    }
    const code = groups[0]
    setGroupCode(code)
    await loadFeed(code)
    setViewState('has_group')
  }, [loadFeed])

  const initScreen = useCallback(async () => {
    const nickname = getNickname()
    if (!nickname) {
      setViewState('nickname_setup')
      return
    }
    await loadGroup()
  }, [loadGroup])

  useEffect(() => {
    initScreen()
  }, [initScreen])

  useEffect(() => {
    if (!groupCode) return
    const unsubscribe = subscribeToFeed(groupCode, (updated) => {
      setPosts(updated)
    })
    return unsubscribe
  }, [groupCode])

  useEffect(() => {
    if (hasInitializedInput.current || posts.length === 0) return
    const today = getKSTDateString()
    const userId = getUserId()
    const myPost = posts.find((p) => p.date === today && p.user_id === userId)
    if (myPost) setPostContent(myPost.content)
    hasInitializedInput.current = true
  }, [posts])

  const handleSaveNickname = async (name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    setNickname(trimmed)
    await loadGroup()
  }

  const handleCreateGroup = async () => {
    try {
      const code = await createGroup()
      setGroupCode(code)
      setViewState('has_group')
    } catch (e: any) {
      throw e
    }
  }

  const handleJoinGroup = async (codeStr: string) => {
    setJoinError('')
    const code = codeStr.trim().toUpperCase()
    if (code.length !== 6) {
      setJoinError('6자리 코드를 입력해주세요')
      throw new Error('6자리 코드를 입력해주세요')
    }
    try {
      await joinGroup(code)
      await loadGroup()
    } catch (e: any) {
      let msg = e.message
      if (e.message === 'GROUP_NOT_FOUND') msg = '코드를 찾을 수 없습니다'
      else if (e.message === 'ALREADY_MEMBER') msg = '이미 참여 중인 그룹입니다'
      setJoinError(msg)
      throw new Error(msg)
    }
  }

  const handleSubmitPost = async (content: string) => {
    if (!groupCode || !content.trim() || isSaving) return
    setIsSaving(true)
    try {
      await upsertTodayPost(groupCode, content.trim())
      await loadFeed(groupCode)
      setPostContent(content)
    } catch (e: any) {
      throw e
    } finally {
      setIsSaving(false)
    }
  }

  const handleLeaveGroup = async () => {
    if (!groupCode) return
    try {
      await leaveGroup(groupCode)
      setGroupCode(null)
      setPosts([])
      hasInitializedInput.current = false
      setPostContent('')
      setViewState('no_group')
    } catch (e: any) {
      throw e
    }
  }

  return {
    viewState,
    groupCode,
    posts,
    isOffline,
    joinError,
    setJoinError,
    isSaving,
    postContent,
    setPostContent,
    handleSaveNickname,
    handleCreateGroup,
    handleJoinGroup,
    handleSubmitPost,
    handleLeaveGroup,
  }
}
