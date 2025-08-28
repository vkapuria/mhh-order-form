'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import StepSummary from './StepSummary'

import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command"

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"

import {
  DocumentTextIcon,
  AcademicCapIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  PencilSquareIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import { ChevronsUpDown } from 'lucide-react'
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

/** 🎓 SUBJECT LIST (grouped) */
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

/** 📝 DOCUMENT TYPE LIST (grouped) */
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
  const [subjectOpen, setSubjectOpen] = useState(false)
  const [documentTypeOpen, setDocumentTypeOpen] = useState(false)
  const mainFormRef = useRef<HTMLDivElement>(null)

  // Validation
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

  // Handlers
  const handleSubjectChange = (value: string) => {
    onChange('subject', value)
    if (errors.subject && value) {
      setErrors(prev => ({ ...prev, subject: undefined }))
      setValidationState(prev => ({ ...prev, subject: 'valid' }))
    }
  }
  const handleDocumentTypeChange = (value: string) => {
    onChange('documentType', value)
    if (errors.documentType && value) {
      setErrors(prev => ({ ...prev, documentType: undefined }))
      setValidationState(prev => ({ ...prev, documentType: 'valid' }))
    }
  }
  const handleInstructionsChange = (value: string) => {
    onChange('instructions', value)
    if (errors.instructions && value.trim().length >= 20) {
      setErrors(prev => ({ ...prev, instructions: undefined }))
      setValidationState(prev => ({ ...prev, instructions: 'valid' }))
    }
  }

  // Blur
  const handleSubjectBlur = () => {
    setTouched(prev => ({ ...prev, subject: true }))
    const error = validateSubject(data.subject)
    setErrors(prev => ({ ...prev, subject: error || undefined }))
    setValidationState(prev => ({ ...prev, subject: error ? 'invalid' : 'valid' }))
  }
  const handleDocumentTypeBlur = () => {
    setTouched(prev => ({ ...prev, documentType: true }))
    const error = validateDocumentType(data.documentType)
    setErrors(prev => ({ ...prev, documentType: error || undefined }))
    setValidationState(prev => ({ ...prev, documentType: error ? 'invalid' : 'valid' }))
  }
  const handleInstructionsBlur = () => {
    setTouched(prev => ({ ...prev, instructions: true }))
    const error = validateInstructions(data.instructions)
    setErrors(prev => ({ ...prev, instructions: error || undefined }))
    setValidationState(prev => ({ ...prev, instructions: error ? 'invalid' : 'valid' }))
  }

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    setTouched({ subject: true, documentType: true, instructions: true })

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

  // Auto-scroll (respect reduced motion)
  useEffect(() => {
    if (!mainFormRef.current) return

    const targetTop = mainFormRef.current.offsetTop - 20
    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    if (prefersReduced) {
      window.scrollTo(0, targetTop)
      return
    }

    setTimeout(() => {
      const startPosition = window.pageYOffset
      const distance = targetTop - startPosition
      const duration = 800
      let start: number | null = null

      function animation(currentTime: number): void {
        if (start === null) start = currentTime
        const timeElapsed = currentTime - start
        const t = timeElapsed / (duration / 2)
        const eased =
          t < 1
            ? (distance / 2) * t * t * t + startPosition
            : (distance / 2) * ((t - 2) * (t - 2) * (t - 2) + 2) + startPosition
        window.scrollTo(0, eased)
        if (timeElapsed < duration) requestAnimationFrame(animation)
      }

      requestAnimationFrame(animation)
    }, 800)
  }, [])

  const isValid =
    data.subject.trim().length > 0 &&
    data.documentType.trim().length > 0 &&
    data.instructions.trim().length >= 20

  const selectedSubjectLabel =
    data.subject
      ? allSubjects.flatMap(g => g.options).find(s => s.value === data.subject)?.label
      : ''

  const selectedDocTypeLabel =
    data.documentType
      ? allDocumentTypes.flatMap(g => g.options).find(d => d.value === data.documentType)?.label
      : ''

  return (
    <div className="space-y-3 sm:space-y-6 max-w-4xl mx-auto">
      {/* Summaries */}
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

      {/* Main Card */}
      <Card ref={mainFormRef} className="px-0 py-8 border-0 shadow-none lg:p-8 lg:shadow-sm lg:border lg:border-gray-200">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Provide Assignment Details</h2>
          <p className="text-gray-600 text-base">
            Help us understand what you need so we can deliver
            <span
              className="relative inline-block font-medium text-gray-800"
              style={{
                backgroundImage: 'url(/icons/marker.svg)',
                backgroundSize: '95% 40%',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center calc(100% + 2px)',
                padding: '2px 4px 8px 4px',
                transform: 'rotate(-1deg)',
              }}
            >
              quality work
            </span>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8">

          {/* Row 1: Subject + Document Type */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">

            {/* Subject */}
            <div className="space-y-2 lg:space-y-3">
              <Label className="flex items-center gap-2 text-base font-semibold text-black mb-2">
                <AcademicCapIcon className="w-5 h-5" />
                Select Subject<span className="text-red-500">*</span>
              </Label>

              <Popover open={subjectOpen} onOpenChange={setSubjectOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={subjectOpen}
                    className="w-full justify-between text-base rounded-lg"
                    style={{ 
                      height: '54px', 
                      border: '1px solid #0f0f10'
                    }}
                    onBlur={handleSubjectBlur}
                  >
                    {selectedSubjectLabel || 'Select subject...'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="p-0" 
                  style={{ 
                    minWidth: 'var(--radix-popover-trigger-width)',
                    width: 'max-content',
                    maxWidth: '400px'
                  }}
                >
                  <Command>
                    <CommandInput placeholder="Search subject..." />
                    <CommandList>
                      <CommandEmpty>No subject found.</CommandEmpty>
                      {allSubjects.map((group) => (
                        <CommandGroup key={group.group} heading={group.group}>
                          {group.options.map((subject) => (
                            <CommandItem
                              key={subject.value}
                              value={subject.value}
                              onSelect={() => {
                                handleSubjectChange(subject.value)
                                setSubjectOpen(false) // Close after selection
                              }}
                            >
                              {subject.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      ))}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {errors.subject && touched.subject && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  {errors.subject}
                </p>
              )}
              {!errors.subject && (
                <p className="text-xs text-gray-800 text-center" style={{ marginTop: '-4px' }}>
                  We'll match you with a subject expert.
                </p>
              )}
            </div>

            {/* Document Type */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-base font-semibold text-black mb-2">
                <DocumentTextIcon className="w-5 h-5" />
                {serviceType === 'presentation' ? 'Assignment Type' : 'Type of paper'}<span className="text-red-500">*</span>
              </Label>

              <Popover open={documentTypeOpen} onOpenChange={setDocumentTypeOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={documentTypeOpen}
                    className="w-full justify-between text-base rounded-lg"
                    style={{ 
                      height: '54px', 
                      border: '1px solid #0f0f10'
                    }}
                    onBlur={handleDocumentTypeBlur}
                  >
                    {selectedDocTypeLabel || 'Select document type...'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="p-0" 
                  style={{ 
                    minWidth: 'var(--radix-popover-trigger-width)',
                    width: 'max-content',
                    maxWidth: '400px'
                  }}
                >
                  <Command>
                    <CommandInput placeholder="Search document type..." />
                    <CommandList>
                      <CommandEmpty>No type found.</CommandEmpty>
                      {allDocumentTypes.map((group) => (
                        <CommandGroup key={group.group} heading={group.group}>
                          {group.options.map((type) => (
                            <CommandItem
                              key={type.value}
                              value={type.value}
                              onSelect={() => {
                                handleDocumentTypeChange(type.value)
                                setDocumentTypeOpen(false)
                              }}
                            >
                              {type.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      ))}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {errors.documentType && touched.documentType && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  {errors.documentType}
                </p>
              )}
              {!errors.documentType && (
                <p className="text-xs text-gray-800 text-center" style={{ marginTop: '-6px' }}>
                  Essay, report, presentation, and more.
                </p>
              )}
            </div>
          </div>

          {/* Row 2: Instructions */}
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
                className="min-h-[140px] text-base resize-none rounded-lg"
                style={{ border: '1px solid #0f0f10' }}
                rows={5}
              />
            </div>

            {errors.instructions && touched.instructions && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <ExclamationTriangleIcon className="h-4 w-4" />
                {errors.instructions}
              </p>
            )}
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
              className="px-6 h-12 font-semibold flex items-center justify-center gap-2 sm:w-auto w-full disabled:opacity-50 transition-colors cursor-pointer"
              style={{
                backgroundColor: '#e6e6e6',
                color: '#1b1b20',
                borderRadius: '6px'
              }}
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back
            </Button>

            <Button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="px-6 h-12 text-white font-semibold flex items-center justify-center gap-2 sm:w-auto w-full disabled:bg-gray-300 disabled:text-gray-500 transition-colors cursor-pointer"
              style={{
                backgroundColor: '#1b1b20',
                borderRadius: '6px'
              }}
              onMouseEnter={(e) => !isSubmitting && (e.currentTarget.style.backgroundColor = '#0f0f14')}
              onMouseLeave={(e) => !isSubmitting && (e.currentTarget.style.backgroundColor = '#1b1b20')}
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

          <p className="text-xs text-gray-800 text-center">
            You can attach files in the next step.
          </p>
        </form>
      </Card>
    </div>
  )
}
