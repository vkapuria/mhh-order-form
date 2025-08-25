'use client'

import { useMemo, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import StepSummary from './StepSummary'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  DocumentTextIcon,
  AcademicCapIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  PencilSquareIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import type { ServiceType } from '@/types'

interface AssignmentDetailsProps {
  serviceType: ServiceType
  data: {
    subject: string
    documentType: string
    instructions: string
  }
  previousData?: {
    serviceType: string
    fullName: string
    email: string
  }
  onChange: (field: string, value: string) => void
  onNext: () => void
  onBack: () => void
}

interface ValidationErrors {
  subject?: string
  documentType?: string
  instructions?: string
}

interface ValidationState {
  subject: 'idle' | 'valid' | 'invalid'
  documentType: 'idle' | 'valid' | 'invalid'
  instructions: 'idle' | 'valid' | 'invalid'
}

const allDocumentTypes = [
  { value: 'essay', label: 'Essay' },
  { value: 'research_paper', label: 'Research Paper' },
  { value: 'term_paper', label: 'Term Paper' },
  { value: 'case_study', label: 'Case Study' },
  { value: 'dissertation', label: 'Dissertation' },
  { value: 'thesis', label: 'Thesis' },
  { value: 'report', label: 'Report' },
  { value: 'article', label: 'Article' },
  { value: 'business_presentation', label: 'Business Presentation' },
  { value: 'academic_presentation', label: 'Academic Presentation' },
  { value: 'pitch_deck', label: 'Pitch Deck' },
  { value: 'other', label: 'Other' },
]

const allSubjects = [
  { value: 'english', label: 'English' },
  { value: 'psychology', label: 'Psychology' },
  { value: 'business', label: 'Business' },
  { value: 'nursing', label: 'Nursing' },
  { value: 'history', label: 'History' },
  { value: 'sociology', label: 'Sociology' },
  { value: 'economics', label: 'Economics' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'management', label: 'Management' },
  { value: 'education', label: 'Education' },
  { value: 'computer_science', label: 'Computer Science' },
  { value: 'other', label: 'Other' },
]

export default function AssignmentDetails({
  serviceType,
  data,
  previousData,
  onChange,
  onNext,
  onBack,
}: AssignmentDetailsProps) {
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [validationState, setValidationState] = useState<ValidationState>({
    subject: 'idle',
    documentType: 'idle',
    instructions: 'idle'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [touched, setTouched] = useState({ subject: false, documentType: false, instructions: false })
  
  const mainFormRef = useRef<HTMLDivElement>(null)

  // Validation functions
  const validateSubject = (subject: string): string | null => {
    if (!subject || subject.trim() === '') return 'Please select a subject'
    return null
  }

  const validateDocumentType = (docType: string): string | null => {
    if (!docType || docType.trim() === '') return 'Please select a document type'
    return null
  }

  const validateInstructions = (instructions: string): string | null => {
    const trimmed = instructions.trim()
    if (!trimmed) return 'Assignment instructions are required'
    if (trimmed.length < 20) return 'Please provide at least 20 characters of instructions'
    return null
  }

  // Handle field changes with validation clearing
  const handleSubjectChange = (value: string) => {
    onChange('subject', value)
    // Clear error when user selects something
    if (errors.subject && value) {
      setErrors(prev => ({ ...prev, subject: undefined }))
      setValidationState(prev => ({ ...prev, subject: 'valid' }))
    }
  }

  const handleDocumentTypeChange = (value: string) => {
    onChange('documentType', value)
    // Clear error when user selects something
    if (errors.documentType && value) {
      setErrors(prev => ({ ...prev, documentType: undefined }))
      setValidationState(prev => ({ ...prev, documentType: 'valid' }))
    }
  }

  const handleInstructionsChange = (value: string) => {
    onChange('instructions', value)
    // Clear error when user types enough
    if (errors.instructions && value.trim().length >= 20) {
      setErrors(prev => ({ ...prev, instructions: undefined }))
      setValidationState(prev => ({ ...prev, instructions: 'valid' }))
    }
  }

  // Blur validation handlers
  const handleSubjectBlur = () => {
    setTouched(prev => ({ ...prev, subject: true }))
    const error = validateSubject(data.subject)
    setErrors(prev => ({ ...prev, subject: error || undefined }))
    setValidationState(prev => ({ 
      ...prev, 
      subject: error ? 'invalid' : 'valid' 
    }))
  }

  const handleDocumentTypeBlur = () => {
    setTouched(prev => ({ ...prev, documentType: true }))
    const error = validateDocumentType(data.documentType)
    setErrors(prev => ({ ...prev, documentType: error || undefined }))
    setValidationState(prev => ({ 
      ...prev, 
      documentType: error ? 'invalid' : 'valid' 
    }))
  }

  const handleInstructionsBlur = () => {
    setTouched(prev => ({ ...prev, instructions: true }))
    const error = validateInstructions(data.instructions)
    setErrors(prev => ({ ...prev, instructions: error || undefined }))
    setValidationState(prev => ({ 
      ...prev, 
      instructions: error ? 'invalid' : 'valid' 
    }))
  }

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Mark all required fields as touched
    setTouched({ subject: true, documentType: true, instructions: true })

    // Validate all required fields
    const subjectError = validateSubject(data.subject)
    const documentTypeError = validateDocumentType(data.documentType)
    const instructionsError = validateInstructions(data.instructions)

    setErrors({
      subject: subjectError || undefined,
      documentType: documentTypeError || undefined,
      instructions: instructionsError || undefined
    })

    setValidationState({
      subject: subjectError ? 'invalid' : 'valid',
      documentType: documentTypeError ? 'invalid' : 'valid',
      instructions: instructionsError ? 'invalid' : 'valid'
    })

    // Proceed if no errors
    if (!subjectError && !documentTypeError && !instructionsError) {
      try {
        await new Promise(resolve => setTimeout(resolve, 200))
        onNext()
      } catch (error) {
        console.error('Form submission error:', error)
      }
    }

    setIsSubmitting(false)
  }

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
      }, 800)
    }
  }, [])

  const isValid = data.subject.trim().length > 0 && data.documentType.trim().length > 0 && data.instructions.trim().length >= 20

  return (
    <div className="space-y-3 sm:space-y-6 max-w-4xl mx-auto">
      {/* Accordion Summaries */}
      {previousData && (
        <>
          <StepSummary
            stepNumber={1}
            title="Service Selected"
            data={[
              { label: 'Service', value: previousData.serviceType.charAt(0).toUpperCase() + previousData.serviceType.slice(1) }
            ]}
          />
          <StepSummary
            stepNumber={2}
            title="Contact Information"
            data={[
              { label: 'Name', value: previousData.fullName },
              { label: 'Email', value: previousData.email }
            ]}
          />
        </>
      )}

      {/* Main Form Card */}
      <Card ref={mainFormRef} className="p-8 shadow-sm border-gray-200">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-1">What do you need help with?</h2>
          <p className="text-gray-600 text-base">
            Help us understand what you need so we can deliver quality work
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Row 1: Subject + Document Type */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            
            {/* Subject Field */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-base font-semibold text-black mb-2">
                <AcademicCapIcon className="w-5 h-5" />
                Select Subject<span className="text-red-500">*</span>
              </Label>
              
              <div className="relative">
                <Select 
                  value={data.subject} 
                  onValueChange={handleSubjectChange}
                  onOpenChange={(isOpen) => {
                    if (!isOpen) handleSubjectBlur()
                  }}
                >
                  <SelectTrigger className="w-full h-11 text-base border-gray-300 focus:border-gray-500 rounded-xl">
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {allSubjects.map((subj) => (
                      <SelectItem key={subj.value} value={subj.value}>
                        {subj.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Error Message */}
              {errors.subject && touched.subject && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  {errors.subject}
                </p>
              )}
              
              {/* Help Text */}
              {!errors.subject && (
                <p className="text-xs text-gray-500">We'll match a subject expert.</p>
              )}
            </div>

            {/* Document Type Field */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-base font-semibold text-black mb-2">
                <DocumentTextIcon className="w-5 h-5" />
                {serviceType === 'presentation' ? 'Assignment Type' : 'Type of paper'}<span className="text-red-500">*</span>
              </Label>
              
              <div className="relative">
                <Select 
                  value={data.documentType} 
                  onValueChange={handleDocumentTypeChange}
                  onOpenChange={(isOpen) => {
                    if (!isOpen) handleDocumentTypeBlur()
                  }}
                >
                  <SelectTrigger className="w-full h-11 text-base border-gray-400 focus:border-gray-500 rounded-xl pr-12">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    {allDocumentTypes.map((doc) => (
                      <SelectItem key={doc.value} value={doc.value}>
                        {doc.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Error Message */}
              {errors.documentType && touched.documentType && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  {errors.documentType}
                </p>
              )}
              
              {/* Help Text */}
              {!errors.documentType && (
                <p className="text-xs text-gray-500">Essay, report, presentation, and more.</p>
              )}
            </div>
          </div>

          {/* Row 2: Instructions (Required) */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base font-semibold text-black mb-2">
              <PencilSquareIcon className="w-5 h-5" />
              Assignment Instructions<span className="text-red-500">*</span>
            </Label>
            
            <div className="relative">
              <Textarea
                value={data.instructions}
                onChange={(e) => handleInstructionsChange(e.target.value)}
                onBlur={handleInstructionsBlur}
                placeholder="Paste your prompt, key points, or professor's rubric here…"
                className="min-h-[120px] text-base border-gray-300 focus:border-gray-500 resize-none rounded-xl"
                rows={5}
              />
            </div>

            {/* Error Message */}
            {errors.instructions && touched.instructions && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <ExclamationTriangleIcon className="h-4 w-4" />
                {errors.instructions}
              </p>
            )}
            
            {/* Help Text */}
            {!errors.instructions && (
              <p className="text-xs text-gray-500">
                Helpful: formatting, sources, or any must-follow guidance. (Minimum 20 characters)
              </p>
            )}
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
                  Continue to Final Details
                  <ArrowRightIcon className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            You can attach files in the next step.
          </p>
        </form>
      </Card>
    </div>
  )
}