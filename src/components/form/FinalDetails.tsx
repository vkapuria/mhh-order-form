'use client'

import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import StepSummary from './StepSummary'
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
} from '@heroicons/react/24/outline'

interface FinalDetailsProps {
  data: {
    deadline: string
    referenceStyle: string
    pages: number
    hasFiles: boolean
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

export default function FinalDetails({
  data,
  previousData,
  onChange,
  onSubmit,
  onBack,
  isSubmitting = false
}: FinalDetailsProps) {
  const isValid = Boolean(data.deadline && data.referenceStyle && data.pages > 0)
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
      }, 1000) // 🎯 LONGEST DELAY - Let user see green Steps 1, 2 & 3
    }
  }, [])

  const handleFilesChange = (filesList: FileList | null) => {
    const arr = filesList ? Array.from(filesList) : []
    onChange('files', arr)
    onChange('hasFiles', arr.length > 0)
  }

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

      {/* 🎯 MAIN FORM CARD WITH AUTO-SCROLL REF */}
      <Card ref={mainFormRef} className="p-8 shadow-sm border-gray-200">
        {/* 🎯 GPT-STYLE LEFT-ALIGNED HEADER */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Final details</h2>
          <p className="text-gray-600 text-base">
            Set pages and deadline. You can attach files if needed.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={(e) => { e.preventDefault(); if (isValid) onSubmit() }} className="space-y-8">
          
          {/* ROW 1: Pages + Deadline */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            
            {/* LEFT: Pages */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-base font-medium text-gray-700">
                <HashtagIcon className="w-5 h-5" />
                Number of Pages
              </Label>
              
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onChange('pages', Math.max(1, (data.pages || 1) - 1))}
                  disabled={(data.pages || 0) <= 1}
                  className="w-10 h-9 flex items-center justify-center rounded-xl border border-gray-400 hover:bg-gray-50 disabled:opacity-40"
                >
                  <MinusIcon className="w-4 h-4 text-gray-600" />
                </button>
                
                <Input
  type="number"
  value={data.pages || ''}
  onChange={(e) => {
    const val = parseInt(e.target.value) || 0
    onChange('pages', Math.max(1, Math.min(100, val)))
  }}
  className="flex-1 h-9 text-base text-center border-gray-400 focus:border-gray-500 rounded-xl focus:ring-0 focus-visible:ring-0"
  placeholder="0"
/>
                
                <button
                  type="button"
                  onClick={() => onChange('pages', Math.min(100, (data.pages || 0) + 1))}
                  disabled={(data.pages || 0) >= 100}
                  className="w-10 h-9 flex items-center justify-center rounded-xl border border-gray-400 hover:bg-gray-50 disabled:opacity-40"
                >
                  <PlusIcon className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              
              {/* 🎯 GPT-STYLE HELPFUL SUBTEXT */}
              <p className="text-xs text-gray-500 -mt-2">Most essays are ~275 words per page.</p>
            </div>

            {/* RIGHT: Deadline */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-base font-medium text-gray-700">
                <ClockIcon className="w-5 h-5" />
                Deadline
              </Label>
              
              <Select value={data.deadline} onValueChange={(v) => onChange('deadline', v)}>
  <SelectTrigger className="w-full h-11 text-base border-gray-400 focus:border-gray-500 rounded-xl">
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
              
              {/* 🎯 GPT-STYLE HELPFUL SUBTEXT */}
              <p className="text-xs text-gray-500 -mt-2">Tighter deadlines may include a rush fee.</p>
            </div>
          </div>

          {/* ROW 2: Reference Style + Files */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            
            {/* LEFT: Reference Style */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-base font-medium text-gray-700">
                <DocumentDuplicateIcon className="w-5 h-5" />
                Reference Style
              </Label>
              
              <Select value={data.referenceStyle} onValueChange={(v) => onChange('referenceStyle', v)}>
                <SelectTrigger className="w-full h-11 text-base border-gray-400 focus:border-gray-500 rounded-xl">
                  <SelectValue placeholder="Select a style" />
                </SelectTrigger>
                <SelectContent>
                  {referenceStyles.map((style) => (
                    <SelectItem key={style.value} value={style.value}>
                      {style.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* 🎯 GPT-STYLE HELPFUL SUBTEXT */}
              <p className="text-xs text-gray-500 -mt-2">APA is the most common.</p>
            </div>

            {/* RIGHT: Files */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-base font-medium text-gray-700">
                <PaperClipIcon className="w-5 h-5" />
                Attach files (optional)
              </Label>
              
              {/* 🎯 GPT-STYLE SIMPLE CHECKBOX APPROACH */}
              <div className="flex items-center gap-2 mb-3">
                <input
                  id="hasFiles"
                  type="checkbox"
                  checked={!!data.hasFiles}
                  onChange={(e) => onChange('hasFiles', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500"
                />
                <Label htmlFor="hasFiles" className="text-sm text-gray-700">
                  Yes, I want to attach files (rubric, sources, drafts)
                </Label>
              </div>

              {/* File Upload Area */}
              <div className={`${data.hasFiles ? 'block' : 'hidden'}`}>
                <label
                  htmlFor="files"
                  className="flex items-center justify-center gap-2 w-full rounded-xl border border-dashed border-gray-300 p-4 text-sm text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  <PaperClipIcon className="w-4 h-4" />
                  Click to choose files (PDF, DOCX, PPTX, TXT)
                </label>
                <input
                  id="files"
                  type="file"
                  multiple
                  className="sr-only"
                  onChange={(e) => handleFilesChange(e.target.files)}
                />

                {/* Selected files preview */}
                {data.files && data.files.length > 0 && (
                  <ul className="mt-3 space-y-1 text-xs text-gray-600">
                    {data.files.map((f, idx) => (
                      <li key={idx} className="truncate">
                        {f.name} <span className="text-gray-400">({Math.ceil(f.size / 1024)} KB)</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Navigation - MY CONSISTENT BUTTON STYLING */}
          <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between pt-6">
            <Button
              type="button"
              onClick={onBack}
              disabled={isSubmitting}
              className="h-12 px-6 rounded-lg border-2 border-gray-900 bg-white text-gray-900 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 font-medium sm:w-auto w-full"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back
            </Button>
            
            <Button 
              type="submit" 
              disabled={!isValid || isSubmitting}
              className="h-12 px-6 rounded-lg border-2 border-gray-900 bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-300 disabled:border-gray-300 disabled:text-gray-500 transition-colors flex items-center justify-center gap-2 font-medium sm:w-auto w-full"
            >
              {isSubmitting ? (
                <>Processing...</>
              ) : (
                <>
                  Continue to Secure Checkout
                  <ArrowRightIcon className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>

          {/* 🎯 GPT-STYLE HELPFUL "WHAT'S NEXT" TEXT */}
          <p className="text-xs text-gray-500 text-center">
            You can review your details on the next page.
          </p>
        </form>
      </Card>
    </div>
  )
}