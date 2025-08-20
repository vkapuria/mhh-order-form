'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { XMarkIcon, EnvelopeIcon, ClockIcon, TagIcon } from '@heroicons/react/24/outline' // Fixed imports

interface ExitIntentModalProps {
  isOpen: boolean
  onClose: () => void
  onSaveProgress: (email: string) => void
  currentEmail?: string
  currentStep: string
  hasDiscount?: boolean
}

export default function ExitIntentModal({
  isOpen,
  onClose,
  onSaveProgress,
  currentEmail,
  currentStep,
  hasDiscount = false
}: ExitIntentModalProps) {
  const [email, setEmail] = useState(currentEmail || '')
  const [isSaving, setIsSaving] = useState(false)

  if (!isOpen) return null

  const handleSaveProgress = async () => {
    if (!email) return
    
    setIsSaving(true)
    try {
      await onSaveProgress(email)
      onClose()
    } catch (error) {
      console.error('Failed to save progress:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const getStepMessage = () => {
    switch (currentStep) {
      case 'service':
        return "You've started selecting your service"
      case 'contact':
        return "You're just getting started"
      case 'assignment':
        return "You're halfway through your order"
      case 'details':
        return "You're almost done!"
      default:
        return "Don't lose your progress"
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="w-5 h-5" /> {/* Fixed: X -> XMarkIcon */}
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <EnvelopeIcon className="w-8 h-8 text-blue-600" /> {/* Fixed: Mail -> EnvelopeIcon */}
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Wait! Don't lose your progress
          </h2>
          <p className="text-gray-600 text-sm">
            {getStepMessage()}. Save your progress and we'll send you a secure link to continue anytime.
          </p>
        </div>

        {/* Special offer for exit intent */}
        {hasDiscount && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2">
              <TagIcon className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-green-800">
                🎉 Special Offer: Save an extra 5% if you complete today!
              </span>
            </div>
          </div>
        )}

        {/* Benefits */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <ClockIcon className="w-4 h-4 text-blue-500" />
            <span>Continue exactly where you left off</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <EnvelopeIcon className="w-4 h-4 text-blue-500" />
            <span>Get price reminders and assignment tips</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <TagIcon className="w-4 h-4 text-blue-500" />
            <span>Lock in current pricing and discounts</span>
          </div>
        </div>

        {/* Email input */}
        <div className="space-y-3 mb-6">
          <Label htmlFor="exit-email" className="text-sm font-medium">
            Email Address
          </Label>
          <Input
            id="exit-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email to save progress"
            disabled={!!currentEmail}
          />
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button 
            onClick={handleSaveProgress}
            disabled={!email || isSaving}
            className="w-full"
          >
            {isSaving ? 'Saving...' : '✉️ Save My Progress'}
          </Button>
          
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="w-full text-gray-600"
          >
            No thanks, I'll continue now
          </Button>
        </div>

        {/* Trust signals */}
        <div className="text-center mt-4 text-xs text-gray-500">
          🔒 We never spam. Your email is safe with us.
        </div>
      </Card>
    </div>
  )
}