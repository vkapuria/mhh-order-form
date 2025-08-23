'use client'

import { useMemo, useEffect, useRef } from 'react'
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
  const isValid = Boolean(data.subject && data.documentType)
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
      }, 800) // 🎯 LONGER DELAY - Let user see green Steps 1 & 2
    }
  }, [])

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

      {/* 🎯 MAIN FORM CARD WITH AUTO-SCROLL REF */}
      <Card ref={mainFormRef} className="p-8 shadow-sm border-gray-200">
        {/* Header - LEFT ALIGNED */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-1">What do you need help with?</h2>
          <p className="text-gray-600 text-base">
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
                <SelectTrigger className="w-full h-11 text-base border-gray-400 focus:border-gray-500 rounded-xl">
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
              
              {/* 🎯 GPT-STYLE SUBTEXT */}
              <p className="text-xs text-gray-500 -mt-2">We'll match a subject expert.</p>
            </div>

            {/* RIGHT: Document Type */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-base font-medium text-gray-700">
                <DocumentTextIcon className="w-5 h-5" />
                {serviceType === 'presentation' ? 'Assignment Type' : 'Type of paper'}
              </Label>
              
              <Select value={data.documentType} onValueChange={(v) => onChange('documentType', v)}>
                <SelectTrigger className="w-full h-11 text-base border-gray-400 focus:border-gray-500 rounded-xl">
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
              
              {/* 🎯 GPT-STYLE SUBTEXT */}
              <p className="text-xs text-gray-500 -mt-2">Essay, report, presentation, and more.</p>
            </div>
          </div>

          {/* ROW 2: Instructions (Full Width) */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base font-medium text-gray-700">
              <PencilSquareIcon className="w-5 h-5" />
              Assignment Instructions
            </Label>
            
            <Textarea
              value={data.instructions}
              onChange={(e) => onChange('instructions', e.target.value)}
              placeholder="Paste your prompt, key points, or professor's rubric here…"
              className="min-h-[120px] text-base border-gray-400 focus:border-gray-500 resize-none rounded-xl"
              rows={5}
            />
            
            {/* 🎯 GPT-STYLE SUBTEXT */}
            <p className="text-xs text-gray-500 -mt-2">
              Helpful: formatting, sources, or any must-follow guidance.
            </p>
          </div>

          {/* Navigation - MY CONSISTENT BUTTON STYLING */}
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
              Continue to Final Details
              <ArrowRightIcon className="w-4 h-4" />
            </Button>
          </div>

          {/* 🎯 GPT-STYLE "WHAT'S NEXT" TEXT */}
          <p className="text-xs text-gray-500 text-center">
            You can attach files in the next step.
          </p>
        </form>
      </Card>
    </div>
  )
}