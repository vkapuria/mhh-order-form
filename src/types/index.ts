export type ServiceType = 'writing' | 'editing'

export type FormStep = 'service' | 'contact' | 'assignment' | 'details' | 'review'

export interface OrderFormData {
  serviceType?: ServiceType
  email: string
  subject: string
  documentType: string
  pages: number
  deadline: string
  fullName: string
  instructions: string
  files: File[]
  referenceStyle: string
}

export interface PricingData {
  basePrice: number
  totalPrice: number
  savings: number
  discountPercentage: number
  discountTier: string | null
  pricePerPage: number
}

// Export the enhanced pricing interface
export interface EnhancedPricingData extends PricingData {
  rushFee: number
  rushFeePercentage: number
  isRushOrder: boolean
  competitorPrice: number
  competitorSavings: number
  nextDiscountAt: number | null
  nextDiscountPercentage: number | null
  bulkIncentiveMessage: string | null
  urgencyDiscount: number
  urgencyMessage: string | null
  timeRemaining: string | null
}

export interface FormStepConfig {
  id: FormStep
  title: string
  description: string
  completed: boolean
}