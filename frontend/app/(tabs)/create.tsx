import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ScrollView, Alert, ActivityIndicator } from 'react-native'
import { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'expo-router'
import { decode } from 'base64-arraybuffer'
import * as FileSystem from 'expo-file-system'

export default function CreateScreen() {
  const { profile, session } = useAuth()
  const router = useRouter()
  const [caption, setCaption] = useState('')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    })

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri)
    }
  }

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera permissions')
      return
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    })

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri)
    }
  }

  const uploadImage = async (uri: string): Promise<string> => {
    try {
      // Read file as base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      })

      // Generate unique filename
      const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg'
      const fileName = `${session?.user.id}/${Date.now()}.${fileExt}`
      const filePath = `posts/${fileName}`

      setUploadProgress(30)

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('media')
        .upload(filePath, decode(base64), {
          contentType: `image/${fileExt}`,
          upsert: false
        })

      if (error) {
        console.error('Storage upload error:', error)
        // Fallback to base64 if storage fails
        return `data:image/${fileExt};base64,${base64}`
      }

      setUploadProgress(70)

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('media')
        .getPublicUrl(data.path)

      setUploadProgress(100)

      return publicUrlData.publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      throw error
    }
  }

  const handlePost = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Please select an image')
      return
    }

    if (!session) {
      Alert.alert('Error', 'You must be logged in to post')
      return
    }

    setLoading(true)
    setUploadProgress(0)

    try {
      // Upload image
      const mediaUrl = await uploadImage(selectedImage)

      // Create post
      const { error } = await supabase
        .from('posts')
        .insert({
          user_id: session.user.id,
          caption: caption.trim() || null,
          media_url: mediaUrl,
          media_type: 'photo',
          visibility: 'public'
        })

      if (error) throw error

      // Award points for posting (5 points)
      const { data: profileData } = await supabase
        .from('profiles')
        .select('points')
        .eq('id', session.user.id)
        .single()

      if (profileData) {
        await supabase
          .from('profiles')
          .update({ points: (profileData.points || 0) + 5 })
          .eq('id', session.user.id)

        // Record transaction
        await supabase
          .from('points_transactions')
          .insert({
            user_id: session.user.id,
            amount: 5,
            reason: 'Created post'
          })
      }

      Alert.alert('Success!', 'Your post has been shared! (+5 points)', [
        {
          text: 'OK',
          onPress: () => {
            setSelectedImage(null)
            setCaption('')
            router.push('/(tabs)/feed')
          }
        }
      ])
    } catch (error: any) {
      console.error('Error creating post:', error)
      Alert.alert('Error', error.message || 'Failed to create post')
    } finally {
      setLoading(false)
      setUploadProgress(0)
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {selectedImage ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: selectedImage }} style={styles.image} />
            {!loading && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => setSelectedImage(null)}
              >
                <Ionicons name="close-circle" size={32} color="#EF4444" />
              </TouchableOpacity>
            )}
            {loading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#8B5CF6" />
                <Text style={styles.loadingText}>
                  {uploadProgress < 100 ? `Uploading... ${uploadProgress}%` : 'Creating post...'}
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.uploadSection}>
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
              <Ionicons name="images" size={48} color="#8B5CF6" />
              <Text style={styles.uploadButtonText}>Choose from Library</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.uploadButton} onPress={takePhoto}>
              <Ionicons name="camera" size={48} color="#8B5CF6" />
              <Text style={styles.uploadButtonText}>Take Photo</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.captionContainer}>
          <TextInput
            style={styles.captionInput}
            placeholder="Write a caption..."
            placeholderTextColor="#64748B"
            value={caption}
            onChangeText={setCaption}
            multiline
            maxLength={500}
            editable={!loading}
          />
          <Text style={styles.characterCount}>{caption.length}/500</Text>
        </View>

        {selectedImage && (
          <TouchableOpacity
            style={[styles.postButton, loading && styles.postButtonDisabled]}
            onPress={handlePost}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="paper-plane" size={20} color="#fff" />
                <Text style={styles.postButtonText}>Share Post</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        <View style={styles.tipContainer}>
          <Ionicons name="information-circle" size={20} color="#8B5CF6" />
          <Text style={styles.tipText}>Earn 5 points for every post!</Text>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    padding: 20,
  },
  uploadSection: {
    gap: 16,
  },
  uploadButton: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#334155',
    borderStyle: 'dashed',
  },
  uploadButtonText: {
    marginTop: 12,
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '600',
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 12,
  },
  removeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#1E293B',
    borderRadius: 16,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
  },
  captionContainer: {
    marginTop: 20,
  },
  captionInput: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#F8FAFC',
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#334155',
  },
  characterCount: {
    marginTop: 8,
    fontSize: 12,
    color: '#64748B',
    textAlign: 'right',
  },
  postButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  postButtonDisabled: {
    opacity: 0.6,
  },
  postButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    padding: 16,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  tipText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
  },
})
