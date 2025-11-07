import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { useAuth } from '../../contexts/AuthContext'

export default function StoreScreen() {
  const { profile } = useAuth()

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Rewards Store</Text>
        <View style={styles.pointsContainer}>
          <Text style={styles.pointsLabel}>Your Points</Text>
          <Text style={styles.pointsValue}>{profile?.points || 0}</Text>
        </View>
      </View>

      <View style={styles.emptyState}>
        <Text style={styles.emptyStateText}>No products available</Text>
        <Text style={styles.emptyStateSubtext}>Check back soon!</Text>
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
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 16,
  },
  pointsContainer: {
    backgroundColor: '#1E293B',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  pointsLabel: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 4,
  },
  pointsValue: {
    fontSize: 36,
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
