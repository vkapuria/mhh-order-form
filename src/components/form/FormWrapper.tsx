'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import StepIndicator from './StepIndicator'
import ServiceSelector from './ServiceSelector'
import EmailCapture from './EmailCapture'
import AssignmentDetails from './AssignmentDetails'
import FinalDetails from './FinalDetails'
import PricingSidebar from '../sidebar/PricingSidebar'
import ExitIntentModal from '../conversion/ExitIntentModal'
import ProgressIncentives from '../conversion/ProgressIncentives'
import TrustSignals from '../conversion/TrustSignals'
import EmailRecovery from '../conversion/EmailRecovery'
import { useFormPersistence } from '@/hooks/useFormPersistence'
import { useExitIntent } from '@/hooks/useExitIntent'
import { FormStep, ServiceType, OrderFormData } from '@/types'

export default function FormWrapper() {
  const [currentStep, setCurrentStep] = useState<FormStep>('service')
  const [completedSteps, setCompletedSteps] = useState<FormStep[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
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
    files: []
  })

  // Hooks
  const { saveFormData, getStoredFormData, clearStoredData } = useFormPersistence()
  
  // Exit intent - only enable after email is captured
  useExitIntent(
    () => setShowExitIntent(true),
    { 
      enabled: !!formData.email && completedSteps.length < 4,
      delay: 15000, // 15 seconds
      sensitivity: 20 
    }
  )

  // Auto-save form data
  useEffect(() => {
    if (formData.email) {
      saveFormData(formData, currentStep, completedSteps)
    }
  }, [formData, currentStep, completedSteps, saveFormData])

  // Load saved data on mount
  useEffect(() => {
    const stored = getStoredFormData()
    if (stored) {
      // Don't auto-restore, let EmailRecovery component handle it
      console.log('Found saved form data:', stored.sessionId)
    }
  }, [getStoredFormData])

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

  const handleDetailsChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleFormSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      console.log('Submitting form data:', formData)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Clear saved data on successful submission
      clearStoredData()
      
      markStepCompleted('details')
      alert('Order submitted successfully!')
      
    } catch (error) {
      console.error('Submission error:', error)
      alert('Error submitting order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle exit intent modal save
  const handleExitIntentSave = async (email: string) => {
    if (!formData.email) {
      setFormData({ ...formData, email })
    }
    saveFormData({ ...formData, email }, currentStep, completedSteps)
    
    // Here you would typically send an email
    console.log('Saving progress for email:', email)
  }

  // Handle form restoration from EmailRecovery
  const handleRestoreForm = (savedData: any) => {
    const stored = getStoredFormData()
    if (stored) {
      setFormData(stored.data as Partial<OrderFormData>)
      setCurrentStep(stored.currentStep as FormStep)
      setCompletedSteps(stored.completedSteps as FormStep[])
    }
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
            email={formData.email || ''}
            onChange={(email) => setFormData({ ...formData, email })}
            onNext={handleEmailSubmit}
          />
        )
      
      case 'assignment':
        return (
          <AssignmentDetails
            serviceType={formData.serviceType!}
            data={{
              subject: formData.subject || '',
              documentType: formData.documentType || '',
              pages: formData.pages || 0,
              deadline: formData.deadline || ''
            }}
            onChange={handleAssignmentChange}
            onNext={handleAssignmentNext}
            onBack={() => goToStep('contact')}
          />
        )
      
      case 'details':
        return (
          <FinalDetails
            data={{
              fullName: formData.fullName || '',
              instructions: formData.instructions || '',
              referenceStyle: formData.referenceStyle || ''
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Place Your Order
          </h1>
          <p className="text-gray-600">
            Get professional help with your academic assignments
          </p>
        </div>

        {/* Email Recovery Banner */}
        <EmailRecovery onRestoreForm={handleRestoreForm} />

        {/* 2-Column Layout: Form + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Column */}
          <div className="lg:col-span-2">
            <Card className="p-8">
              <StepIndicator
                currentStep={currentStep}
                completedSteps={completedSteps}
              />
              <div className="mt-8">
                {renderCurrentStep()}
              </div>
            </Card>
            
            {/* Trust Signals Footer */}
            <div className="mt-8">
              <TrustSignals variant="footer" />
            </div>
          </div>

          {/* Enhanced Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Progress Incentives */}
              <ProgressIncentives
                currentStep={currentStep}
                completedSteps={completedSteps}
                totalSteps={4}
                hasEmail={!!formData.email}
              />
              
              {/* Pricing Sidebar */}
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
                currentStep={currentStep}
                completedSteps={completedSteps}
              />
              
              {/* Trust Signals */}
              <TrustSignals showDetailed />
            </div>
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