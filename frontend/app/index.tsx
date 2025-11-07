import { useEffect } from 'react'
import { useRouter, useSegments } from 'expo-router'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { useAuth } from '../contexts/AuthContext'

export default function Index() {
  const { session, isLoading } = useAuth()
  const router = useRouter()
  const segments = useSegments()

  useEffect(() => {
    if (isLoading) return

    const inAuthGroup = segments[0] === '(auth)'
    const inTabsGroup = segments[0] === '(tabs)'

    if (session && !inTabsGroup) {
      // User is signed in, redirect to tabs
      router.replace('/(tabs)/feed')
    } else if (!session && !inAuthGroup) {
      // User is not signed in, redirect to login
      router.replace('/(auth)/login')
    }
  }, [session, isLoading, segments])

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#6B46C1" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
})
