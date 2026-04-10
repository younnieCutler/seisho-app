import React from 'react'
import { View, ActivityIndicator, Alert } from 'react-native'
import { useGroupFeed } from '../hooks/useGroupFeed'
import { NicknameSetup } from './group/NicknameSetup'
import { GroupJoinCreate } from './group/GroupJoinCreate'
import { FeedView } from './group/FeedView'
import { useTheme, CommonStyles } from '../utils/theme'

export function GroupFeedScreen() {
  const { colors } = useTheme()
  const {
    viewState,
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
  } = useGroupFeed()

  const onLeaveWrapper = () => {
    Alert.alert('그룹 탈퇴', '정말 탈퇴하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '탈퇴',
        style: 'destructive',
        onPress: async () => {
          try {
            await handleLeaveGroup()
          } catch (e: any) {
            Alert.alert('오류', e.message)
          }
        },
      },
    ])
  }

  const onCreateWrapper = async () => {
    try {
      await handleCreateGroup()
    } catch (e: any) {
      Alert.alert('오류', e.message)
    }
  }

  const onSubmitWrapper = async (content: string) => {
    try {
      await handleSubmitPost(content)
    } catch (e: any) {
      Alert.alert('저장 실패', '다시 시도해주세요')
    }
  }

  if (viewState === 'loading') {
    return (
      <View style={[CommonStyles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {viewState === 'nickname_setup' && (
        <NicknameSetup onSave={handleSaveNickname} />
      )}
      {viewState === 'no_group' && (
        <GroupJoinCreate 
          onCreate={onCreateWrapper} 
          onJoin={handleJoinGroup} 
          joinError={joinError} 
          setJoinError={setJoinError} 
        />
      )}
      {viewState === 'has_group' && (
        <FeedView
          posts={posts}
          isOffline={isOffline}
          postContent={postContent}
          setPostContent={setPostContent}
          onSubmit={onSubmitWrapper}
          isSaving={isSaving}
          onLeave={onLeaveWrapper}
        />
      )}
    </View>
  )
}

