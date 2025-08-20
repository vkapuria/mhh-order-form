'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import { EnhancedPricingData } from '@/types'

interface PricingNotificationsProps {
  pricing: EnhancedPricingData | null
  previousPricing: EnhancedPricingData | null
}

export default function PricingNotifications({ 
  pricing, 
  previousPricing 
}: PricingNotificationsProps) {
  const [notifications, setNotifications] = useState<Array<{
    id: string
    type: 'savings' | 'rush' | 'discount'
    message: string
    amount?: number
  }>>([])

  useEffect(() => {
    if (!pricing || !previousPricing) return

    const newNotifications: typeof notifications = []

    // Check for savings increase
    if (pricing.savings > previousPricing.savings) {
      const increase = pricing.savings - previousPricing.savings
      newNotifications.push({
        id: `savings-${Date.now()}`,
        type: 'savings',
        message: `🎉 You're now saving an extra $${increase.toFixed(2)}!`,
        amount: increase
      })
    }

    // Check for rush fee addition
    if (pricing.rushFee > 0 && previousPricing.rushFee === 0) {
      newNotifications.push({
        id: `rush-${Date.now()}`,
        type: 'rush',
        message: `⚡ Rush fee added: +$${pricing.rushFee.toFixed(2)}`,
        amount: pricing.rushFee
      })
    }

    // Check for new discount tier
    if (pricing.discountTier && pricing.discountTier !== previousPricing.discountTier) {
      newNotifications.push({
        id: `discount-${Date.now()}`,
        type: 'discount',
        message: `🏆 Unlocked ${pricing.discountTier} discount!`,
      })
    }

    if (newNotifications.length > 0) {
      setNotifications(prev => [...prev, ...newNotifications])
      
      // Auto-remove after 5 seconds
      setTimeout(() => {
        setNotifications(prev => 
          prev.filter(n => !newNotifications.find(nn => nn.id === n.id))
        )
      }, 5000)
    }
  }, [pricing, previousPricing])

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map(notification => (
        <Card 
          key={notification.id}
          className={`p-3 shadow-lg border-l-4 ${
            notification.type === 'savings' ? 'border-green-500 bg-green-50' :
            notification.type === 'rush' ? 'border-yellow-500 bg-yellow-50' :
            'border-blue-500 bg-blue-50'
          } animate-slide-in-right`}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{notification.message}</p>
            <button 
              onClick={() => removeNotification(notification.id)}
              className="ml-2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </Card>
      ))}
    </div>
  )
}