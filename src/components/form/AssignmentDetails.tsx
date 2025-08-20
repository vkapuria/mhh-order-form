'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ServiceType } from '@/types'

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

const subjects = [
  { value: 'business', label: 'Business' },
  { value: 'psychology', label: 'Psychology' },
  { value: 'english', label: 'English' },
  { value: 'history', label: 'History' },
  { value: 'sociology', label: 'Sociology' },
  { value: 'nursing', label: 'Nursing' },
  { value: 'economics', label: 'Economics' },
  { value: 'other', label: 'Other' },
]

const writingDocuments = [
  { value: 'essay', label: 'Essay' },
  { value: 'research_paper', label: 'Research Paper' },
  { value: 'term_paper', label: 'Term Paper' },
  { value: 'case_study', label: 'Case Study' },
  { value: 'dissertation', label: 'Dissertation' },
  { value: 'thesis', label: 'Thesis' },
  { value: 'other', label: 'Other' },
]

const editingDocuments = [
  { value: 'essay', label: 'Essay' },
  { value: 'research_paper', label: 'Research Paper' },
  { value: 'dissertation', label: 'Dissertation' },
  { value: 'thesis', label: 'Thesis' },
  { value: 'article', label: 'Article' },
  { value: 'other', label: 'Other' },
]

const deadlines = [
  { value: '14', label: '14 Days (Best Value)' },
  { value: '10', label: '10 Days (Economy)' },
  { value: '7', label: '7 Days (Standard)' },
  { value: '5', label: '5 Days (Slightly Rushed)' },
  { value: '3', label: '3 Days (Rush Service)' },
  { value: '2', label: '48 Hours (Urgent)' },
  { value: '1', label: '24 Hours (Very Urgent)' },
]

export default function AssignmentDetails({ 
  serviceType, 
  data, 
  onChange, 
  onNext, 
  onBack 
}: AssignmentDetailsProps) {
  const documentTypes = serviceType === 'writing' ? writingDocuments : editingDocuments
  
  const isValid = data.subject && data.documentType && data.pages > 0 && data.deadline
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isValid) {
      onNext()
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Assignment Details
        </h2>
        <p className="text-gray-600">
          Tell us about your {serviceType} project
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Subject */}
          <div>
            <Label htmlFor="subject" className="text-sm font-medium text-gray-700">
              Subject
            </Label>
            <Select value={data.subject} onValueChange={(value) => onChange('subject', value)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.value} value={subject.value}>
                    {subject.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Document Type */}
          <div>
            <Label htmlFor="documentType" className="text-sm font-medium text-gray-700">
              Document Type
            </Label>
            <Select value={data.documentType} onValueChange={(value) => onChange('documentType', value)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((doc) => (
                  <SelectItem key={doc.value} value={doc.value}>
                    {doc.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Pages */}
          <div>
            <Label htmlFor="pages" className="text-sm font-medium text-gray-700">
              Number of Pages
            </Label>
            <Input
              id="pages"
              type="number"
              min="1"
              max="50"
              value={data.pages || ''}
              onChange={(e) => onChange('pages', parseInt(e.target.value) || 0)}
              placeholder="Enter number of pages"
              className="mt-1"
            />
          </div>

          {/* Deadline */}
          <div>
            <Label htmlFor="deadline" className="text-sm font-medium text-gray-700">
              Deadline
            </Label>
            <Select value={data.deadline} onValueChange={(value) => onChange('deadline', value)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select deadline" />
              </SelectTrigger>
              <SelectContent>
                {deadlines.map((deadline) => (
                  <SelectItem key={deadline.value} value={deadline.value}>
                    {deadline.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="submit" disabled={!isValid}>
            Continue to Final Details
          </Button>
        </div>
      </form>
    </div>
  )
}