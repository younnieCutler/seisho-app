import React from 'react'
import { View, ActivityIndicator, Alert } from 'react-native'
import { useGroupFeed } from '../hooks/useGroupFeed'
import { NicknameSetup } from './group/NicknameSetup'
import { GroupJoinCreate } from './group/GroupJoinCreate'
import { FeedView } from './group/FeedView'
import { CommonStyles } from '../utils/theme'

export function GroupFeedScreen() {
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
      <View style={CommonStyles.center}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (viewState === 'nickname_setup') {
    return <NicknameSetup onSave={handleSaveNickname} />
  }

  if (viewState === 'no_group') {
    return (
      <GroupJoinCreate 
        onCreate={onCreateWrapper} 
        onJoin={handleJoinGroup} 
        joinError={joinError} 
        setJoinError={setJoinError} 
      />
    )
  }

  return (
    <FeedView
      posts={posts}
      isOffline={isOffline}
      postContent={postContent}
      setPostContent={setPostContent}
      onSubmit={onSubmitWrapper}
      isSaving={isSaving}
      onLeave={onLeaveWrapper}
    />
  )
}
