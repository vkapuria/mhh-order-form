'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface FinalDetailsProps {
  data: {
    fullName: string
    instructions: string
    referenceStyle: string
  }
  onChange: (field: string, value: string) => void
  onSubmit: () => void
  onBack: () => void
  isSubmitting?: boolean
}

const referenceStyles = [
  { value: 'apa', label: 'APA' },
  { value: 'mla', label: 'MLA' },
  { value: 'chicago', label: 'Chicago' },
  { value: 'harvard', label: 'Harvard' },
  { value: 'none', label: 'None' },
]

export default function FinalDetails({ 
  data, 
  onChange, 
  onSubmit, 
  onBack, 
  isSubmitting = false 
}: FinalDetailsProps) {
  const isValid = data.fullName.trim() && data.instructions.trim().length >= 20 && data.referenceStyle
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isValid) {
      onSubmit()
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Final Details
        </h2>
        <p className="text-gray-600">
          Just a few more details to complete your order
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Full Name */}
        <div>
          <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
            Full Name
          </Label>
          <Input
            id="fullName"
            type="text"
            value={data.fullName}
            onChange={(e) => onChange('fullName', e.target.value)}
            placeholder="Enter your full name"
            className="mt-1"
          />
        </div>

        {/* Reference Style */}
        <div>
          <Label htmlFor="referenceStyle" className="text-sm font-medium text-gray-700">
            Reference Style
          </Label>
          <Select value={data.referenceStyle} onValueChange={(value) => onChange('referenceStyle', value)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select reference style" />
            </SelectTrigger>
            <SelectContent>
              {referenceStyles.map((style) => (
                <SelectItem key={style.value} value={style.value}>
                  {style.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Instructions */}
        <div>
          <Label htmlFor="instructions" className="text-sm font-medium text-gray-700">
            Assignment Instructions
          </Label>
          <Textarea
            id="instructions"
            value={data.instructions}
            onChange={(e) => onChange('instructions', e.target.value)}
            placeholder="Provide detailed instructions for your assignment (minimum 20 characters)..."
            rows={4}
            className="mt-1"
          />
          <p className="mt-1 text-xs text-gray-500">
            Characters: {data.instructions.length}/20 minimum
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
            Back
          </Button>
          <Button type="submit" disabled={!isValid || isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Complete Order'}
          </Button>
        </div>
      </form>
    </div>
  )
}