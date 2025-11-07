import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native'
import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

export default function FeedScreen() {
  const { profile } = useAuth()
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = async () => {
    setRefreshing(true)
    // TODO: Fetch posts
    setTimeout(() => setRefreshing(false), 1000)
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8B5CF6" />
      }
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {profile?.username}!</Text>
        <View style={styles.pointsContainer}>
          <Text style={styles.pointsLabel}>Points</Text>
          <Text style={styles.pointsValue}>{profile?.points || 0}</Text>
        </View>
      </View>

      <View style={styles.emptyState}>
        <Text style={styles.emptyStateText}>No posts yet</Text>
        <Text style={styles.emptyStateSubtext}>Be the first to share!</Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
})
