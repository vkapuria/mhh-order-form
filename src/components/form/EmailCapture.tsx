'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import StepSummary from './StepSummary'
import { EnvelopeIcon, UserIcon, ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import type { ServiceType } from '@/types'

interface EmailCaptureProps {
  fullName: string
  email: string
  onChange: (field: string, value: string) => void
  onNext: () => void
  onBack: () => void
  serviceType?: ServiceType
}

export default function EmailCapture({
  fullName,
  email,
  onChange,
  onNext,
  onBack,
  serviceType,
}: EmailCaptureProps) {
  const [isEmailValid, setIsEmailValid] = useState(true)
  const mainFormRef = useRef<HTMLDivElement>(null)
  
  // 🎯 DELAYED AUTO-SCROLL FOR PROGRESS VISIBILITY
  useEffect(() => {
    if (mainFormRef.current) {
      setTimeout(() => {
        const element = mainFormRef.current
        if (!element) return
        
        const elementPosition = element.offsetTop - 20
        const startPosition = window.pageYOffset
        const distance = elementPosition - startPosition
        const duration = 800
        let start: number | null = null

        function animation(currentTime: number): void {
          if (start === null) start = currentTime
          const timeElapsed = currentTime - start
          const run = easeInOutCubic(timeElapsed, startPosition, distance, duration)
          window.scrollTo(0, run)
          if (timeElapsed < duration) requestAnimationFrame(animation)
        }

        function easeInOutCubic(t: number, b: number, c: number, d: number): number {
          t /= d / 2
          if (t < 1) return c / 2 * t * t * t + b
          t -= 2
          return c / 2 * (t * t * t + 2) + b
        }

        requestAnimationFrame(animation)
      }, 600) // 🎯 LONGER DELAY - Let user see green Step 1
    }
  }, [])

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
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Accordion Summary */}
      {serviceType && (
        <StepSummary
          stepNumber={1}
          title="Service Selected"
          data={[
            { label: 'Service', value: serviceType.charAt(0).toUpperCase() + serviceType.slice(1) }
          ]}
          onEdit={() => onBack()}
        />
      )}

      {/* 🎯 MAIN FORM CARD WITH AUTO-SCROLL REF */}
      <Card ref={mainFormRef} className="p-8 shadow-sm border-gray-200">
        {/* 🎯 LEFT-ALIGNED HEADER */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Who's this for?</h2>
          <p className="text-gray-600 text-base">Quick details so we can personalize your quote</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Name & Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Full Name */}
            <div>
            <Label
  htmlFor="fullName"
  className="text-base font-medium text-gray-700 flex items-center gap-2 mb-2"  // ← Changed
>
  <UserIcon className="w-5 h-5 text-gray-500" />  {/* ← Changed size */}
  Full Name
</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => onChange('fullName', e.target.value)}
                placeholder="Enter your full name"
                className="h-11 border-gray-400 focus:border-gray-500 rounded-xl focus:ring-0 focus-visible:ring-0"
                autoFocus
              />
              {/* 🎯 HELPFUL SUBTEXT */}
              <p className="text-xs text-gray-500 mt-1">We'll use this for your order confirmation.</p>
            </div>

            {/* Email */}
            <div>
            <Label
  htmlFor="email"  
  className="text-base font-medium text-gray-700 flex items-center gap-2 mb-2"  // ← Changed
>
  <EnvelopeIcon className="w-5 h-5 text-gray-500" />  {/* ← Changed size */}
  Email Address
</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                onBlur={() => email && setIsEmailValid(validateEmail(email))}
                placeholder="your.email@example.com"
                className={`h-11 border-gray-400 focus:border-gray-500 rounded-xl focus:ring-0 focus-visible:ring-0 ${
                  !isEmailValid ? 'border-red-500' : ''
                }`}
              />
              {!isEmailValid ? (
                <p className="mt-1 text-sm text-red-600">Please enter a valid email address</p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">We'll send updates and your completed work here.</p>
              )}
            </div>
          </div>

          {/* Navigation - CONSISTENT BUTTON STYLING */}
          <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between pt-6">
            <Button
              type="button"
              onClick={onBack}
              className="h-12 px-6 rounded-lg border-2 border-gray-900 bg-white text-gray-900 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 font-medium sm:w-auto w-full"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back
            </Button>
            <Button
              type="submit"
              disabled={!isValid}
              className="h-12 px-6 rounded-lg border-2 border-gray-900 bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-300 disabled:border-gray-300 disabled:text-gray-500 transition-colors flex items-center justify-center gap-2 font-medium sm:w-auto w-full"
            >
              Continue to Assignment Details
              <ArrowRightIcon className="w-4 h-4" />
            </Button>
          </div>

          {/* 🎯 HELPFUL "WHAT'S NEXT" TEXT */}
          <p className="text-xs text-gray-500 text-center">
            Next, you'll tell us about your assignment and deadline.
          </p>
        </form>
      </Card>
    </div>
  )
}