import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ScrollView, Alert } from 'react-native'
import { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { useAuth } from '../../contexts/AuthContext'

export default function CreateScreen() {
  const { profile } = useAuth()
  const [caption, setCaption] = useState('')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

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

  const handlePost = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Please select an image')
      return
    }

    setLoading(true)
    try {
      // TODO: Implement post creation
      Alert.alert('Success', 'Post created!')
      setSelectedImage(null)
      setCaption('')
    } catch (error: any) {
      Alert.alert('Error', error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {selectedImage ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: selectedImage }} style={styles.image} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => setSelectedImage(null)}
            >
              <Ionicons name="close-circle" size={32} color="#EF4444" />
            </TouchableOpacity>
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
          />
          <Text style={styles.characterCount}>{caption.length}/500</Text>
        </View>

        {selectedImage && (
          <TouchableOpacity
            style={[styles.postButton, loading && styles.postButtonDisabled]}
            onPress={handlePost}
            disabled={loading}
          >
            <Text style={styles.postButtonText}>
              {loading ? 'Posting...' : 'Share Post'}
            </Text>
          </TouchableOpacity>
        )}
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
  },
  postButtonDisabled: {
    opacity: 0.6,
  },
  postButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
})
