import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, Modal, TextInput, TouchableOpacity } from 'react-native'
import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import ProductCard from '../../components/ProductCard'
import { Ionicons } from '@expo/vector-icons'

interface Product {
  id: string
  name: string
  description: string
  points_cost: number
  image_url?: string
  quantity_available: number
}

export default function StoreScreen() {
  const { profile, session } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [shippingAddress, setShippingAddress] = useState('')
  const [redeeming, setRedeeming] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('points_cost', { ascending: true })

      if (error) throw error

      setProducts(data || [])
    } catch (error: any) {
      console.error('Error fetching products:', error)
      Alert.alert('Error', 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleRedeem = (product: Product) => {
    if (!profile || profile.points < product.points_cost) {
      Alert.alert('Insufficient Points', `You need ${product.points_cost - (profile?.points || 0)} more points to redeem this item.`)
      return
    }

    setSelectedProduct(product)
  }

  const confirmRedemption = async () => {
    if (!selectedProduct || !session) return

    if (!shippingAddress.trim()) {
      Alert.alert('Error', 'Please enter a shipping address')
      return
    }

    setRedeeming(true)

    try {
      // Create redemption
      const { error: redemptionError } = await supabase
        .from('redemptions')
        .insert({
          user_id: session.user.id,
          product_id: selectedProduct.id,
          points_spent: selectedProduct.points_cost,
          shipping_address: shippingAddress,
          status: 'pending'
        })

      if (redemptionError) throw redemptionError

      // Deduct points
      const newPoints = (profile?.points || 0) - selectedProduct.points_cost
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ points: newPoints })
        .eq('id', session.user.id)

      if (updateError) throw updateError

      // Record transaction
      await supabase
        .from('points_transactions')
        .insert({
          user_id: session.user.id,
          amount: -selectedProduct.points_cost,
          reason: `Redeemed ${selectedProduct.name}`
        })

      Alert.alert(
        'Success!',
        `You have successfully redeemed ${selectedProduct.name}! Our team will process your order soon.`,
        [
          {
            text: 'OK',
            onPress: () => {
              setSelectedProduct(null)
              setShippingAddress('')
              fetchProducts() // Refresh products
            }
          }
        ]
      )
    } catch (error: any) {
      console.error('Error redeeming product:', error)
      Alert.alert('Error', 'Failed to redeem product. Please try again.')
    } finally {
      setRedeeming(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    )
  }

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Rewards Store</Text>
          <View style={styles.pointsContainer}>
            <Ionicons name="star" size={24} color="#FCD34D" />
            <View>
              <Text style={styles.pointsLabel}>Your Points</Text>
              <Text style={styles.pointsValue}>{profile?.points || 0}</Text>
            </View>
          </View>
        </View>

        <View style={styles.productsContainer}>
          {products.length > 0 ? (
            products.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                userPoints={profile?.points || 0}
                onRedeem={handleRedeem}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="gift-outline" size={64} color="#64748B" />
              <Text style={styles.emptyStateText}>No products available</Text>
              <Text style={styles.emptyStateSubtext}>Check back soon for rewards!</Text>
            </View>
          )}
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#8B5CF6" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>How to Earn Points</Text>
            <Text style={styles.infoText}>• Create a post: +5 points</Text>
            <Text style={styles.infoText}>• Like others' posts: +1 point</Text>
            <Text style={styles.infoText}>• Receive likes: +1 point</Text>
          </View>
        </View>
      </ScrollView>

      {/* Redemption Modal */}
      <Modal
        visible={!!selectedProduct}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedProduct(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setSelectedProduct(null)}
            >
              <Ionicons name="close" size={28} color="#94A3B8" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Confirm Redemption</Text>
            
            {selectedProduct && (
              <View style={styles.productSummary}>
                <Text style={styles.productName}>{selectedProduct.name}</Text>
                <View style={styles.pointsCost}>
                  <Ionicons name="star" size={20} color="#FCD34D" />
                  <Text style={styles.pointsCostText}>{selectedProduct.points_cost} points</Text>
                </View>
              </View>
            )}

            <Text style={styles.inputLabel}>Shipping Address</Text>
            <TextInput
              style={styles.addressInput}
              placeholder="Enter your full address..."
              placeholderTextColor="#64748B"
              value={shippingAddress}
              onChangeText={setShippingAddress}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[styles.confirmButton, redeeming && styles.confirmButtonDisabled]}
              onPress={confirmRedemption}
              disabled={redeeming}
            >
              {redeeming ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.confirmButtonText}>Confirm Redemption</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.modalNote}>
              Note: Our team will review and process your order within 3-5 business days.
            </Text>
          </View>
        </View>
      </Modal>
    </>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  pointsLabel: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 4,
  },
  pointsValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  productsContainer: {
    padding: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#64748B',
  },
  infoCard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 16,
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 400,
  },
  modalClose: {
    alignSelf: 'flex-end',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 20,
  },
  productSummary: {
    backgroundColor: '#0F172A',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  pointsCost: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pointsCostText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FCD34D',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 8,
  },
  addressInput: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#F8FAFC',
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 20,
  },
  confirmButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  modalNote: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    fontStyle: 'italic',
  },
})
