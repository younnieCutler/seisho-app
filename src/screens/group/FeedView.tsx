import React from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { Colors, FontSize, CommonStyles } from '../../utils/theme'
import { FeedPost } from '../../lib/feed'
import { getUserId, getNickname } from '../../lib/storage'
import { getKSTDateString } from '../../utils/date'

interface Props {
  posts: FeedPost[]
  isOffline: boolean
  postContent: string
  setPostContent: (c: string) => void
  onSubmit: (content: string) => void
  isSaving: boolean
  onLeave: () => void
}

export function FeedView({
  posts,
  isOffline,
  postContent,
  setPostContent,
  onSubmit,
  isSaving,
  onLeave,
}: Props) {
  const nickname = getNickname() ?? ''

  return (
    <KeyboardAvoidingView
      style={CommonStyles.container}
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
          onPress={() => onSubmit(postContent)}
          disabled={!postContent.trim() || isOffline || isSaving}
        >
          <Text style={styles.sendButtonText}>{isSaving ? '...' : '저장'}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.leaveButton} onPress={onLeave}>
        <Text style={styles.leaveText}>그룹 탈퇴</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  offlineBanner: { backgroundColor: '#FFF3CD', padding: 8 },
  offlineText: { color: '#856404', fontSize: FontSize.sm, textAlign: 'center' },
  listContent: { padding: 16 },
  postCard: {
    backgroundColor: Colors.surface, borderRadius: 8, padding: 12, marginBottom: 8,
  },
  postDate: { fontSize: FontSize.xxs, color: Colors.textMuted, marginBottom: 4 },
  postContent: { fontSize: FontSize.sm, color: Colors.text, lineHeight: 22 },
  postAuthor: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 4, textAlign: 'right' },
  emptyText: { textAlign: 'center', color: Colors.textMuted, marginTop: 40 },
  inputRow: {
    flexDirection: 'row', borderTopWidth: 1, borderColor: Colors.border,
    padding: 8, alignItems: 'flex-end',
  },
  postInput: {
    flex: 1, borderWidth: 1, borderColor: Colors.border, borderRadius: 8,
    padding: 8, fontSize: FontSize.sm, maxHeight: 100, marginRight: 8, color: Colors.text
  },
  sendButton: {
    backgroundColor: Colors.primary, borderRadius: 8, paddingVertical: 10,
    paddingHorizontal: 16,
  },
  sendButtonDisabled: { backgroundColor: '#B0C4DE' },
  sendButtonText: { color: '#fff', fontWeight: '600' },
  leaveButton: { padding: 12, alignItems: 'center' },
  leaveText: { color: Colors.danger, fontSize: FontSize.sm },
})
