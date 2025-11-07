import { Stack } from 'expo-router'
import { AuthProvider } from '../contexts/AuthContext'
import { PaperProvider } from 'react-native-paper'
import { StatusBar } from 'expo-status-bar'

export default function RootLayout() {
  return (
    <PaperProvider>
      <AuthProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </AuthProvider>
    </PaperProvider>
  )
}
