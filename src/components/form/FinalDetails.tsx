'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UserIcon, DocumentTextIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

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
  { value: 'apa', label: 'APA (American Psychological Association)' },
  { value: 'mla', label: 'MLA (Modern Language Association)' },
  { value: 'chicago', label: 'Chicago/Turabian' },
  { value: 'harvard', label: 'Harvard' },
  { value: 'ieee', label: 'IEEE' },
  { value: 'vancouver', label: 'Vancouver' },
  { value: 'none', label: 'No specific style required' },
]

export default function FinalDetails({ 
  data, 
  onChange, 
  onSubmit, 
  onBack, 
  isSubmitting = false 
}: FinalDetailsProps) {
  const isValid = data.fullName.trim() && data.instructions.trim().length >= 20 && data.referenceStyle
  const instructionLength = data.instructions.trim().length
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isValid) {
      onSubmit()
    }
  }
  
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <CheckCircleIcon className="w-10 h-10 text-purple-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Final Details
        </h2>
        <p className="text-lg text-gray-600">
          Just a few more details to complete your order
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Badge className="bg-green-100 text-green-800">
            <CheckCircleIcon className="w-3 h-3 mr-1" />
            Almost Done!
          </Badge>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-gradient-to-r from-purple-600 to-teal-600 h-2 rounded-full" style={{width: '85%'}}></div>
        </div>
        <p className="text-center text-sm text-gray-500 mt-1">85% Complete</p>
      </div>

      {/* Form */}
      <Card className="max-w-2xl mx-auto p-8 shadow-lg border-2 border-purple-100">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Full Name */}
          <div>
            <Label htmlFor="fullName" className="text-base font-medium text-gray-700 flex items-center mb-3">
              <UserIcon className="w-5 h-5 mr-2 text-purple-600" />
              Full Name
            </Label>
            <Input
              id="fullName"
              type="text"
              value={data.fullName}
              onChange={(e) => onChange('fullName', e.target.value)}
              placeholder="Enter your full name"
              className="h-12 text-base border-gray-300 focus:border-purple-500 focus:ring-purple-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              This will be used for your order confirmation and communication
            </p>
          </div>

          {/* Reference Style */}
          <div>
            <Label htmlFor="referenceStyle" className="text-base font-medium text-gray-700 flex items-center mb-3">
              <DocumentTextIcon className="w-5 h-5 mr-2 text-purple-600" />
              Reference Style
            </Label>
            <Select value={data.referenceStyle} onValueChange={(value) => onChange('referenceStyle', value)}>
              <SelectTrigger className="h-12 text-base border-gray-300 focus:border-purple-500">
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
            <p className="text-xs text-gray-500 mt-1">
              Choose the citation format required for your assignment
            </p>
          </div>

          {/* Instructions */}
          <div>
            <Label htmlFor="instructions" className="text-base font-medium text-gray-700 flex items-center justify-between mb-3">
              <div className="flex items-center">
                <DocumentTextIcon className="w-5 h-5 mr-2 text-purple-600" />
                Assignment Instructions
              </div>
              <Badge variant={instructionLength >= 20 ? "default" : "outline"} className="text-xs">
                {instructionLength}/20 min
              </Badge>
            </Label>
            
            <Textarea
              id="instructions"
              value={data.instructions}
              onChange={(e) => onChange('instructions', e.target.value)}
              placeholder="Provide detailed instructions for your assignment. Include any specific requirements, topics to cover, sources to use, formatting preferences, and any other important details..."
              rows={6}
              className={`text-base resize-none transition-all duration-300 ${
                instructionLength >= 20 
                  ? 'border-green-300 focus:border-green-500 focus:ring-green-500 bg-green-50' 
                  : instructionLength > 0
                    ? 'border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500 bg-yellow-50'
                    : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
              }`}
            />
            
            <div className="mt-3 flex items-start space-x-3">
              {instructionLength >= 20 ? (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircleIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">Perfect! Detailed instructions help us deliver better work.</span>
                </div>
              ) : instructionLength > 0 ? (
                <div className="flex items-center space-x-2 text-yellow-600">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  <span className="text-sm">Please provide more details (minimum 20 characters)</span>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  The more details you provide, the better we can help you achieve your academic goals.
                </p>
              )}
            </div>
          </div>

          {/* Important Notes */}
          <Card className="bg-blue-50 border-blue-200 p-4">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center">
              <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
              Important Reminders
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Don't share personal information in instructions</li>
              <li>• Be specific about formatting requirements</li>
              <li>• Mention any sources or materials we should reference</li>
              <li>• Include your professor's specific requirements</li>
            </ul>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onBack} 
              disabled={isSubmitting}
              className="px-8 h-12 border-gray-300 hover:border-purple-400 hover:text-purple-600"
            >
              Back
            </Button>
            
            <Button 
              type="submit" 
              disabled={!isValid || isSubmitting}
              className={`px-8 h-12 text-base font-semibold transition-all duration-300 ${
                isValid 
                  ? 'bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700 text-white shadow-lg transform hover:scale-105' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                'Complete Order'
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* Final Trust Signals */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Secure Processing</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Instant Confirmation</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span>Expert Assignment</span>
          </div>
        </div>
      </div>
    </div>
  )
}