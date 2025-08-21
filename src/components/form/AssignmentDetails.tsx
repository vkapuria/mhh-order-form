'use client'

import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  DocumentTextIcon,
  AcademicCapIcon,
  HashtagIcon,
  ClockIcon,
  MinusIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'
import type { ServiceType } from '@/types'

interface AssignmentDetailsProps {
  serviceType: ServiceType
  data: {
    subject: string
    documentType: string
    pages: number
    deadline: string
  }
  onChange: (field: string, value: string | number) => void
  onNext: () => void
  onBack: () => void
}

/* ----------------------- Quick-pick chip configurations ----------------------- */

const writingDocumentChips = [
  { value: 'essay', label: 'Essay' },
  { value: 'research_paper', label: 'Research paper' },
  { value: 'term_paper', label: 'Assignment' },
  { value: 'case_study', label: 'Case study' },
]

const editingDocumentChips = [
  { value: 'essay', label: 'Essay' },
  { value: 'research_paper', label: 'Research paper' },
  { value: 'article', label: 'Article' },
  { value: 'thesis', label: 'Thesis' },
]

const presentationDocumentChips = [
  { value: 'business_presentation', label: 'Business' },
  { value: 'academic_presentation', label: 'Academic' },
  { value: 'pitch_deck', label: 'Pitch deck' },
  { value: 'project_presentation', label: 'Project' },
]

const subjectChips = [
  { value: 'english', label: 'English' },
  { value: 'psychology', label: 'Psychology' },
  { value: 'nursing', label: 'Nursing' },
  { value: 'business', label: 'Business' },
  { value: 'history', label: 'History' },
]

const allSubjects = [
  ...subjectChips,
  { value: 'sociology', label: 'Sociology' },
  { value: 'economics', label: 'Economics' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'management', label: 'Management' },
  { value: 'education', label: 'Education' },
  { value: 'other', label: 'Other' },
]

const allWritingDocuments = [
  ...writingDocumentChips,
  { value: 'dissertation', label: 'Dissertation' },
  { value: 'thesis', label: 'Thesis' },
  { value: 'report', label: 'Report' },
  { value: 'other', label: 'Other' },
]

const allEditingDocuments = [
  ...editingDocumentChips,
  { value: 'dissertation', label: 'Dissertation' },
  { value: 'report', label: 'Report' },
  { value: 'other', label: 'Other' },
]

const allPresentationDocuments = [
  ...presentationDocumentChips,
  { value: 'conference_presentation', label: 'Conference Presentation' },
  { value: 'other', label: 'Other' },
]

const deadlines = [
  { value: '14', label: '14 Days (Best Value)', discount: '15% off' },
  { value: '10', label: '10 Days (Economy)', discount: '10% off' },
  { value: '7', label: '7 Days (Standard)', discount: '' },
  { value: '5', label: '5 Days (Slightly Rushed)', premium: '+5%' },
  { value: '3', label: '3 Days (Rush Service)', premium: '+10%' },
  { value: '2', label: '48 Hours (Urgent)', premium: '+20%' },
  { value: '1', label: '24 Hours (Very Urgent)', premium: '+30%' },
]

/* --------------------------------- Component --------------------------------- */

export default function AssignmentDetails({
  serviceType,
  data,
  onChange,
  onNext,
  onBack,
}: AssignmentDetailsProps) {
  const documentChips = useMemo(() => {
    switch (serviceType) {
      case 'editing':
        return editingDocumentChips
      case 'presentation':
        return presentationDocumentChips
      default:
        return writingDocumentChips
    }
  }, [serviceType])

  const allDocumentTypes = useMemo(() => {
    switch (serviceType) {
      case 'editing':
        return allEditingDocuments
      case 'presentation':
        return allPresentationDocuments
      default:
        return allWritingDocuments
    }
  }, [serviceType])

  const documentTypeLabel = serviceType === 'presentation' ? 'Type of presentation' : 'Type of paper'
  const pageLabel = serviceType === 'presentation' ? 'Number of Slides' : 'Number of Pages'
  const serviceDescription =
    serviceType === 'presentation'
      ? 'Tell us about your presentation project'
      : serviceType === 'editing'
      ? 'Tell us about your editing project'
      : 'Tell us about your writing project'

  const isValid = Boolean(data.subject && data.documentType && data.pages > 0 && data.deadline)

  const min = 1
  const max = serviceType === 'presentation' ? 100 : 50

  const increment = (step = 1) => {
    const next = Math.min(max, (data.pages || 0) + step)
    onChange('pages', next)
  }
  const decrement = (step = 1) => {
    const next = Math.max(min, (data.pages || 0) - step)
    onChange('pages', next)
  }

  const wordsApprox = !serviceType.includes('presentation') && data.pages > 0 ? data.pages * 275 : null
  const talkTimeApprox =
    serviceType === 'presentation' && data.pages > 0 ? Math.round(data.pages * 1.5) : null

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-gray-900">Assignment Details</h2>
        <p className="text-gray-600">{serviceDescription}</p>
      </div>

      {/* Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (isValid) onNext()
        }}
        className="space-y-8"
      >
        {/* Document Type */}
        <section>
          <Label className="text-base font-medium text-gray-800 flex items-center gap-2 mb-3">
            <DocumentTextIcon className="w-5 h-5 text-gray-500" />
            {documentTypeLabel}
          </Label>

          {/* Quick chips */}
          <div className="flex flex-wrap gap-2 mb-3">
            {documentChips.map((doc) => {
              const active = data.documentType === doc.value
              return (
                <Badge
                  key={doc.value}
                  variant={active ? 'default' : 'outline'}
                  className={[
                    'cursor-pointer px-3 py-1 transition-all',
                    active
                      ? 'bg-blue-600 hover:bg-blue-600 text-white'
                      : 'hover:bg-blue-50 hover:border-blue-300',
                  ].join(' ')}
                  onClick={() => onChange('documentType', doc.value)}
                >
                  {doc.label}
                </Badge>
              )
            })}
          </div>

          {/* Full list */}
          <Select value={data.documentType} onValueChange={(v) => onChange('documentType', v)}>
            <SelectTrigger>
              <SelectValue placeholder={`Select ${serviceType === 'presentation' ? 'presentation type' : 'document type'}`} />
            </SelectTrigger>
            <SelectContent>
              {allDocumentTypes.map((doc) => (
                <SelectItem key={doc.value} value={doc.value}>
                  {doc.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </section>

        {/* Subject */}
        <section>
          <Label className="text-base font-medium text-gray-800 flex items-center gap-2 mb-3">
            <AcademicCapIcon className="w-5 h-5 text-gray-500" />
            Subject
          </Label>

          {/* Quick chips */}
          <div className="flex flex-wrap gap-2 mb-3">
            {subjectChips.map((s) => {
              const active = data.subject === s.value
              return (
                <Badge
                  key={s.value}
                  variant={active ? 'default' : 'outline'}
                  className={[
                    'cursor-pointer px-3 py-1 transition-all',
                    active
                      ? 'bg-blue-600 hover:bg-blue-600 text-white'
                      : 'hover:bg-blue-50 hover:border-blue-300',
                  ].join(' ')}
                  onClick={() => onChange('subject', s.value)}
                >
                  {s.label}
                </Badge>
              )
            })}
          </div>

          {/* Full list */}
          <Select value={data.subject} onValueChange={(v) => onChange('subject', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              {allSubjects.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </section>

        {/* Pages & Deadline */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Pages / Slides with stepper */}
          <div>
            <Label className="text-base font-medium text-gray-800 flex items-center gap-2 mb-2">
              <HashtagIcon className="w-5 h-5 text-gray-500" />
              {pageLabel}
            </Label>

            <div className="flex items-stretch border border-gray-200 rounded-lg overflow-hidden w-full max-w-xs">
              <button
                type="button"
                aria-label="Decrease"
                className="px-3 md:px-4 hover:bg-gray-50 disabled:opacity-40"
                onClick={() => decrement(1)}
                disabled={(data.pages || 0) <= min}
              >
                <MinusIcon className="w-4 h-4 text-gray-600" />
              </button>

              <Input
                inputMode="numeric"
                type="number"
                min={min}
                max={max}
                value={data.pages || ''}
                onChange={(e) => {
                  const raw = parseInt(e.target.value || '0', 10)
                  const clamped = Math.max(min, Math.min(max, isNaN(raw) ? 0 : raw))
                  onChange('pages', clamped)
                }}
                className="border-0 text-center rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder={`Enter ${serviceType === 'presentation' ? 'slides' : 'pages'}`}
              />

              <button
                type="button"
                aria-label="Increase"
                className="px-3 md:px-4 hover:bg-gray-50 disabled:opacity-40"
                onClick={() => increment(1)}
                disabled={(data.pages || 0) >= max}
              >
                <PlusIcon className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Helpers */}
            {talkTimeApprox !== null && (
              <p className="mt-2 text-xs text-gray-500">
                ≈ {talkTimeApprox}-minute presentation
              </p>
            )}
            {wordsApprox !== null && (
              <p className="mt-2 text-xs text-gray-500">
                ≈ {wordsApprox.toLocaleString()} words
              </p>
            )}
          </div>

          {/* Deadline */}
          <div>
            <Label className="text-base font-medium text-gray-800 flex items-center gap-2 mb-2">
              <ClockIcon className="w-5 h-5 text-gray-500" />
              Deadline
            </Label>
            <Select value={data.deadline} onValueChange={(v) => onChange('deadline', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select deadline" />
              </SelectTrigger>
              <SelectContent>
                {deadlines.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    <div className="flex items-center justify-between w-full">
                      <span>{d.label}</span>
                      {d.discount && (
                        <span className="ml-3 text-green-600 text-xs font-medium">{d.discount}</span>
                      )}
                      {d.premium && (
                        <span className="ml-3 text-orange-600 text-xs font-medium">{d.premium}</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="mt-2 text-xs text-gray-500">The deadline affects the final price</p>
          </div>
        </section>

        {/* Desktop nav */}
        <div className="hidden md:flex justify-between pt-2">
          <Button type="button" variant="outline" onClick={onBack} className="px-6">
            Back
          </Button>
          <Button type="submit" disabled={!isValid} className="px-6">
            Continue to Final Details
          </Button>
        </div>

        {/* Mobile sticky footer nav */}
        <div className="md:hidden fixed left-0 right-0 bottom-0 z-20 border-t border-gray-200 bg-white/95 backdrop-blur px-4 py-3">
          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={onBack}>
              Back
            </Button>
            <Button type="submit" className="flex-1" disabled={!isValid}>
              Continue
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
