import React from 'react'
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface Product {
  id: string
  name: string
  description: string
  points_cost: number
  image_url?: string
  quantity_available: number
}

interface ProductCardProps {
  product: Product
  userPoints: number
  onRedeem: (product: Product) => void
}

export default function ProductCard({ product, userPoints, onRedeem }: ProductCardProps) {
  const canAfford = userPoints >= product.points_cost
  const outOfStock = product.quantity_available <= 0

  return (
    <View style={styles.container}>
      {product.image_url ? (
        <Image source={{ uri: product.image_url }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Ionicons name="gift" size={48} color="#64748B" />
        </View>
      )}
      
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.description} numberOfLines={2}>{product.description}</Text>
        
        <View style={styles.footer}>
          <View style={styles.priceContainer}>
            <Ionicons name="star" size={18} color="#FCD34D" />
            <Text style={styles.price}>{product.points_cost}</Text>
          </View>
          
          <TouchableOpacity
            style={[
              styles.redeemButton,
              (!canAfford || outOfStock) && styles.redeemButtonDisabled
            ]}
            onPress={() => onRedeem(product)}
            disabled={!canAfford || outOfStock}
          >
            <Text style={styles.redeemButtonText}>
              {outOfStock ? 'Out of Stock' : canAfford ? 'Redeem' : 'Not Enough'}
            </Text>
          </TouchableOpacity>
        </View>

        {product.quantity_available <= 5 && product.quantity_available > 0 && (
          <Text style={styles.stockWarning}>Only {product.quantity_available} left!</Text>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: '#0F172A',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 16,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FCD34D',
  },
  redeemButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  redeemButtonDisabled: {
    backgroundColor: '#334155',
    opacity: 0.6,
  },
  redeemButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  stockWarning: {
    marginTop: 12,
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '500',
  },
})
