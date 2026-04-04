import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { createGroup, joinGroup, leaveGroup, getMyGroups } from '../lib/groups'
import { getFeedPosts, upsertTodayPost, subscribeToFeed, FeedPost } from '../lib/feed'
import { getNickname, setNickname, getUserId } from '../lib/storage'
import { getKSTDateString } from '../utils/date'

type ViewState = 'loading' | 'nickname_setup' | 'no_group' | 'has_group'

export function GroupFeedScreen() {
  const [viewState, setViewState] = useState<ViewState>('loading')
  const [groupCode, setGroupCode] = useState<string | null>(null)
  const [posts, setPosts] = useState<FeedPost[]>([])
  const [isOffline, setIsOffline] = useState(false)
  const [joinCodeInput, setJoinCodeInput] = useState('')
  const [joinError, setJoinError] = useState('')
  const [nicknameInput, setNicknameInput] = useState('')
  const [postContent, setPostContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const hasInitializedInput = useRef(false)

  useEffect(() => {
    initScreen()
  }, [])

  useEffect(() => {
    if (!groupCode) return
    const unsubscribe = subscribeToFeed(groupCode, (updated) => {
      setPosts(updated)
    })
    return unsubscribe
  }, [groupCode])

  // 오늘 내 포스트가 있으면 input 초기값으로 설정 (최초 1회)
  useEffect(() => {
    if (hasInitializedInput.current || posts.length === 0) return
    const today = getKSTDateString()
    const userId = getUserId()
    const myPost = posts.find((p) => p.date === today && p.user_id === userId)
    if (myPost) setPostContent(myPost.content)
    hasInitializedInput.current = true
  }, [posts])

  async function initScreen() {
    const nickname = getNickname()
    if (!nickname) {
      setViewState('nickname_setup')
      return
    }
    await loadGroup()
  }

  async function loadGroup() {
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
  }

  async function loadFeed(code: string) {
    const { posts: fetched, fromCache } = await getFeedPosts(code)
    setPosts(fetched)
    setIsOffline(fromCache)
  }

  async function handleSaveNickname() {
    const trimmed = nicknameInput.trim()
    if (!trimmed) return
    setNickname(trimmed)
    await loadGroup()
  }

  async function handleCreateGroup() {
    try {
      const code = await createGroup()
      setGroupCode(code)
      setViewState('has_group')
    } catch (e: any) {
      Alert.alert('오류', e.message)
    }
  }

  async function handleJoinGroup() {
    setJoinError('')
    const code = joinCodeInput.trim().toUpperCase()
    if (code.length !== 6) {
      setJoinError('6자리 코드를 입력해주세요')
      return
    }
    try {
      await joinGroup(code)
      setJoinCodeInput('')
      await loadGroup()
    } catch (e: any) {
      if (e.message === 'GROUP_NOT_FOUND') setJoinError('코드를 찾을 수 없습니다')
      else if (e.message === 'ALREADY_MEMBER') setJoinError('이미 참여 중인 그룹입니다')
      else setJoinError(e.message)
    }
  }

  async function handleSubmitPost() {
    if (!groupCode || !postContent.trim() || isSaving) return
    setIsSaving(true)
    try {
      await upsertTodayPost(groupCode, postContent.trim())
      await loadFeed(groupCode)
    } catch (e: any) {
      Alert.alert('저장 실패', '다시 시도해주세요')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleLeave() {
    if (!groupCode) return
    Alert.alert('그룹 탈퇴', '정말 탈퇴하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '탈퇴',
        style: 'destructive',
        onPress: async () => {
          try {
            await leaveGroup(groupCode)
            setGroupCode(null)
            setPosts([])
            hasInitializedInput.current = false
            setViewState('no_group')
          } catch (e: any) {
            Alert.alert('오류', e.message)
          }
        },
      },
    ])
  }

  if (viewState === 'loading') {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (viewState === 'nickname_setup') {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>나눔에서 사용할 별명을 입력해주세요</Text>
        <TextInput
          style={styles.input}
          value={nicknameInput}
          onChangeText={setNicknameInput}
          placeholder="예: 말씀이"
          maxLength={20}
        />
        <TouchableOpacity style={styles.button} onPress={handleSaveNickname}>
          <Text style={styles.buttonText}>저장</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (viewState === 'no_group') {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>소그룹에 참여하거나 새로 만드세요</Text>
        <TouchableOpacity style={styles.button} onPress={handleCreateGroup}>
          <Text style={styles.buttonText}>새 그룹 만들기</Text>
        </TouchableOpacity>
        <Text style={styles.divider}>또는</Text>
        <TextInput
          style={styles.input}
          value={joinCodeInput}
          onChangeText={(t) => { setJoinCodeInput(t); setJoinError('') }}
          placeholder="6자리 코드 입력"
          autoCapitalize="characters"
          maxLength={6}
        />
        {joinError ? <Text style={styles.errorText}>{joinError}</Text> : null}
        <TouchableOpacity style={styles.button} onPress={handleJoinGroup}>
          <Text style={styles.buttonText}>참여하기</Text>
        </TouchableOpacity>
      </View>
    )
  }

  // has_group
  const today = getKSTDateString()
  const nickname = getNickname() ?? ''

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {isOffline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>오프라인 — 마지막 저장 피드 표시 중</Text>
        </View>
      )}

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.postCard}>
            <Text style={styles.postDate}>{item.date}</Text>
            <Text style={styles.postContent}>{item.content}</Text>
            <Text style={styles.postAuthor}>
              {item.user_id === getUserId() ? `${nickname} (나)` : '성도'}
            </Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>아직 나눔이 없습니다</Text>}
        contentContainerStyle={styles.listContent}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.postInput}
          value={postContent}
          onChangeText={setPostContent}
          placeholder="오늘의 나눔을 입력하세요 (1000자 이내)"
          maxLength={1000}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, (!postContent.trim() || isOffline) && styles.sendButtonDisabled]}
          onPress={handleSubmitPost}
          disabled={!postContent.trim() || isOffline || isSaving}
        >
          <Text style={styles.sendButtonText}>{isSaving ? '...' : '저장'}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.leaveButton} onPress={handleLeave}>
        <Text style={styles.leaveText}>그룹 탈퇴</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 16, textAlign: 'center' },
  input: {
    width: '100%', borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
    padding: 12, marginBottom: 8, fontSize: 16,
  },
  button: {
    backgroundColor: '#4A90E2', borderRadius: 8, paddingVertical: 12,
    paddingHorizontal: 24, marginBottom: 8,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  divider: { color: '#999', marginVertical: 8 },
  errorText: { color: '#E53935', fontSize: 13, marginBottom: 4 },
  offlineBanner: { backgroundColor: '#FFF3CD', padding: 8 },
  offlineText: { color: '#856404', fontSize: 13, textAlign: 'center' },
  listContent: { padding: 16 },
  postCard: {
    backgroundColor: '#F8F9FA', borderRadius: 8, padding: 12, marginBottom: 8,
  },
  postDate: { fontSize: 11, color: '#999', marginBottom: 4 },
  postContent: { fontSize: 15, color: '#333', lineHeight: 22 },
  postAuthor: { fontSize: 12, color: '#666', marginTop: 4, textAlign: 'right' },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 40 },
  inputRow: {
    flexDirection: 'row', borderTopWidth: 1, borderColor: '#eee',
    padding: 8, alignItems: 'flex-end',
  },
  postInput: {
    flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
    padding: 8, fontSize: 14, maxHeight: 100, marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#4A90E2', borderRadius: 8, paddingVertical: 10,
    paddingHorizontal: 16,
  },
  sendButtonDisabled: { backgroundColor: '#B0C4DE' },
  sendButtonText: { color: '#fff', fontWeight: '600' },
  leaveButton: { padding: 12, alignItems: 'center' },
  leaveText: { color: '#E53935', fontSize: 13 },
})
