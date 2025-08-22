'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  CheckCircleIcon, 
  ClockIcon, 
  DocumentTextIcon,
  TagIcon,
  BoltIcon,
  UserIcon,
  EnvelopeIcon,
  AcademicCapIcon,
  HashtagIcon,
  PencilSquareIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'
import { ServiceType, EnhancedPricingData } from '@/types'
import { calculateEnhancedPricing } from '@/lib/pricing/engine'

interface PricingSidebarProps {
  formData: {
    serviceType?: ServiceType
    email: string
    subject: string
    documentType: string
    pages: number
    deadline: string
    fullName: string
    instructions: string
    referenceStyle: string
  }
  currentStep: string
  completedSteps: string[]
}

export default function PricingSidebar({ 
  formData, 
  currentStep, 
  completedSteps 
}: PricingSidebarProps) {
  
  // Calculate enhanced pricing
  const pricing: EnhancedPricingData | null = formData.serviceType && formData.pages > 0 && formData.deadline
    ? calculateEnhancedPricing({
        serviceType: formData.serviceType,
        pages: formData.pages,
        deadline: formData.deadline,
        documentType: formData.documentType
      })
    : null

  const getUnitLabel = () => {
    return formData.serviceType === 'presentation' ? 'slide' : 'page'
  }

  // Format document type for display
  const formatDocumentType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  // Show trust signals only on first step
  if (currentStep === 'service') {
    return (
      <Card className="p-6">
        <h4 className="font-semibold text-gray-900 mb-4">
          100% quality guarantee
        </h4>
        <p className="text-gray-600 text-sm mb-4">
          Enjoy professional, stress-free academic help
        </p>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <CheckCircleIcon className="w-4 h-4 text-green-500" />
            <span className="text-sm text-gray-700">Strictly following instructions</span>
          </div>
          <div className="flex items-center space-x-2">
            <ClockIcon className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-700">Adherence to deadlines</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircleIcon className="w-4 h-4 text-purple-500" />
            <span className="text-sm text-gray-700">AI & Plagiarism control</span>
          </div>
        </div>

        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-green-800 font-medium text-center">
            🎉 2,847+ satisfied students this month!
          </p>
        </div>
      </Card>
    )
  }

  // Order summary for steps 2-4
  return (
    <div className="space-y-6">
      {/* Order Info Card */}
      <Card className="p-8">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-900">Order info</h4>
          <button className="text-gray-400 hover:text-gray-600">
            <ChevronDownIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          {/* Service Type */}
          {formData.serviceType && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DocumentTextIcon className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Service</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium capitalize">
                  {formData.serviceType}
                </span>
                <button className="text-blue-500 hover:text-blue-600">
                  <PencilSquareIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Full Name */}
          {formData.fullName && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Name</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{formData.fullName}</span>
                <button className="text-blue-500 hover:text-blue-600">
                  <PencilSquareIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Email */}
          {formData.email && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <EnvelopeIcon className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Email</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium truncate max-w-[150px]">
                  {formData.email}
                </span>
                <button className="text-blue-500 hover:text-blue-600">
                  <PencilSquareIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Subject */}
          {formData.subject && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AcademicCapIcon className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Subject</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium capitalize">{formData.subject}</span>
                <button className="text-blue-500 hover:text-blue-600">
                  <PencilSquareIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Document Type */}
          {formData.documentType && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DocumentTextIcon className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Paper Type</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">
                  {formatDocumentType(formData.documentType)}
                </span>
                <button className="text-blue-500 hover:text-blue-600">
                  <PencilSquareIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Pages/Slides */}
          {formData.pages > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HashtagIcon className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {formData.serviceType === 'presentation' ? 'Slides' : 'Pages'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">
                  {formData.pages} {getUnitLabel()}{formData.pages !== 1 ? 's' : ''}
                </span>
                <button className="text-blue-500 hover:text-blue-600">
                  <PencilSquareIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Deadline */}
          {formData.deadline && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClockIcon className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Deadline</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">
                  {formData.deadline} day{formData.deadline !== '1' ? 's' : ''}
                </span>
                <button className="text-blue-500 hover:text-blue-600">
                  <PencilSquareIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Pricing Card */}
      {pricing ? (
        <Card className="p-4">
          <div className="text-center mb-4">
            <div className="text-2xl font-bold text-gray-900">
              ${pricing.totalPrice.toFixed(2)}
            </div>
            <p className="text-sm text-gray-600">
              ${pricing.pricePerPage.toFixed(2)} per {getUnitLabel()}
            </p>
          </div>

          <Separator className="my-4" />

          {/* Pricing Breakdown */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Base Price</span>
              <span>${pricing.basePrice.toFixed(2)}</span>
            </div>

            {pricing.savings > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-green-600">{pricing.discountTier} (-{pricing.discountPercentage}%)</span>
                <span className="text-green-600">-${pricing.savings.toFixed(2)}</span>
              </div>
            )}

            {pricing.rushFee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-orange-600">Rush Service (+{pricing.rushFeePercentage}%)</span>
                <span className="text-orange-600">+${pricing.rushFee.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Competitor Comparison */}
          {pricing.competitorSavings > 0 && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800 font-medium text-center">
                💰 Save ${pricing.competitorSavings.toFixed(2)} vs competitors
              </p>
            </div>
          )}
        </Card>
      ) : (
        <Card className="p-6 text-center text-gray-500">
          <DocumentTextIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-sm">Complete assignment details to see pricing</p>
        </Card>
      )}
    </div>
  )
}