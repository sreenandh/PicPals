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

export default function SignupScreen() {
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUpWithOTP, verifyOTP, user, session } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && session) {
      router.replace('/(tabs)/feed') // Adjust to your app's home route
    }
  }, [user, session])

  const handleSendOTP = async () => {
    if (!username || !email) {
      Alert.alert('Error', 'Please enter both username and email')
      return
    }

    if (username.length < 3) {
      Alert.alert('Error', 'Username must be at least 3 characters')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email')
      return
    }

    setLoading(true)
    try {
      await signUpWithOTP(email, username)
      setStep('otp')
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit code')
      return
    }

    setLoading(true)
    try {
      await verifyOTP(email, otp)
      // Navigation happens via useEffect above
    } catch (error) {
      console.error(error)
      setOtp('') // Clear OTP on error
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setLoading(true)
    try {
      await signUpWithOTP(email, username)
      Alert.alert('Success', 'New code sent to your email!')
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (step === 'otp') {
              setStep('email')
              setOtp('')
            } else {
              router.back()
            }
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#A78BFA" />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>
            {step === 'email' ? 'Create Account' : 'Enter Code'}
          </Text>
          <Text style={styles.subtitle}>
            {step === 'email' 
              ? 'Join PicPals today' 
              : `We sent a 6-digit code to ${email}`}
          </Text>
        </View>

        <View style={styles.form}>
          {step === 'email' ? (
            <>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Username"
                  placeholderTextColor="#64748B"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#64748B"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!loading}
                />
              </View>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSendOTP}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Send Code</Text>
                )}
              </TouchableOpacity>

              <View style={styles.infoBox}>
                <Ionicons name="information-circle" size={20} color="#8B5CF6" />
                <Text style={styles.infoText}>
                  We'll send a 6-digit code to your email for secure sign up
                </Text>
              </View>
            </>
          ) : (
            <>
              <View style={styles.otpContainer}>
                <TextInput
                  style={styles.otpInput}
                  placeholder="000000"
                  placeholderTextColor="#64748B"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  maxLength={6}
                  editable={!loading}
                  autoFocus
                />
              </View>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleVerifyOTP}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Verify & Sign Up</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resendButton}
                onPress={handleResendOTP}
                disabled={loading}
              >
                <Text style={styles.resendText}>Didn't receive code? Resend</Text>
              </TouchableOpacity>
            </>
          )}

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
  },
  backButton: {
    marginBottom: 24,
  },
  header: {
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    lineHeight: 22,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  inputIcon: {
    marginLeft: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#F8FAFC',
  },
  otpContainer: {
    marginBottom: 24,
  },
  otpInput: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 24,
    fontSize: 32,
    color: '#F8FAFC',
    textAlign: 'center',
    letterSpacing: 8,
    fontWeight: 'bold',
    borderWidth: 2,
    borderColor: '#8B5CF6',
  },
  button: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
  },
  resendButton: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  resendText: {
    color: '#A78BFA',
    fontSize: 14,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  loginLink: {
    color: '#A78BFA',
    fontSize: 14,
    fontWeight: '600',
  },
})
