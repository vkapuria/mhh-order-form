'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import StepSummary from './StepSummary'
import { EnvelopeIcon, UserIcon, ArrowLeftIcon, ArrowRightIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import type { ServiceType } from '@/types'

interface EmailCaptureProps {
  fullName: string
  email: string
  onChange: (field: string, value: string) => void
  onNext: () => void
  onBack: () => void
  serviceType?: ServiceType
}

interface ValidationErrors {
  fullName?: string
  email?: string
}

interface ValidationState {
  fullName: 'idle' | 'validating' | 'valid' | 'invalid'
  email: 'idle' | 'validating' | 'valid' | 'invalid'
}

export default function EmailCapture({
  fullName,
  email,
  onChange,
  onNext,
  onBack,
  serviceType,
}: EmailCaptureProps) {
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [validationState, setValidationState] = useState<ValidationState>({
    fullName: 'idle',
    email: 'idle'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [touched, setTouched] = useState({ fullName: false, email: false })
  
  const mainFormRef = useRef<HTMLDivElement>(null)
  const emailTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const nameTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Enhanced email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

  // 🎯 MUCH MORE RESPECTFUL Name validation - minimal and inclusive
  const validateName = (name: string): string | null => {
    const trimmed = name.trim()
    
    // Only check for basic presence and reasonable length
    if (!trimmed) return 'Name is required'
    if (trimmed.length < 1) return 'Please enter your name'
    if (trimmed.length > 100) return 'Name is too long (maximum 100 characters)'
    
    // Only filter out obvious data entry mistakes - NOT cultural differences
    // Allow: letters, spaces, hyphens, apostrophes, periods, numbers (for Jr., III), accented characters
    if (!/^[\p{L}\p{M}\s\-'.0-9]+$/u.test(trimmed)) {
      return 'Name contains invalid characters'
    }
    
    // Check for obvious mistakes like dates or email addresses
    if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/.test(trimmed)) {
      return 'This looks like a date - please enter your name'
    }
    if (/@/.test(trimmed)) {
      return 'This looks like an email - please enter your name'
    }
    
    return null
  }

  // Email validation - keep this robust
  const validateEmail = (emailValue: string): string | null => {
    const trimmed = emailValue.trim().toLowerCase()
    if (!trimmed) return 'Email address is required'
    if (trimmed.length > 254) return 'Email address is too long'
    if (!emailRegex.test(trimmed)) return 'Please enter a valid email address'
    
    // Additional checks for common mistakes
    if (trimmed.endsWith('.')) return 'Email cannot end with a period'
    if (trimmed.includes('..')) return 'Email cannot contain consecutive periods'
    if (trimmed.startsWith('.') || trimmed.startsWith('@')) return 'Email format is incorrect'
    
    return null
  }

  // Real-time name validation with debounce
  const handleNameChange = (value: string) => {
    onChange('fullName', value)
    // Only clear errors if user is actively fixing them
    if (errors.fullName) {
      setErrors(prev => ({ ...prev, fullName: undefined }))
      setValidationState(prev => ({ ...prev, fullName: 'idle' }))
    }
  }

  // Real-time email validation with debounce
  const handleEmailChange = (value: string) => {
    onChange('email', value)
    // Only clear errors if user is actively fixing them
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: undefined }))
      setValidationState(prev => ({ ...prev, email: 'idle' }))
    }
  }
  
  const handleEmailBlur = () => {
    if (!email.trim()) return
    
    setTouched(prev => ({ ...prev, email: true }))
    const error = validateEmail(email)
    setErrors(prev => ({ ...prev, email: error || undefined }))
    setValidationState(prev => ({ 
      ...prev, 
      email: error ? 'invalid' : 'valid' 
    }))
  }

  const handleNameBlur = () => {
    if (!fullName.trim()) return
    
    setTouched(prev => ({ ...prev, fullName: true }))
    const error = validateName(fullName)
    setErrors(prev => ({ ...prev, fullName: error || undefined }))
    setValidationState(prev => ({ 
      ...prev, 
      fullName: error ? 'invalid' : 'valid' 
    }))
  }

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    setTouched({ fullName: true, email: true })

    const nameError = validateName(fullName)
    const emailError = validateEmail(email)

    setErrors({
      fullName: nameError || undefined,
      email: emailError || undefined
    })

    setValidationState({
      fullName: nameError ? 'invalid' : 'valid',
      email: emailError ? 'invalid' : 'valid'
    })

    if (!nameError && !emailError) {
      try {
        await new Promise(resolve => setTimeout(resolve, 200))
        onNext()
      } catch (error) {
        console.error('Form submission error:', error)
      }
    }

    setIsSubmitting(false)
  }

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (emailTimeoutRef.current) clearTimeout(emailTimeoutRef.current)
      if (nameTimeoutRef.current) clearTimeout(nameTimeoutRef.current)
    }
  }, [])

  // Auto-scroll effect
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
      }, 600)
    }
  }, [])

  // 🎯 BETTER INPUT STYLING with proper icon spacing
  const getInputStyling = (field: 'fullName' | 'email') => {
    return 'pl-12 pr-12 border-gray-400 focus:border-gray-500'
  }

  const isValid = fullName.trim().length > 0 && email.trim().includes('@')

  return (
    <div className="space-y-3 sm:space-y-6 max-w-4xl mx-auto">
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

      <Card ref={mainFormRef} className="p-4 sm:p-8 shadow-none sm:shadow-sm border-0 sm:border sm:border-gray-200 sm:rounded-xl bg-transparent sm:bg-white">
      <div className="mb-6">
  <h2 className="text-xl font-bold text-gray-900 mb-1">Contact Information</h2>
  <p className="text-gray-600 text-base">
    We need<span 
  className="relative inline-block font-medium text-gray-800"
  style={{
    backgroundImage: 'url(/icons/marker.svg)',
    backgroundSize: '95% 40%',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center calc(100% + 2px)',
    padding: '2px 4px 8px 4px',
    transform: 'rotate(-1deg)',
  }}
>these details</span>to deliver your completed work
  </p>
</div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* 🎯 BETTER ICON POSITIONING - Full Name */}
            <div className="space-y-2">
            <Label htmlFor="fullName" className="text-base font-semibold text-black flex items-center gap-2">
  <UserIcon className="w-5 h-5 text-gray-500" />
  Full Name <span className="text-red-500">*</span>
</Label>
              
              <div className="relative">
                {/* 🔥 LEFT ICON with better positioning */}
                
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  onBlur={handleNameBlur}
                  placeholder="Enter your name"
                  className="h-11 rounded-xl focus:ring-0 focus-visible:ring-0 pl-4 pr-4 border-gray-300 focus:border-gray-500"
                  autoFocus
                  aria-describedby={errors.fullName ? "fullName-error" : "fullName-help"}
                  aria-invalid={!!errors.fullName}
                />
              </div>

              {errors.fullName && touched.fullName && (
                <p id="fullName-error" className="text-sm text-red-600 flex items-center gap-1">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  {errors.fullName}
                </p>
              )}

              {!errors.fullName && (
                <p id="fullName-help" className="text-xs text-gray-500">
                    We'll use this for your order confirmation.
                </p>
              )}
            </div>

            {/* 🎯 BETTER ICON POSITIONING - Email */}
            <div className="space-y-2">
            <Label htmlFor="email" className="text-base font-semibold text-black flex items-center gap-2">
  <EnvelopeIcon className="w-5 h-5 text-gray-500" />
  Email Address <span className="text-red-500">*</span>
</Label>
              
              <div className="relative">
                {/* 🔥 LEFT ICON with better positioning */}
                
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  onBlur={handleEmailBlur}
                  placeholder="your.email@example.com"
                  className="h-11 rounded-xl focus:ring-0 focus-visible:ring-0 pl-4 pr-12 border-gray-400 focus:border-gray-500"
                  aria-describedby={errors.email ? "email-error" : "email-help"}
                  aria-invalid={!!errors.email}
                />
              </div>

              {errors.email && touched.email && (
                <p id="email-error" className="text-sm text-red-600 flex items-center gap-1">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  {errors.email}
                </p>
              )}

              {!errors.email && (
                <p id="email-help" className="text-xs text-gray-500">
                  We'll send updates and your completed work here.
                </p>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between pt-6">
            <Button
              type="button"
              onClick={onBack}
              disabled={isSubmitting}
              className="h-12 px-6 rounded-lg bg-gray-100 text-gray-900 hover:bg-gray-200 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 font-medium sm:w-auto w-full"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back
            </Button>
            
            <Button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="h-12 px-6 rounded-lg border-2 border-purple-600 bg-purple-600 text-white hover:bg-purple-700 disabled:bg-gray-300 disabled:border-gray-300 disabled:text-gray-500 transition-colors flex items-center justify-center gap-2 font-medium sm:w-auto w-full"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Processing...
                </>
              ) : (
                <>
                  Continue to Assignment Details
                  <ArrowRightIcon className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
  {fullName.trim() ? (
    <>
      Thanks, <span style={{ fontFamily: 'Caveat, cursive', fontSize: '16px', fontWeight: '600', color: '#374151' }}>{fullName.split(' ')[0]}</span>. Next, we'll collect the details of your assignment.
    </>
  ) : (
    "Next, we'll collect the details of your assignment."
  )}
</p>
        </form>
      </Card>
    </div>
  )
}