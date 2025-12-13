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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email')
      return
    }

    setLoading(true)
    try {
      await signInWithOTP(email)
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
      setOtp('')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setLoading(true)
    try {
      await signInWithOTP(email)
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
            {step === 'otp' ? 'Enter Code' : 'Welcome Back'}
          </Text>
          <Text style={styles.subtitle}>
            {step === 'otp'
              ? `We sent a 6-digit code to ${email}`
              : 'Sign in to continue'}
          </Text>
        </View>

        <View style={styles.form}>
          {step === 'email' && (
            <>
              {/* Toggle between Password and OTP */}
              <View style={styles.modeToggle}>
                <TouchableOpacity
                  style={[styles.modeButton, mode === 'otp' && styles.modeButtonActive]}
                  onPress={() => setMode('otp')}
                >
                  <Text style={[styles.modeButtonText, mode === 'otp' && styles.modeButtonTextActive]}>
                    Email Code
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modeButton, mode === 'password' && styles.modeButtonActive]}
                  onPress={() => setMode('password')}
                >
                  <Text style={[styles.modeButtonText, mode === 'password' && styles.modeButtonTextActive]}>
                    Password
                  </Text>
                </TouchableOpacity>
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

              {mode === 'password' && (
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#64748B"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    editable={!loading}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={20}
                      color="#94A3B8"
                    />
                  </TouchableOpacity>
                </View>
              )}

              {mode === 'password' && (
                <TouchableOpacity
                  style={styles.forgotPassword}
                  onPress={() => router.push('/(auth)/forgot-password')}
                >
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={mode === 'password' ? handlePasswordLogin : handleSendOTP}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>
                    {mode === 'password' ? 'Sign In' : 'Send Code'}
                  </Text>
                )}
              </TouchableOpacity>

              {mode === 'otp' && (
                <View style={styles.infoBox}>
                  <Ionicons name="information-circle" size={20} color="#8B5CF6" />
                  <Text style={styles.infoText}>
                    We'll send a 6-digit code to your email for secure sign in
                  </Text>
                </View>
              )}
            </>
          )}

          {step === 'otp' && (
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
                  <Text style={styles.buttonText}>Verify & Sign In</Text>
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

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <Text style={styles.signupLink}>Sign Up</Text>
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
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  modeButtonActive: {
    backgroundColor: '#8B5CF6',
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
  },
  modeButtonTextActive: {
    color: '#fff',
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
  eyeIcon: {
    padding: 16,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#A78BFA',
    fontSize: 14,
    fontWeight: '600',
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
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  signupLink: {
    color: '#A78BFA',
    fontSize: 14,
    fontWeight: '600',
  },
})


