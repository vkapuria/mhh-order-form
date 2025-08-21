'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { EnvelopeIcon, UserIcon, ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline'

interface EmailCaptureProps {
  fullName: string
  email: string
  onChange: (field: string, value: string) => void
  onNext: () => void
  onBack: () => void
}

export default function EmailCapture({
  fullName,
  email,
  onChange,
  onNext,
  onBack,
}: EmailCaptureProps) {
  const [isEmailValid, setIsEmailValid] = useState(true)

  const validateEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim()) return
    const ok = validateEmail(email)
    setIsEmailValid(ok)
    if (!ok) return
    onNext()
  }

  const handleEmailChange = (val: string) => {
    onChange('email', val)
    if (!isEmailValid && val) setIsEmailValid(validateEmail(val))
  }

  const isValid = Boolean(fullName.trim() && email && validateEmail(email))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Get Your Instant Quote</h2>
        <p className="text-gray-600">Enter your details to receive your personalized quote</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name & Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Full Name */}
          <div>
            <Label
              htmlFor="fullName"
              className="text-sm font-medium text-gray-700 flex items-center mb-2"
            >
              <UserIcon className="w-4 h-4 mr-2 text-gray-500" />
              Full Name
            </Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => onChange('fullName', e.target.value)}
              placeholder="Enter your full name"
              autoFocus
            />
          </div>

          {/* Email */}
          <div>
            <Label
              htmlFor="email"
              className="text-sm font-medium text-gray-700 flex items-center mb-2"
            >
              <EnvelopeIcon className="w-4 h-4 mr-2 text-gray-500" />
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              onBlur={() => email && setIsEmailValid(validateEmail(email))}
              placeholder="your.email@example.com"
              className={!isEmailValid ? 'border-red-500 focus:ring-red-500' : ''}
            />
            {!isEmailValid && (
              <p className="mt-1 text-sm text-red-600">Please enter a valid email address</p>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
          <Button
            type="button"
            onClick={onBack}
            className="sm:w-auto w-full bg-white text-black border border-black hover:bg-gray-50 flex items-center justify-center gap-2"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back
          </Button>
          <Button 
            type="submit" 
            disabled={!isValid} 
            className="sm:w-auto w-full bg-black text-white hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500 flex items-center justify-center gap-2"
          >
            Continue to Assignment Details
            <ArrowRightIcon className="w-4 h-4" />
          </Button>
        </div>

        <p className="text-xs text-gray-500 text-center">
          🔒 We protect your privacy. No spam, ever.
        </p>
      </form>
    </div>
  )
}