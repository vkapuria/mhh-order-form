'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import ServiceSelector from './ServiceSelector'
import EmailCapture from './EmailCapture'
import AssignmentDetails from './AssignmentDetails'
import FinalDetails from './FinalDetails'
import PricingSidebar from '../sidebar/PricingSidebar'
import ExitIntentModal from '../conversion/ExitIntentModal'
// import EmailRecovery from '../conversion/EmailRecovery' // DISABLED
import { useFormPersistence } from '@/hooks/useFormPersistence'
import { useExitIntent } from '@/hooks/useExitIntent'
import { FormStep, ServiceType, OrderFormData } from '@/types'

export default function FormWrapper() {
  const [currentStep, setCurrentStep] = useState<FormStep>('service')
  const [completedSteps, setCompletedSteps] = useState<FormStep[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  const [showExitIntent, setShowExitIntent] = useState(false)
  
  const [formData, setFormData] = useState<Partial<OrderFormData>>({
    serviceType: undefined,
    email: '',
    subject: '',
    documentType: '',
    pages: 0,
    deadline: '',
    fullName: '',
    instructions: '',
    referenceStyle: '',
    files: [],
    hasFiles: undefined
  })
  

  // Hooks
  const { saveFormData, getStoredFormData, clearStoredData } = useFormPersistence()
  
  // Exit intent - only enable after email is captured
  useExitIntent(
    () => setShowExitIntent(true),
    { 
      enabled: !!formData.email && completedSteps.length < 4,
      delay: 15000,
      sensitivity: 20 
    }
  )

  // DISABLED: Auto-save form data - Remove if you want no persistence at all
  // useEffect(() => {
  //   if (formData.email) {
  //     saveFormData(formData, currentStep, completedSteps)
  //   }
  // }, [formData, currentStep, completedSteps, saveFormData])

// Track form progress for abandonment detection
const trackProgress = useCallback(async (step: string) => {
  console.log('🔍 trackProgress called with:', { step, hasEmail: !!formData.email, sessionId })
  
  if (!formData.email) {
    console.log('⚠️ No email, skipping track')
    return
  }
  
  console.log('🚀 ATTEMPTING to track progress:', { 
    email: formData.email, 
    step, 
    sessionId,
    url: window.location.href
  })
  
  try {
    const payload = {
      email: formData.email,
      fullName: formData.fullName,
      step,
      formData: {
        // FIXED: Send ALL form fields
        serviceType: formData.serviceType,
        subject: formData.subject,
        documentType: formData.documentType,        // ADD THIS
        instructions: formData.instructions,        // ADD THIS
        pages: formData.pages,
        deadline: formData.deadline,
        referenceStyle: formData.referenceStyle,    // ADD THIS
        hasFiles: formData.hasFiles,                // ADD THIS
      },
      sessionId: sessionId
    }
    
    console.log('📤 Sending payload:', payload)
    
    const response = await fetch('/api/track-progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    
    console.log('📡 Response status:', response.status, response.statusText)
    
    if (!response.ok) {
      console.error('❌ Response not OK:', response.status, response.statusText)
      const errorText = await response.text()
      console.error('❌ Error body:', errorText)
      return
    }
    
    const result = await response.json()
    console.log('✅ SUCCESS - Response data:', result)
    
    // TEMPORARY - Add visual feedback for mobile testing
    if (result.success) {
      const dot = document.createElement('div')
      dot.style.cssText = 'position:fixed;top:10px;right:10px;width:20px;height:20px;background:green;border-radius:50%;z-index:9999;'
      document.body.appendChild(dot)
      setTimeout(() => document.body.removeChild(dot), 2000)
    }
    
  } catch (error) {
    console.error('❌ NETWORK ERROR in track progress:', error)
  }
}, [formData, sessionId])

// Add debounced tracking
const timeoutRef = useRef<NodeJS.Timeout | null>(null)
const lastTrackTime = useRef<number>(0)

const debouncedTrackProgress = useCallback((step: string) => {
  // Rate limiting: max 1 call per 5 seconds
  const now = Date.now()
  if (now - lastTrackTime.current < 5000) return
  
  // Clear existing timeout
  if (timeoutRef.current) {
    clearTimeout(timeoutRef.current)
  }
  
  // Set new timeout - only call API after 2 seconds of inactivity
  timeoutRef.current = setTimeout(() => {
    trackProgress(step)
    lastTrackTime.current = Date.now()
  }, 2000)
}, [trackProgress])

// Track on step changes, with debouncing
useEffect(() => {
  if (formData.email) {
    debouncedTrackProgress(currentStep)
  }
}, [currentStep, formData.email, debouncedTrackProgress])

// Cleanup timeout on unmount
useEffect(() => {
  return () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }
}, [])

// 🆕 ADD THIS NEW useEffect - Page visibility tracking for abandonment
useEffect(() => {
  const handleBeforeUnload = () => {
    if (formData.email && currentStep !== 'service') {
      // Only fires once when user leaves - no spam
      const payload = JSON.stringify({
        email: formData.email,
        fullName: formData.fullName,
        step: currentStep + '_final', // Mark as final capture
        formData: {
          serviceType: formData.serviceType,
          subject: formData.subject,
          documentType: formData.documentType,
          instructions: formData.instructions,
          pages: formData.pages,
          deadline: formData.deadline,
          referenceStyle: formData.referenceStyle,
          hasFiles: formData.hasFiles,
        },
        sessionId: sessionId
      })
      
      // Use sendBeacon for reliability during page unload
      navigator.sendBeacon('/api/track-progress', payload)
    }
  }

  window.addEventListener('beforeunload', handleBeforeUnload)
  return () => window.removeEventListener('beforeunload', handleBeforeUnload)
}, [formData, currentStep, sessionId])

  const markStepCompleted = (step: FormStep) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps([...completedSteps, step])
    }
  }

  const goToStep = (step: FormStep) => {
    setCurrentStep(step)
  }

  const handleServiceSelect = (serviceType: ServiceType) => {
    setFormData({ ...formData, serviceType })
    markStepCompleted('service')
    goToStep('contact')
  }

  const handleEmailSubmit = () => {
    markStepCompleted('contact')
    goToStep('assignment')
  }

  const handleAssignmentNext = () => {
    markStepCompleted('assignment')
    goToStep('details')
  }

  const handleAssignmentChange = (field: string, value: string | number) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleDetailsChange = (field: string, value: string | number | boolean | File[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFormSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      // DEBUG: Check what we're submitting
      console.log('🔍 Form submission debug:', {
        hasFiles: formData.hasFiles,
        filesCount: formData.files?.length,
        fileNames: formData.files?.map(f => f.name),
        fileSizes: formData.files?.map(f => f.size),
        allFormData: formData
      })
      
      // Check if we have files to upload
      const hasFiles = formData.hasFiles && formData.files && formData.files.length > 0
      
      console.log('📎 Has files to upload?', hasFiles)
      
      if (hasFiles) {
        console.log('📤 Preparing FormData with files...')
        
        // Use FormData for file upload
        const submitData = new FormData()
        
        // Add all form fields
        submitData.append('serviceType', formData.serviceType || '')
        submitData.append('fullName', formData.fullName || '')
        submitData.append('email', formData.email || '')
        submitData.append('subject', formData.subject || '')
        submitData.append('documentType', formData.documentType || '')
        submitData.append('instructions', formData.instructions || '')
        submitData.append('pages', String(formData.pages || 0))
        submitData.append('deadline', formData.deadline || '')
        submitData.append('referenceStyle', formData.referenceStyle || '')
        submitData.append('hasFiles', String(formData.hasFiles || false))
        submitData.append('sessionId', `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
        
        // Add files
        if (formData.files) {
          console.log(`📎 Adding ${formData.files.length} files to FormData`)
          formData.files.forEach((file, index) => {
            console.log(`  File ${index + 1}: ${file.name} (${file.size} bytes)`)
            submitData.append('files', file)
          })
        }
        
        // Log FormData contents
        console.log('📋 FormData contents:')
        for (let [key, value] of submitData.entries()) {
          if (value instanceof File) {
            console.log(`  ${key}: [File] ${value.name} (${value.size} bytes)`)
          } else {
            console.log(`  ${key}: ${value}`)
          }
        }
        
        console.log('🚀 Sending request with files...')
        
        // Submit with files
        const response = await fetch('/api/submit-order', {
          method: 'POST',
          body: submitData,
          // DO NOT set Content-Type header - browser will set it with boundary
        })
        
        console.log('📨 Response status:', response.status)
        
        const result = await response.json()
        console.log('📦 Response data:', result)
        
        if (result.success) {
          clearStoredData()
          
          // Store order data for checkout page
          const checkoutData = {
            id: result.order.id,
            fullName: formData.fullName,
            email: formData.email,
            serviceType: formData.serviceType,
            subject: formData.subject,
            documentType: formData.documentType,
            instructions: formData.instructions,
            pages: formData.pages,
            deadline: formData.deadline,
            referenceStyle: formData.referenceStyle,
            totalPrice: result.order.total_price,
            basePrice: result.order.base_price,
            discountAmount: result.order.discount_amount,
            rushFee: result.order.rush_fee,
            attachments: []  // No files in this case
          }
          
          // Save to localStorage for checkout page
          localStorage.setItem('checkout_order', JSON.stringify(checkoutData))
          
          // Redirect to checkout
          window.location.href = `/checkout?orderId=${result.order.id}`
        } else {
          throw new Error(result.error || 'Submission failed')
        }
        
      } else {
        console.log('📄 No files - using JSON submission')
        
        // No files - use JSON submission
        const submitData = {
          serviceType: formData.serviceType,
          fullName: formData.fullName,
          email: formData.email,
          subject: formData.subject,
          documentType: formData.documentType,
          instructions: formData.instructions,
          pages: formData.pages,
          deadline: formData.deadline,
          referenceStyle: formData.referenceStyle,
          hasFiles: false,
          sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }
  
        console.log('📤 Sending JSON:', submitData)
  
        const response = await fetch('/api/submit-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submitData),
        })
        
        const result = await response.json()
        console.log('📦 Response:', result)
        
        // Track successful form submission
        await trackProgress('submitted')
        
        if (result.success) {
          clearStoredData()
          
          // Store order data for checkout page
          const checkoutData = {
            id: result.order.id,
            fullName: formData.fullName,
            email: formData.email,
            serviceType: formData.serviceType,
            subject: formData.subject,
            documentType: formData.documentType,
            instructions: formData.instructions,
            pages: formData.pages,
            deadline: formData.deadline,
            referenceStyle: formData.referenceStyle,
            totalPrice: result.order.total_price,
            basePrice: result.order.base_price,
            discountAmount: result.order.discount_amount,
            rushFee: result.order.rush_fee,
            attachments: []  // No files in this case
          }
          
          // Save to localStorage for checkout page
          localStorage.setItem('checkout_order', JSON.stringify(checkoutData))
          
          // Redirect to checkout
          window.location.href = `/checkout?orderId=${result.order.id}`
        } else {
          throw new Error(result.error || 'Submission failed')
        }
      }
      
    } catch (error) {
      console.error('❌ Submission error:', error)
      alert('❌ Error submitting order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleExitIntentSave = async (email: string) => {
    if (!formData.email) {
      setFormData({ ...formData, email })
    }
    // DISABLED: No more auto-save
    // saveFormData({ ...formData, email }, currentStep, completedSteps)
  }

  // DISABLED: No more auto-restore
  const handleRestoreForm = (savedData: any) => {
    // const stored = getStoredFormData()
    // if (stored) {
    //   setFormData(stored.data as Partial<OrderFormData>)
    //   setCurrentStep(stored.currentStep as FormStep)
    //   setCompletedSteps(stored.completedSteps as FormStep[])
    // }
    console.log('Form restoration disabled')
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'service':
        return (
          <ServiceSelector
            value={formData.serviceType}
            onChange={handleServiceSelect}
          />
        )
      
      case 'contact':
        return (
          <EmailCapture
            serviceType={formData.serviceType}
            fullName={formData.fullName || ''}
            email={formData.email || ''}
            onChange={(field, value) => setFormData({ ...formData, [field]: value })}
            onNext={handleEmailSubmit}
            onBack={() => goToStep('service')}
          />
        )
      
      case 'assignment':
        return (
          <AssignmentDetails
            serviceType={formData.serviceType!}
            previousData={{
              serviceType: formData.serviceType || '',
              fullName: formData.fullName || '',
              email: formData.email || ''
            }}
            data={{
              subject: formData.subject || '',
              documentType: formData.documentType || '',
              instructions: formData.instructions || ''
            }}
            onChange={handleAssignmentChange}
            onNext={handleAssignmentNext}
            onBack={() => goToStep('contact')}
          />
        )
      
        case 'details':
          return (
            <FinalDetails
              previousData={{
                serviceType: formData.serviceType || '',
                fullName: formData.fullName || '',
                email: formData.email || '',
                subject: formData.subject || '',
                documentType: formData.documentType || '',
                instructions: formData.instructions || ''
              }}
              data={{
                deadline: formData.deadline || '',
                referenceStyle: formData.referenceStyle || '',
                pages: formData.pages || 0,
                hasFiles: formData.hasFiles,
                files: formData.files || []
              }}
              onChange={handleDetailsChange}
              onSubmit={handleFormSubmit}
              onBack={() => goToStep('assignment')}
              isSubmitting={isSubmitting}
            />
          )
        
      
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* DISABLED: Email Recovery Banner */}
      {/* <div className="max-w-7xl mx-auto px-4">
        <EmailRecovery onRestoreForm={handleRestoreForm} />
      </div> */}
  
      {/* 2-Column Layout: Clean */}
      <div className="grid grid-cols-1 lg:grid-cols-5 min-h-screen">
        {/* LEFT SIDE: full width on mobile, 60% on desktop */}
        <div className="col-span-1 lg:col-span-3 bg-white px-6 sm:px-8 lg:px-12 py-8 sm:py-8 lg:py-8">
          {renderCurrentStep()}
        </div>
  
        {/* RIGHT SIDE: hidden on mobile, visible on desktop */}
        <div className="hidden lg:block lg:col-span-2 bg-gray-100 min-h-screen">
          <div className="sticky top-4 px-4 sm:px-8 lg:px-12 py-4 sm:py-6 lg:py-8 max-h-screen overflow-y-auto">
            <PricingSidebar
              formData={{
                serviceType: formData.serviceType,
                email: formData.email || '',
                subject: formData.subject || '',
                documentType: formData.documentType || '',
                pages: formData.pages || 0,
                deadline: formData.deadline || '',
                fullName: formData.fullName || '',
                instructions: formData.instructions || '',
                referenceStyle: formData.referenceStyle || ''
              }}
              currentStep={currentStep as any}
              completedSteps={completedSteps}
            />
          </div>
        </div>
      </div>
  
      {/* Exit Intent Modal */}
      <ExitIntentModal
        isOpen={showExitIntent}
        onClose={() => setShowExitIntent(false)}
        onSaveProgress={handleExitIntentSave}
        currentEmail={formData.email}
        currentStep={currentStep}
        hasDiscount={true}
      />
    </div>
  )
}