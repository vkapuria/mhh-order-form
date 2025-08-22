'use client'

import { useMemo } from 'react'
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
} from '@heroicons/react/24/outline'
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

const writingDocumentChips = ['Essay', 'Research Paper', 'Other']
const editingDocumentChips = ['Essay', 'Article', 'Thesis']
const presentationDocumentChips = ['Business', 'Academic', 'Pitch Deck']
const subjectChips = ['Business', 'Psychology', 'English']

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
  const documentChips = useMemo(() => {
    switch (serviceType) {
      case 'editing': return editingDocumentChips
      case 'presentation': return presentationDocumentChips
      default: return writingDocumentChips
    }
  }, [serviceType])

  const isValid = Boolean(data.subject && data.documentType)

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
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
      <Card className="p-8 shadow-sm border-gray-200">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">What do you need help with?</h2>
          <p className="text-gray-600 mt-2">
            Tell us about your assignment so we can match you with the perfect expert
          </p>
        </div>

        {/* Form */}
        <form onSubmit={(e) => { e.preventDefault(); if (isValid) onNext() }} className="space-y-8">
          
          {/* ROW 1: Subject + Document Type */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            
            {/* LEFT: Subject */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-base font-medium text-gray-700">
                <AcademicCapIcon className="w-5 h-5" />
                Select Subject
              </Label>
              
              <Select value={data.subject} onValueChange={(v) => onChange('subject', v)}>
                <SelectTrigger className="w-full h-10 text-base border-gray-400 focus:border-gray-500">
                  <SelectValue placeholder="Select or type to search..." />
                </SelectTrigger>
                <SelectContent>
                  {allSubjects.map((subj) => (
                    <SelectItem key={subj.value} value={subj.value}>
                      {subj.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-600 italic">Popular:</span>
                {subjectChips.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => onChange('subject', chip.toLowerCase())}
                    className={`
                      px-3 py-1 rounded-full text-sm border transition-all
                      ${data.subject === chip.toLowerCase()
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                      }
                    `}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* RIGHT: Document Type */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-base font-medium text-gray-700">
                <DocumentTextIcon className="w-5 h-5" />
                {serviceType === 'presentation' ? 'Assignment Type' : 'Type of paper'}
              </Label>
              
              <Select value={data.documentType} onValueChange={(v) => onChange('documentType', v)}>
                <SelectTrigger className="w-full h-10 text-base border-gray-400 focus:border-gray-500">
                  <SelectValue placeholder="Select or type to search..." />
                </SelectTrigger>
                <SelectContent>
                  {allDocumentTypes.map((doc) => (
                    <SelectItem key={doc.value} value={doc.value}>
                      {doc.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-600 italic">Popular:</span>
                {documentChips.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => onChange('documentType', chip.toLowerCase().replace(' ', '_'))}
                    className={`
                      px-3 py-1 rounded-full text-sm border transition-all
                      ${data.documentType === chip.toLowerCase().replace(' ', '_')
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                      }
                    `}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ROW 2: Instructions (Full Width) */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base font-medium text-gray-700">
              <PencilSquareIcon className="w-5 h-5" />
              Assignment Instructions
              <span className="text-sm text-gray-500 font-normal">(Optional)</span>
            </Label>
            
            <Textarea
              value={data.instructions}
              onChange={(e) => onChange('instructions', e.target.value)}
              placeholder="Provide any specific requirements, topics to cover, sources to use, or other important details..."
              className="min-h-[120px] text-base border-gray-400 focus:border-gray-500 resize-none"
              rows={5}
            />
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onBack}
              className="px-8 h-10 text-base bg-white text-black border-black hover:bg-gray-50 flex items-center gap-2"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back
            </Button>
            
            <Button 
              type="submit" 
              disabled={!isValid}
              className="px-8 h-10 text-base bg-black text-white hover:bg-gray-800 disabled:bg-gray-300 flex items-center gap-2"
            >
              Continue to Final Details
              <ArrowRightIcon className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}