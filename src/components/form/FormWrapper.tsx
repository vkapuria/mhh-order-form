'use client'

import { useState, useEffect } from 'react'
import ServiceSelector from './ServiceSelector'
import EmailCapture from './EmailCapture'
import AssignmentDetails from './AssignmentDetails'
import FinalDetails from './FinalDetails'
import PricingSidebar from '../sidebar/PricingSidebar'
import ExitIntentModal from '../conversion/ExitIntentModal'
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
      delay: 15000,
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
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      clearStoredData()
      markStepCompleted('details')
      
      alert('🎉 Order submitted successfully! You will receive a confirmation email shortly.')
      
    } catch (error) {
      console.error('Submission error:', error)
      alert('❌ Error submitting order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleExitIntentSave = async (email: string) => {
    if (!formData.email) {
      setFormData({ ...formData, email })
    }
    saveFormData({ ...formData, email }, currentStep, completedSteps)
    console.log('Saving progress for email:', email)
  }

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
    <div className="min-h-screen bg-white">
      {/* Email Recovery Banner */}
      <div className="max-w-7xl mx-auto px-4">
        <EmailRecovery onRestoreForm={handleRestoreForm} />
      </div>

      {/* 2-Column Layout: Clean like EduBirdie */}
      <div className="grid grid-cols-1 lg:grid-cols-5 min-h-screen">
        {/* LEFT SIDE: 60% width, pure white */}
        <div className="lg:col-span-3 bg-white px-12 py-8">
          {renderCurrentStep()}
        </div>

        {/* RIGHT SIDE: 40% width, gray background */}
        <div className="lg:col-span-2 bg-gray-100 min-h-screen">
          <div className="px-6 py-8">
            <div className="sticky top-8">
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