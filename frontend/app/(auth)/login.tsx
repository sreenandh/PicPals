import { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { useAuth } from '../../contexts/AuthContext'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

export default function LoginScreen() {
  const [mode, setMode] = useState<'password' | 'otp'>('otp') // Default to OTP
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signIn, signInWithOTP, verifyOTP, user, session } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && session) {
      router.replace('/(tabs)/feed') // Adjust to your app's home route
    }
  }, [user, session])

  const handlePasswordLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password')
      return
    }

    setLoading(true)
    try {
      await signIn(email, password)
      // Navigation happens via useEffect above
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendOTP = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email')
      return
    }

    const emailRegex = /^[^\s@]+@[^\