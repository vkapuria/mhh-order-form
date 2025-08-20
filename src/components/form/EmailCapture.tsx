'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { EnvelopeIcon } from '@heroicons/react/24/outline'

interface EmailCaptureProps {
  email: string
  onChange: (email: string) => void
  onNext: () => void
}

export default function EmailCapture({ email, onChange, onNext }: EmailCaptureProps) {
  const [isValid, setIsValid] = useState(true)
  
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !validateEmail(email)) {
      setIsValid(false)
      return
    }
    
    setIsValid(true)
    onNext()
  }
  
  const handleEmailChange = (value: string) => {
    onChange(value)
    if (!isValid && value) {
      setIsValid(validateEmail(value))
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <EnvelopeIcon className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Get Your Instant Quote
        </h2>
        <p className="text-gray-600">
          Enter your email to receive your personalized quote and save your progress
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            placeholder="your.email@example.com"
            className={`mt-1 ${!isValid ? 'border-red-500 focus:ring-red-500' : ''}`}
            autoFocus
          />
          {!isValid && (
            <p className="mt-1 text-sm text-red-600">
              Please enter a valid email address
            </p>
          )}
        </div>

        <Button 
          type="submit" 
          className="w-full"
          disabled={!email}
        >
          Continue to Assignment Details
        </Button>
        
        <p className="text-xs text-gray-500 text-center">
          🔒 We protect your privacy. No spam, ever.
        </p>
      </form>
    </div>
  )
}