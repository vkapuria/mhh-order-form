'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import StepSummary from './StepSummary'
import FileUpload from './FileUpload'
import { calculateEnhancedPricing } from '@/lib/pricing/engine'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  ClockIcon,
  DocumentDuplicateIcon,
  HashtagIcon,
  PaperClipIcon,
  MinusIcon,
  PlusIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import { CheckCircleIcon } from '@heroicons/react/24/solid'

interface FinalDetailsProps {
  data: {
    deadline: string
    referenceStyle: string
    pages: number
    hasFiles: boolean | undefined
    files?: File[]
  }
  previousData?: {
    serviceType: string
    fullName: string
    email: string
    subject: string
    documentType: string
    instructions: string
  }
  onChange: (field: string, value: string | number | boolean | File[]) => void
  onSubmit: () => void
  onBack: () => void
  isSubmitting?: boolean
}

interface ValidationErrors {
  pages?: string
  deadline?: string
  files?: string
}


const getDeadlineDate = (days: string) => {
  const date = new Date()
  date.setDate(date.getDate() + parseInt(days))
  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' })
  const month = date.toLocaleDateString('en-US', { month: 'short' })
  const day = date.getDate()
  return `${dayOfWeek}, ${month} ${day}`
}

const deadlines = [
  { value: '14', label: '14 Days', date: getDeadlineDate('14'), tag: 'Best Value' },
  { value: '10', label: '10 Days', date: getDeadlineDate('10') },
  { value: '7', label: '7 Days', date: getDeadlineDate('7') },
  { value: '5', label: '5 Days', date: getDeadlineDate('5') },
  { value: '3', label: '3 Days', date: getDeadlineDate('3'), tag: 'Rush' },
  { value: '2', label: '48 Hours', date: getDeadlineDate('2'), tag: 'Urgent' },
  { value: '1', label: '24 Hours', date: getDeadlineDate('1'), tag: 'Very Urgent' },
]

const referenceStyles = [
  { value: 'apa', label: 'APA' },
  { value: 'mla', label: 'MLA' },
  { value: 'chicago', label: 'Chicago/Turabian' },
  { value: 'harvard', label: 'Harvard' },
  { value: 'ieee', label: 'IEEE' },
  { value: 'vancouver', label: 'Vancouver' },
  { value: 'none', label: 'No specific style' },
]

const allowedFileTypes = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'ppt', 'pptx']
const maxFileSize = 10 * 1024 * 1024 // 10MB

export default function FinalDetails({
  data,
  previousData,
  onChange,
  onSubmit,
  onBack,
  isSubmitting = false
}: FinalDetailsProps) {
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [touched, setTouched] = useState({ 
    pages: false, 
    deadline: false, 
    files: false 
  })
  
  const mainFormRef = useRef<HTMLDivElement>(null)

  // Validation functions
  const validatePages = (pages: number): string | null => {
    if (!pages || pages === 0) return 'Please enter the number of pages'
    if (pages < 1) return 'Minimum 1 page required'
    if (pages > 100) return 'Maximum 100 pages allowed'
    if (!Number.isInteger(pages)) return 'Pages must be a whole number'
    return null
  }

  const validateDeadline = (deadline: string): string | null => {
    if (!deadline || deadline.trim() === '') return 'Please select a deadline'
    return null
  }

  const validateReferenceStyle = (referenceStyle: string): string | null => {
    if (!referenceStyle || referenceStyle.trim() === '') return 'Please select a reference style'
    return null
  }

  const validateFiles = (files?: File[]): string | null => {
    if (!data.hasFiles || !files || files.length === 0) return null

    for (const file of files) {
      // Check file size
      if (file.size > maxFileSize) {
        return `File "${file.name}" is too large. Maximum size is 10MB.`
      }

      // Check file type
      const fileExtension = file.name.split('.').pop()?.toLowerCase()
      if (!fileExtension || !allowedFileTypes.includes(fileExtension)) {
        return `File type ".${fileExtension}" is not supported. Allowed: ${allowedFileTypes.join(', ').toUpperCase()}`
      }
    }

    return null
  }

  // Handle field changes with validation clearing
  const handlePagesChange = (value: number) => {
    onChange('pages', value)
    // Clear error when user enters valid number
    if (errors.pages && value >= 1 && value <= 100) {
      setErrors(prev => ({ ...prev, pages: undefined }))
    }
  }

  const handleDeadlineChange = (value: string) => {
    onChange('deadline', value)
    // Clear error when user selects something
    if (errors.deadline && value) {
      setErrors(prev => ({ ...prev, deadline: undefined }))
    }
  }

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Mark all required fields as touched
setTouched({ 
  pages: true, 
  deadline: true, 
  files: true 
})

// Validate all required fields
const pagesError = validatePages(data.pages)
const deadlineError = validateDeadline(data.deadline)
const filesError = data.hasFiles === undefined ? 'Please choose whether you want to attach files' : null

setErrors({
  pages: pagesError || undefined,
  deadline: deadlineError || undefined,
  files: filesError || undefined
})


// Proceed if no errors
if (!pagesError && !deadlineError && !filesError) {
  onSubmit()
}
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
      }, 1000)
    }
  }, [])

  const isValid = data.pages > 0 && 
                data.deadline.length > 0 && 
                data.hasFiles !== undefined &&
                (data.hasFiles === false || (data.hasFiles === true && data.files && data.files.length > 0))

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
          <StepSummary
            stepNumber={3}
            title="Assignment Details"
            data={[
              { label: 'Subject', value: previousData.subject },
              { label: 'Type', value: previousData.documentType.replace(/_/g, ' ') },
              { label: 'Instructions', value: previousData.instructions ? 'Provided' : 'None' }
            ]}
          />
        </>
      )}

      {/* Main Form Card */}
      <Card ref={mainFormRef} className="px-0 py-8 border-0 shadow-none lg:p-8 lg:shadow-sm lg:border lg:border-gray-200">
        {/* Header */}
        <div className="mb-6">
  <h2 className="text-xl font-bold text-gray-900 mb-1">Almost Done</h2>
  <p className="text-gray-600 text-base">
    Set pages and deadline. You can<span 
      className="relative inline-block font-medium text-gray-800"
      style={{
        backgroundImage: 'url(/icons/marker.svg)',
        backgroundSize: '95% 40%',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center calc(100% + 2px)',
        padding: '2px 4px 8px 4px',
        transform: 'rotate(-1deg)',
      }}
    >attach files</span>if needed.
  </p>
</div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8">
          
          {/* Row 1: Pages + Deadline */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
            
            {/* Pages Field */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-base font-semibold text-black mb-2">
                <HashtagIcon className="w-5 h-5" />
                Number of Pages<span className="text-red-500">*</span>
              </Label>
              
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handlePagesChange(Math.max(1, (data.pages || 1) - 1))}
                  disabled={(data.pages || 0) <= 1}
                  className="w-12 flex items-center justify-center rounded-lg hover:bg-gray-50 disabled:opacity-40" style={{ height: '54px', border: '1px solid #0f0f10' }}
                >
                  <MinusIcon className="w-4 h-4 text-gray-600" />
                </button>
                
                <div className="relative flex-1">
  <Input
    type="number"
    value={data.pages || ''}
    onChange={(e) => {
      const val = parseInt(e.target.value) || 0
      handlePagesChange(Math.max(0, Math.min(100, val)))
    }}
    className="text-base text-center focus:border-gray-500 rounded-lg focus:ring-0 focus-visible:ring-0" style={{ height: '54px', border: '1px solid #0f0f10' }}
    placeholder="0"
    min={1}
    max={100}
  />
</div>
                
                <button
                  type="button"
                  onClick={() => handlePagesChange(Math.min(100, (data.pages || 0) + 1))}
                  disabled={(data.pages || 0) >= 100}
                  className="w-12 flex items-center justify-center rounded-lg hover:bg-gray-50 disabled:opacity-40" style={{ height: '54px', border: '1px solid #0f0f10' }}
                >
                  <PlusIcon className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {/* Error Message */}
              {errors.pages && touched.pages && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  {errors.pages}
                </p>
              )}
              
              {/* Help Text */}
              {!errors.pages && (
                <p className="text-xs text-gray-800 text-center" style={{ marginTop: '-6px' }}>~275 words per page.</p>
              )}
            </div>

            {/* Deadline Field */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-base font-semibold text-black mb-2">
                <ClockIcon className="w-5 h-5" />
                Deadline<span className="text-red-500">*</span>
              </Label>
              
              <div className="relative">
                <Select 
                  value={data.deadline} 
                  onValueChange={handleDeadlineChange}
                >
                  <SelectTrigger className="w-full text-base focus:border-gray-500 rounded-lg" style={{ height: '54px', border: '1px solid #0f0f10' }}                  >
                    <SelectValue placeholder="Select a deadline" />
                  </SelectTrigger>
                  <SelectContent>
                    {deadlines.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        <div className="flex items-center justify-between w-full">
                          <span className="flex items-center gap-2">
                            <span className="font-medium">{d.label}</span>
                            <span className="text-gray-500">({d.date})</span>
                          </span>
                          {d.tag && (
                            <span className={`ml-3 text-xs px-2 py-0.5 rounded ${
                              d.tag === 'Best Value' ? 'bg-green-100 text-green-700' :
                              d.tag.includes('Urgent') ? 'bg-orange-100 text-orange-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {d.tag}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Error Message */}
              {errors.deadline && touched.deadline && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  {errors.deadline}
                </p>
              )}
              
              {/* Help Text */}
              {!errors.deadline && (
                <p className="text-xs text-gray-800 text-center" style={{ marginTop: '-6px' }}>Tighter deadlines include a rush fee.</p>
              )}
            </div>
          </div>

          {/* Row 2: File Upload Decision (Full Width) */}
          <div className="space-y-4 lg:space-y-6">
  
  {/* File Upload Choice - Mandatory */}
  <div className="space-y-3">
    <Label className="flex items-center gap-2 text-base font-semibold text-black mb-4">
      <PaperClipIcon className="w-5 h-5" />
      Do you have files to attach?<span className="text-red-500">*</span>
    </Label>
    
    {/* Yes/No Toggle Buttons */}
<div className="flex gap-8">
<button
  type="button"
  onClick={(e) => {
    e.preventDefault()
    e.stopPropagation()
    onChange('hasFiles', true)
  }}
  className={`flex-1 font-medium transition-all rounded-lg ${
    data.hasFiles === true 
      ? 'bg-black text-white' 
      : 'bg-white text-gray-700 hover:bg-gray-50'
  }`}
  style={{ 
    height: '54px', 
    border: data.hasFiles === true ? '1px solid #000000' : '1px solid #0f0f10'
  }}
>
  <span className="sm:hidden">📎 Yes</span>
  <span className="hidden sm:inline">📎 Yes, I have files to attach</span>
</button>
  
<button
  type="button"
  onClick={(e) => {
    e.preventDefault()
    e.stopPropagation()
    onChange('hasFiles', false)
    onChange('files', [])
  }}
  className={`flex-1 font-medium transition-all rounded-lg ${
    data.hasFiles === false 
      ? 'bg-black text-white' 
      : 'bg-white text-gray-700 hover:bg-gray-50'
  }`}
  style={{ 
    height: '54px', 
    border: data.hasFiles === false ? '1px solid #000000' : '1px solid #0f0f10'
  }}
>
  <span className="sm:hidden">❌ No</span>
  <span className="hidden sm:inline">❌ No files to attach</span>
</button>
</div>

    {/* Error for not selecting */}
    {data.hasFiles === undefined && touched.files && (
      <p className="text-sm text-red-600 flex items-center gap-1">
        <ExclamationTriangleIcon className="h-4 w-4" />
        Please choose whether you want to attach files
      </p>
    )}
  </div>

  {/* File Upload Component - Full Width */}
  {data.hasFiles === true && (
    <div className="border-t pt-4 lg:pt-6">
      <FileUpload
        files={data.files || []}
        onChange={(files) => {
          onChange('files', files)
        }}
        maxFiles={5}
        maxSizePerFile={10}
        acceptedTypes={['pdf', 'doc', 'docx', 'txt', 'rtf', 'ppt', 'pptx']}
      />
    </div>
  )}
</div>

          {/* Mobile Price Preview */}
          {isValid && (
            <div className="lg:hidden bg-purple-50 border border-purple-200 rounded-xl p-6 mt-8">
              <h3 className="text-lg font-semibold text-purple-900 mb-4 text-center">
                💰 Your Price Quote
              </h3>
              
              {(() => {
                const pricing = calculateEnhancedPricing({
                  serviceType: previousData?.serviceType as any || 'writing',
                  pages: data.pages,
                  deadline: data.deadline,
                  documentType: previousData?.documentType || 'essay',
                })
                
                return (
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-900 mb-2">
                      ${pricing.totalPrice.toFixed(2)}
                    </div>
                    <p className="text-sm text-purple-700 mb-4">
                      ${pricing.pricePerPage.toFixed(2)} per page • {data.pages} page{data.pages > 1 ? 's' : ''}
                    </p>
                    
                    {/* Price breakdown */}
                    <div className="bg-white rounded-lg p-4 text-left space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Base Price:</span>
                        <span>${pricing.basePrice.toFixed(2)}</span>
                      </div>
                      {pricing.savings > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount:</span>
                          <span>-${pricing.savings.toFixed(2)}</span>
                        </div>
                      )}
                      {pricing.rushFee > 0 && (
                        <div className="flex justify-between text-orange-600">
                          <span>Rush Fee:</span>
                          <span>+${pricing.rushFee.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })()}
            </div>
          )}

          {/* Navigation */}
          <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between pt-6">
          <Button
  type="button"
  onClick={onBack}
  disabled={isSubmitting}
  className="h-12 px-6 rounded-lg bg-black text-white hover:bg-gray-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 font-medium sm:w-auto w-full"
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
                  Continue to Checkout
                  <ArrowRightIcon className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-gray-800 text-center">
            You can review your order details on the next page.
          </p>
        </form>
      </Card>
    </div>
  )
}