import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator, Alert } from 'react-native'
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import PostCard from '../../components/PostCard'
import { supabase } from '../../lib/supabase'

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

export default function FeedScreen() {
  const { profile, session } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  const fetchPosts = async (pageNum: number = 0, isRefresh: boolean = false) => {
    if (!session) return

    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          user_id,
          caption,
          media_url,
          media_type,
          created_at,
          profiles!posts_user_id_fkey (username, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .range(pageNum * 20, (pageNum * 20) + 19)

      if (error) throw error

      // Transform data to include username and avatar_url at top level
      const transformedPosts = await Promise.all(
        (data || []).map(async (post: any) => {
          // Get like count
          const { count: likeCount } = await supabase
            .from('likes')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id)

          // Check if current user liked
          const { data: userLike } = await supabase
            .from('likes')
            .select('id')
            .eq('post_id', post.id)
            .eq('user_id', session.user.id)
            .single()

          // Get comment count
          const { count: commentCount } = await supabase
            .from('comments')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id)

          return {
            id: post.id,
            user_id: post.user_id,
            caption: post.caption,
            media_url: post.media_url,
            media_type: post.media_type,
            created_at: post.created_at,
            username: post.profiles?.username || 'Unknown',
            avatar_url: post.profiles?.avatar_url,
            like_count: likeCount || 0,
            comment_count: commentCount || 0,
            is_liked: !!userLike,
          }
        })
      )

      if (isRefresh) {
        setPosts(transformedPosts)
      } else {
        setPosts(prev => [...prev, ...transformedPosts])
      }

      setHasMore(transformedPosts.length === 20)
    } catch (error: any) {
      console.error('Error fetching posts:', error)
      Alert.alert('Error', 'Failed to load posts')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchPosts(0)
  }, [session])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    setPage(0)
    await fetchPosts(0, true)
  }, [session])

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchPosts(nextPage)
    }
  }

  const handleLike = async (postId: string) => {
    if (!session) return

    try {
      const { error } = await supabase.rpc('toggle_like', {
        p_post_id: postId,
        p_user_id: session.user.id
      })

      if (error) {
        // Fallback to direct toggle
        const { data: existingLike } = await supabase
          .from('likes')
          .select('id')
          .eq('post_id', postId)
          .eq('user_id', session.user.id)
          .single()

        if (existingLike) {
          await supabase.from('likes').delete().eq('id', existingLike.id)
        } else {
          await supabase.from('likes').insert({
            post_id: postId,
            user_id: session.user.id
          })
        }
      }

      // Update local state
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            is_liked: !post.is_liked,
            like_count: post.is_liked ? post.like_count - 1 : post.like_count + 1
          }
        }
        return post
      }))
    } catch (error: any) {
      console.error('Error liking post:', error)
      throw error
    }
  }

  const handleComment = (postId: string) => {
    Alert.alert('Comments', 'Comment feature coming soon!')
  }

  const handleReport = async (postId: string) => {
    if (!session) return

    try {
      const { error } = await supabase
        .from('reports')
        .insert({
          reporter_id: session.user.id,
          post_id: postId,
          reason: 'inappropriate_content',
          description: 'Reported from mobile app'
        })

      if (error) throw error

      Alert.alert('Success', 'Post reported. Our team will review it.')
    } catch (error: any) {
      console.error('Error reporting post:', error)
      Alert.alert('Error', 'Failed to report post')
    }
  }

  if (loading && posts.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {profile?.username}!</Text>
        <View style={styles.pointsContainer}>
          <Text style={styles.pointsLabel}>Points</Text>
          <Text style={styles.pointsValue}>{profile?.points || 0}</Text>
        </View>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onLike={handleLike}
            onComment={handleComment}
            onReport={handleReport}
          />
        )}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor="#8B5CF6" 
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No posts yet</Text>
            <Text style={styles.emptyStateSubtext}>Be the first to share!</Text>
          </View>
        }
        ListFooterComponent={
          loading && posts.length > 0 ? (
            <ActivityIndicator size="small" color="#8B5CF6" style={styles.loader} />
          ) : null
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  pointsContainer: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  pointsLabel: {
    fontSize: 12,
    color: '#94A3B8',
  },
  pointsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  listContent: {
    padding: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#64748B',
  },
  loader: {
    marginVertical: 20,
  },
})
