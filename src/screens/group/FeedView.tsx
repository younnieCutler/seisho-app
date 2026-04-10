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
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme, FontFamily, FontSize, CommonStyles } from '../../utils/theme'
import { FeedPost } from '../../lib/feed'
import { getUserId, getNickname } from '../../lib/storage'

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
  const insets = useSafeAreaInsets()
  const { colors } = useTheme()
  const nickname = getNickname() ?? ''

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: colors.text }]}>나눔 피드</Text>
          <TouchableOpacity onPress={onLeave}>
            <Text style={[styles.leaveText, { color: colors.textMuted }]}>탈퇴</Text>
          </TouchableOpacity>
        </View>
        {isOffline && (
          <View style={[styles.offlineBanner, { backgroundColor: colors.accent + '22' }]}>
            <Text style={[styles.offlineText, { color: colors.primary }]}>오프라인 환경입니다</Text>
          </View>
        )}
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.postCard, { backgroundColor: colors.surface }, CommonStyles.shadow]}>
            <View style={styles.postHeader}>
              <Text style={[styles.postAuthor, { color: colors.primary }]}>
                {item.user_id === getUserId() ? `${nickname} (나)` : '성도님'}
              </Text>
              <Text style={[styles.postDate, { color: colors.textMuted }]}>{item.date}</Text>
            </View>
            <Text style={[styles.postContent, { color: colors.text }]}>{item.content}</Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>아직 나눔이 없습니다.{"\n"}첫 묵상을 나누어보세요.</Text>
          </View>
        }
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      />

      <View style={[
        styles.inputArea, 
        { 
          backgroundColor: colors.surface, 
          paddingBottom: insets.bottom + 16,
          borderTopColor: colors.border 
        }
      ]}>
        <View style={[styles.inputContainer, { backgroundColor: colors.background }]}>
          <TextInput
            style={[styles.postInput, { color: colors.text }]}
            value={postContent}
            onChangeText={setPostContent}
            placeholder="오늘의 묵상을 나누어주세요"
            placeholderTextColor={colors.textMuted}
            maxLength={1000}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendButton, 
              { backgroundColor: colors.primary },
              (!postContent.trim() || isOffline) && { opacity: 0.3 }
            ]}
            onPress={() => onSubmit(postContent)}
            disabled={!postContent.trim() || isOffline || isSaving}
          >
            <Text style={styles.sendButtonText}>{isSaving ? '...' : '✦'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontFamily: FontFamily.interfaceBold,
    fontSize: FontSize.lg,
  },
  leaveText: {
    fontFamily: FontFamily.interface,
    fontSize: FontSize.xs,
  },
  offlineBanner: {
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  offlineText: {
    fontFamily: FontFamily.interfaceBold,
    fontSize: FontSize.xxs,
  },
  listContent: {
    padding: 24,
  },
  postCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  postDate: { 
    fontFamily: FontFamily.interface,
    fontSize: FontSize.xxs, 
  },
  postContent: { 
    fontFamily: FontFamily.content,
    fontSize: FontSize.md, 
    lineHeight: 26,
  },
  postAuthor: { 
    fontFamily: FontFamily.interfaceBold,
    fontSize: FontSize.xs, 
  },
  emptyContainer: {
    marginTop: 80,
    alignItems: 'center',
  },
  emptyText: { 
    textAlign: 'center', 
    fontFamily: FontFamily.interface,
    fontSize: FontSize.sm,
    lineHeight: 22,
  },
  inputArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  postInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
    fontSize: FontSize.md,
    fontFamily: FontFamily.interface,
    maxHeight: 120,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
    marginLeft: 8,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
})

