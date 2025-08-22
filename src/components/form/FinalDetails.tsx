'use client'

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
  CheckIcon,
} from '@heroicons/react/24/outline'

interface FinalDetailsProps {
  data: {
    deadline: string
    referenceStyle: string
    pages: number
    hasFiles: boolean
  }
  previousData?: {
    serviceType: string
    fullName: string
    email: string
    subject: string
    documentType: string
    instructions: string
  }
  onChange: (field: string, value: string | number | boolean) => void
  onSubmit: () => void
  onBack: () => void
  isSubmitting?: boolean
}

const deadlineChips = ['7 Days', '5 Days', '3 Days']
const referenceChips = ['APA', 'MLA', 'Chicago', 'None']

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

      {/* Main Form Card */}
      <Card className="p-8 shadow-sm border-gray-200">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">When do you need it?</h2>
          <p className="text-gray-600 mt-2">
            Set your timeline and preferences
          </p>
        </div>

        {/* Form */}
        <form onSubmit={(e) => { e.preventDefault(); if (isValid) onSubmit() }} className="space-y-8">
          
          {/* ROW 1: Deadline + Reference Style */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            
            {/* LEFT: Deadline */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-base font-medium text-gray-700">
                <ClockIcon className="w-5 h-5" />
                Deadline
              </Label>
              
              <Select value={data.deadline} onValueChange={(v) => onChange('deadline', v)}>
                <SelectTrigger className="w-full h-10 text-base border-gray-400 focus:border-gray-500">
                  <SelectValue placeholder="Select deadline" />
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
              
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-600 italic">Popular:</span>
                {deadlineChips.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => onChange('deadline', chip.split(' ')[0])}
                    className={`
                      px-3 py-1 rounded-full text-sm border transition-all
                      ${data.deadline === chip.split(' ')[0]
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

            {/* RIGHT: Reference Style */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-base font-medium text-gray-700">
                <DocumentDuplicateIcon className="w-5 h-5" />
                Reference Style
              </Label>
              
              <Select value={data.referenceStyle} onValueChange={(v) => onChange('referenceStyle', v)}>
                <SelectTrigger className="w-full h-10 text-base border-gray-400 focus:border-gray-500">
                  <SelectValue placeholder="Select or type to search..." />
                </SelectTrigger>
                <SelectContent>
                  {referenceStyles.map((style) => (
                    <SelectItem key={style.value} value={style.value}>
                      {style.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-600 italic">Popular:</span>
                {referenceChips.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => onChange('referenceStyle', chip.toLowerCase())}
                    className={`
                      px-3 py-1 rounded-full text-sm border transition-all
                      ${data.referenceStyle === chip.toLowerCase()
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

          {/* ROW 2: Pages + File Attachment */}
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
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-400 hover:bg-gray-50 disabled:opacity-40"
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
                  className="flex-1 h-10 text-base text-center border-gray-400 focus:border-gray-500"
                  placeholder="0"
                />
                
                <button
                  type="button"
                  onClick={() => onChange('pages', Math.min(100, (data.pages || 0) + 1))}
                  disabled={(data.pages || 0) >= 100}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-400 hover:bg-gray-50 disabled:opacity-40"
                >
                  <PlusIcon className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              
              {data.pages > 0 && (
                <p className="text-sm text-gray-500">
                  ≈ {(data.pages * 275).toLocaleString()} words
                </p>
              )}
            </div>

            {/* RIGHT: File Attachment */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-base font-medium text-gray-700">
                <PaperClipIcon className="w-5 h-5" />
                Have files to attach?
              </Label>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => onChange('hasFiles', false)}
                  className={`
                    flex-1 h-10 px-4 rounded-lg border transition-all
                    ${!data.hasFiles
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'
                    }
                  `}
                >
                  No
                </button>
                <button
                  type="button"
                  onClick={() => onChange('hasFiles', true)}
                  className={`
                    flex-1 h-10 px-4 rounded-lg border transition-all
                    ${data.hasFiles
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'
                    }
                  `}
                >
                  Yes
                </button>
              </div>
              
              <p className="text-xs text-gray-500">
                {data.hasFiles ? "You'll upload files after order" : "Please select Yes or No"}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onBack}
              disabled={isSubmitting}
              className="px-8 h-10 text-base bg-white text-black border-black hover:bg-gray-50 flex items-center gap-2"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back
            </Button>
            
            <Button 
              type="submit" 
              disabled={!isValid || isSubmitting}
              className="px-8 h-10 text-base bg-[#8800e9] text-white hover:bg-[#7700d0] disabled:bg-gray-300 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>Processing...</>
              ) : (
                <>
                  Complete Order
                  <CheckIcon className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}