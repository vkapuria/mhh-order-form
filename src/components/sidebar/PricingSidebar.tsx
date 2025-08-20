'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { 
  CheckCircleIcon, 
  ClockIcon, 
  DocumentTextIcon,
  TagIcon,
  BoltIcon,
  ExclamationTriangleIcon,
  GiftIcon,
  TrophyIcon,
  FireIcon
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

  // Calculate progress
  const totalFields = 8
  const completedFields = [
    formData.serviceType,
    formData.email,
    formData.subject,
    formData.documentType,
    formData.pages > 0,
    formData.deadline,
    formData.fullName,
    formData.instructions.length >= 20
  ].filter(Boolean).length

  const progressPercentage = Math.round((completedFields / totalFields) * 100)

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Order Summary</h3>
          <Badge variant="outline" className="text-xs">
            Step {currentStep === 'service' ? '1' : currentStep === 'contact' ? '2' : currentStep === 'assignment' ? '3' : '4'} of 4
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium text-blue-600">{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </Card>

      {/* Urgency Banner */}
      {pricing?.urgencyMessage && (
        <Card className="p-4 bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
          <div className="flex items-center space-x-2">
            <FireIcon className="w-5 h-5 text-orange-600" />
            <div>
              <p className="text-sm font-semibold text-orange-800">{pricing.urgencyMessage}</p>
              {pricing.timeRemaining && (
                <p className="text-xs text-orange-600">{pricing.timeRemaining}</p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Rush Order Warning */}
      {pricing?.isRushOrder && (
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="text-sm font-semibold text-yellow-800">Rush Order Alert</p>
              <p className="text-xs text-yellow-700">
                +{pricing.rushFeePercentage}% rush fee applies for {formData.deadline}-day deadline
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Bulk Incentive */}
      {pricing?.bulkIncentiveMessage && (
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center space-x-2">
            <GiftIcon className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-semibold text-green-800">Unlock Bigger Savings!</p>
              <p className="text-xs text-green-700">{pricing.bulkIncentiveMessage}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Service & Selections */}
      <Card className="p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Your Selections</h4>
        
        <div className="space-y-3">
          {/* Service Type */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <DocumentTextIcon className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">Service</span>
            </div>
            <span className="text-sm font-medium">
              {formData.serviceType ? (
                <Badge variant={formData.serviceType === 'writing' ? 'default' : 'secondary'}>
                  {formData.serviceType === 'writing' ? 'Writing' : 'Editing'}
                </Badge>
              ) : (
                <span className="text-gray-400">Not selected</span>
              )}
            </span>
          </div>

          {/* Email */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">Email</span>
            </div>
            <span className="text-sm font-medium">
              {formData.email ? (
                <span className="text-green-600">✓ Provided</span>
              ) : (
                <span className="text-gray-400">Pending</span>
              )}
            </span>
          </div>

          {/* Subject & Document */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <DocumentTextIcon className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">Assignment</span>
            </div>
            <span className="text-sm font-medium">
              {formData.subject && formData.documentType ? (
                <span className="text-green-600">✓ Specified</span>
              ) : (
                <span className="text-gray-400">Pending</span>
              )}
            </span>
          </div>

          {/* Pages */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <DocumentTextIcon className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">Pages</span>
            </div>
            <span className="text-sm font-medium">
              {formData.pages > 0 ? (
                <Badge variant="outline">{formData.pages} pages</Badge>
              ) : (
                <span className="text-gray-400">Not set</span>
              )}
            </span>
          </div>

          {/* Deadline */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ClockIcon className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">Deadline</span>
            </div>
            <span className="text-sm font-medium">
              {formData.deadline ? (
                <div className="flex items-center space-x-1">
                  <Badge variant="outline">{formData.deadline} days</Badge>
                  {pricing?.isRushOrder && (
                    <BoltIcon className="w-3 h-3 text-yellow-500" />
                  )}
                </div>
              ) : (
                <span className="text-gray-400">Not set</span>
              )}
            </span>
          </div>
        </div>
      </Card>

      {/* Enhanced Pricing Card */}
      {pricing ? (
        <Card className="p-6 bg-blue-50 border-blue-200">
          {/* Main Price Display */}
          <div className="text-center mb-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-1">Total Price</h4>
            <div className="text-3xl font-bold text-blue-600">
              ${pricing.totalPrice.toFixed(2)}
            </div>
            <p className="text-sm text-gray-600">
              ${pricing.pricePerPage.toFixed(2)} per page
            </p>
            
            {/* Competitor Comparison */}
            {pricing.competitorSavings > 0 && (
              <div className="mt-2">
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                  💰 Save ${pricing.competitorSavings.toFixed(2)} vs competitors
                </Badge>
              </div>
            )}
          </div>

          <Separator className="my-4" />

          {/* Enhanced Pricing Breakdown */}
          <div className="space-y-3">
            {/* Base Price */}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Base Price</span>
              <span className="font-medium">${pricing.basePrice.toFixed(2)}</span>
            </div>

            {/* Bulk Discount */}
            {pricing.savings > 0 && (
              <div className="flex justify-between text-sm">
                <div className="flex items-center space-x-1">
                  <TagIcon className="w-3 h-3 text-green-600" />
                  <span className="text-green-600">{pricing.discountTier} (-{pricing.discountPercentage}%)</span>
                </div>
                <span className="font-medium text-green-600">
                  -${pricing.savings.toFixed(2)}
                </span>
              </div>
            )}

            {/* Rush Fee */}
            {pricing.rushFee > 0 && (
              <div className="flex justify-between text-sm">
                <div className="flex items-center space-x-1">
                  <BoltIcon className="w-3 h-3 text-orange-600" />
                  <span className="text-orange-600">Rush Service (+{pricing.rushFeePercentage}%)</span>
                </div>
                <span className="font-medium text-orange-600">
                  +${pricing.rushFee.toFixed(2)}
                </span>
              </div>
            )}

            {/* Urgency Discount */}
            {pricing.urgencyDiscount > 0 && (
              <div className="flex justify-between text-sm">
                <div className="flex items-center space-x-1">
                  <FireIcon className="w-3 h-3 text-red-600" />
                  <span className="text-red-600">Special Discount</span>
                </div>
                <span className="font-medium text-red-600">
                  -${pricing.urgencyDiscount.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          {/* Total Savings Badge */}
          {(pricing.discountPercentage > 0 || pricing.urgencyDiscount > 0) && (
            <div className="mt-4 text-center">
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                <TrophyIcon className="w-3 h-3 mr-1" />
                Total Savings: ${(pricing.savings + pricing.urgencyDiscount).toFixed(2)}
              </Badge>
            </div>
          )}

          {/* Quick Actions */}
          {pricing.nextDiscountAt && (
            <div className="mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-xs"
                onClick={() => {
                  // This would update the pages in the parent component
                  console.log(`Suggest upgrading to ${pricing.nextDiscountAt} pages`)
                }}
              >
                💡 Upgrade to {pricing.nextDiscountAt} pages for {pricing.nextDiscountPercentage}% off
              </Button>
            </div>
          )}
        </Card>
      ) : (
        /* Placeholder when no pricing available */
        <Card className="p-6 text-center text-gray-500">
          <DocumentTextIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-sm">Complete assignment details to see pricing</p>
        </Card>
      )}

      {/* Price Guarantee */}
      <Card className="p-4 bg-gray-50">
        <div className="text-center">
          <h5 className="font-semibold text-gray-900 mb-2">Price Match Guarantee</h5>
          <p className="text-xs text-gray-600 mb-3">
            Found a lower price? We'll match it and give you an extra 5% off.
          </p>
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
            <span>🔒 Secure checkout</span>
            <span>💰 Money-back guarantee</span>
            <span>⭐ 4.9/5 rating</span>
          </div>
        </div>
      </Card>

      {/* Social Proof */}
      <div className="text-center text-xs text-gray-500">
        <p>🔥 <strong>127 orders</strong> completed this week</p>
        <p>⚡ <strong>Average delivery:</strong> 2 days early</p>
      </div>
    </div>
  )
}