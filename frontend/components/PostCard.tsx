import React, { useState } from 'react'
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { formatDistanceToNow } from 'date-fns'

interface Post {
  id: string
  user_id: string
  caption: string
  media_url: string
  media_type: string
  created_at: string
  username: string
  avatar_url?: string
  like_count: number
  comment_count: number
  is_liked: boolean
}

interface PostCardProps {
  post: Post
  onLike: (postId: string) => Promise<void>
  onComment: (postId: string) => void
  onReport: (postId: string) => void
}

export default function PostCard({ post, onLike, onComment, onReport }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.is_liked)
  const [likeCount, setLikeCount] = useState(post.like_count)
  const [isLiking, setIsLiking] = useState(false)

  const handleLike = async () => {
    if (isLiking) return
    
    setIsLiking(true)
    const previousLiked = isLiked
    const previousCount = likeCount

    // Optimistic update
    setIsLiked(!isLiked)
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1)

    try {
      await onLike(post.id)
    } catch (error) {
      // Revert on error
      setIsLiked(previousLiked)
      setLikeCount(previousCount)
      Alert.alert('Error', 'Failed to like post')
    } finally {
      setIsLiking(false)
    }
  }

  const handleReport = () => {
    Alert.alert(
      'Report Post',
      'Are you sure you want to report this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Report', style: 'destructive', onPress: () => onReport(post.id) }
      ]
    )
  }

  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true })

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          {post.avatar_url ? (
            <Image source={{ uri: post.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={20} color="#64748B" />
            </View>
          )}
          <View>
            <Text style={styles.username}>{post.username}</Text>
            <Text style={styles.timestamp}>{timeAgo}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleReport}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      {/* Media */}
      <Image 
        source={{ uri: post.media_url }} 
        style={styles.media}
        resizeMode="cover"
      />

      {/* Actions */}
      <View style={styles.actions}>
        <View style={styles.leftActions}>
          <TouchableOpacity 
            onPress={handleLike} 
            style={styles.actionButton}
            disabled={isLiking}
          >
            <Ionicons 
              name={isLiked ? "heart" : "heart-outline"} 
              size={28} 
              color={isLiked ? "#EF4444" : "#F8FAFC"} 
            />
            <Text style={styles.actionCount}>{likeCount}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => onComment(post.id)} 
            style={styles.actionButton}
          >
            <Ionicons name="chatbubble-outline" size={26} color="#F8FAFC" />
            <Text style={styles.actionCount}>{post.comment_count}</Text>
          </TouchableOpacity>
        </View>

        {isLiked && (
          <View style={styles.pointsBadge}>
            <Ionicons name="star" size={16} color="#FCD34D" />
            <Text style={styles.pointsText}>+1</Text>
          </View>
        )}
      </View>

      {/* Caption */}
      {post.caption && (
        <View style={styles.captionContainer}>
          <Text style={styles.username}>{post.username}</Text>
          <Text style={styles.caption}> {post.caption}</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E293B',
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  avatarPlaceholder: {
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  timestamp: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  media: {
    width: '100%',
    height: 400,
    backgroundColor: '#0F172A',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  leftActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  pointsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FCD34D',
  },
  captionContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  caption: {
    fontSize: 14,
    color: '#E2E8F0',
    flex: 1,
  },
})
