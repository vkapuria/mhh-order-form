'use client'

import { useMemo, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import StepSummary from './StepSummary'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  SelectGroup,
  SelectLabel 
} from '@/components/ui/select'
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

// 🎓 COMPREHENSIVE SUBJECT LIST WITH OPTGROUPS
const allSubjects = [
  {
    group: 'Business',
    options: [
      { value: 'accounting', label: 'Accounting' },
      { value: 'administration', label: 'Administration' },
      { value: 'business', label: 'Business' },
      { value: 'economics', label: 'Economics' },
      { value: 'marketing', label: 'Marketing' },
      { value: 'finance', label: 'Finance' },
      { value: 'management', label: 'Management' },
    ]
  },
  {
    group: 'Science',
    options: [
      { value: 'biology', label: 'Biology' },
      { value: 'chemistry', label: 'Chemistry' },
      { value: 'physics', label: 'Physics' },
      { value: 'geology', label: 'Geology' },
      { value: 'maths', label: 'Maths' },
      { value: 'statistics', label: 'Statistics' },
      { value: 'medicine', label: 'Medicine' },
      { value: 'nursing', label: 'Nursing' },
    ]
  },
  {
    group: 'Social Sciences',
    options: [
      { value: 'communications', label: 'Communications' },
      { value: 'education', label: 'Education' },
      { value: 'law', label: 'Law' },
      { value: 'political_science', label: 'Political Science' },
      { value: 'psychology', label: 'Psychology' },
      { value: 'sociology', label: 'Sociology' },
    ]
  },
  {
    group: 'Technology',
    options: [
      { value: 'computer_science', label: 'Computer Science' },
      { value: 'engineering', label: 'Engineering' },
      { value: 'database_management', label: 'Database Management' },
      { value: 'information_technology', label: 'Information Technology' },
    ]
  },
  {
    group: 'Humanities',
    options: [
      { value: 'english', label: 'English' },
      { value: 'history', label: 'History' },
      { value: 'literature', label: 'Literature' },
      { value: 'philosophy', label: 'Philosophy' },
    ]
  },
  {
    group: 'Other',
    options: [
      { value: 'other', label: 'Other' },
    ]
  }
]

// 📝 COMPREHENSIVE DOCUMENT TYPE LIST WITH OPTGROUPS
const allDocumentTypes = [
  {
    group: 'Popular Choices',
    options: [
      { value: 'essay', label: 'Essay' },
      { value: 'research_paper', label: 'Research Paper' },
      { value: 'homework', label: 'Homework' },
      { value: 'coursework', label: 'Coursework' },
      { value: 'powerpoint', label: 'PowerPoint Presentation' },
      { value: 'article_review', label: 'Article Review' },
      { value: 'capstone_project', label: 'Capstone Project' },
      { value: 'other', label: 'Other' },
    ]
  },
  {
    group: 'Essays',
    options: [
      { value: 'admission_essay', label: 'Admission Essay' },
      { value: 'analytical_essay', label: 'Analytical Essay' },
      { value: 'argumentative_essay', label: 'Argumentative Essay' },
      { value: 'reflective_essay', label: 'Reflective Essay' },
      { value: 'descriptive_essay', label: 'Descriptive Essay' },
      { value: 'narrative_essay', label: 'Narrative Essay' },
      { value: 'expository_essay', label: 'Expository Essay' },
      { value: 'compare_contrast_essay', label: 'Compare & Contrast Essay' },
    ]
  },
  {
    group: 'Research',
    options: [
      { value: 'annotated_bibliography', label: 'Annotated Bibliography' },
      { value: 'critical_analysis', label: 'Critical Analysis' },
      { value: 'dissertation', label: 'Dissertation' },
      { value: 'literature_review', label: 'Literature Review' },
      { value: 'research_proposal', label: 'Research Proposal' },
      { value: 'term_paper', label: 'Term Paper' },
      { value: 'thesis', label: 'Thesis' },
      { value: 'systematic_review', label: 'Systematic Review' },
      { value: 'meta_analysis', label: 'Meta-analysis' },
      { value: 'case_report', label: 'Case Report' },
      { value: 'research_summary', label: 'Research Summary' },
    ]
  },
  {
    group: 'Business',
    options: [
      { value: 'business_plan', label: 'Business Plan' },
      { value: 'case_study', label: 'Case Study' },
      { value: 'report', label: 'Report' },
      { value: 'feasibility_study', label: 'Feasibility Study' },
      { value: 'white_paper', label: 'White Paper' },
      { value: 'marketing_plan', label: 'Marketing Plan' },
      { value: 'executive_summary', label: 'Executive Summary' },
    ]
  },
  {
    group: 'Creative Writing',
    options: [
      { value: 'short_story', label: 'Short Story' },
      { value: 'script', label: 'Script' },
      { value: 'poem', label: 'Poem' },
      { value: 'playwriting', label: 'Playwriting' },
    ]
  },
  {
    group: 'STEM Assignments',
    options: [
      { value: 'math_problems', label: 'Math Problems' },
      { value: 'lab_report', label: 'Lab Report' },
      { value: 'data_analysis', label: 'Data Analysis' },
      { value: 'programming_task', label: 'Programming Task' },
    ]
  }
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
      <Card ref={mainFormRef} className="px-0 py-8 border-0 shadow-none lg:p-8 lg:shadow-sm lg:border lg:border-gray-200">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Provide Assignment Details</h2>
          <p className="text-gray-600 text-base">
            Help us understand what you need so we can deliver<span 
              className="relative inline-block font-medium text-gray-800"
              style={{
                backgroundImage: 'url(/icons/marker.svg)',
                backgroundSize: '95% 40%',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center calc(100% + 2px)',
                padding: '2px 4px 8px 4px',
                transform: 'rotate(-1deg)',
              }}
            >quality work</span>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8">
          
          {/* Row 1: Subject + Document Type */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
            
            {/* Subject Field with Optgroups */}
            <div className="space-y-2 lg:space-y-3">
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
                  <SelectTrigger className="w-full text-base focus:border-gray-500 rounded-lg" style={{ height: '54px', border: '1px solid #0f0f10' }}>
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {allSubjects.map((group) => (
                      <SelectGroup key={group.group}>
                        <SelectLabel className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                          {group.group}
                        </SelectLabel>
                        {group.options.map((subject) => (
                          <SelectItem key={subject.value} value={subject.value}>
                            {subject.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
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
                <p className="text-xs text-gray-800 text-center" style={{ marginTop: '-4px' }}>We'll match you with a subject expert.</p>
              )}
            </div>

            {/* Document Type Field with Optgroups */}
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
                  <SelectTrigger className="w-full text-base focus:border-gray-500 rounded-lg" style={{ height: '54px', border: '1px solid #0f0f10' }}>
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    {allDocumentTypes.map((group) => (
                      <SelectGroup key={group.group}>
                        <SelectLabel className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                          {group.group}
                        </SelectLabel>
                        {group.options.map((doc) => (
                          <SelectItem key={doc.value} value={doc.value}>
                            {doc.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
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
                <p className="text-xs text-gray-800 text-center" style={{ marginTop: '-6px' }}>Essay, report, presentation, and more.</p>
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
                className="min-h-[140px] text-base focus:border-gray-500 resize-none rounded-lg" style={{ border: '1px solid #0f0f10' }}
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
              <p className="text-xs text-gray-800 text-center" style={{ marginTop: '-4px' }}>
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
  className="px-6 bg-black text-white hover:bg-gray-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 font-medium sm:w-auto w-full rounded-lg" style={{ height: '54px', border: '1px solid #0f0f10' }}
>
  <ArrowLeftIcon className="w-4 h-4" />
  Back
</Button>
            <Button 
              type="submit" 
              disabled={!isValid || isSubmitting}
              className="px-6 text-white hover:bg-gray-300 disabled:bg-gray-300 disabled:text-gray-500 transition-colors flex items-center justify-center gap-2 font-medium sm:w-auto w-full rounded-lg" style={{ height: '54px', backgroundColor: '#8800e9', border: '1px solid #8800e9' }}            >
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

          <p className="text-xs text-gray-800 text-center">
            You can attach files in the next step.
          </p>
        </form>
      </Card>
    </div>
  )
}