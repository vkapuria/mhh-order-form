import { ServiceType, PricingData } from '@/types'

export interface EnhancedPricingData extends PricingData {
  // Rush fees
  rushFee: number
  rushFeePercentage: number
  isRushOrder: boolean
  
  // Competitor comparison
  competitorPrice: number
  competitorSavings: number
  
  // Bulk incentives
  nextDiscountAt: number | null
  nextDiscountPercentage: number | null
  bulkIncentiveMessage: string | null
  
  // Dynamic urgency
  urgencyDiscount: number
  urgencyMessage: string | null
  timeRemaining: string | null
}

interface PricingParams {
  serviceType: ServiceType
  pages: number
  deadline: string
  documentType: string
}

export function calculateEnhancedPricing({
  serviceType,
  pages,
  deadline,
  documentType
}: PricingParams): EnhancedPricingData {
  if (!pages || !deadline) {
    return {
      basePrice: 0,
      totalPrice: 0,
      savings: 0,
      discountPercentage: 0,
      discountTier: null,
      pricePerPage: 0,
      rushFee: 0,
      rushFeePercentage: 0,
      isRushOrder: false,
      competitorPrice: 0,
      competitorSavings: 0,
      nextDiscountAt: null,
      nextDiscountPercentage: null,
      bulkIncentiveMessage: null,
      urgencyDiscount: 0,
      urgencyMessage: null,
      timeRemaining: null
    }
  }

  // Base pricing per service type
  let basePricePerPage: number
  if (serviceType === 'writing') {
    basePricePerPage = 14
  } else if (serviceType === 'editing') {
    basePricePerPage = 9
  } else if (serviceType === 'presentation') {
    basePricePerPage = 10  // $10 per slide
  } else {
    basePricePerPage = 14 // fallback
  }
  
  // Document type adjustments
  if (documentType === 'dissertation' || documentType === 'thesis') {
    basePricePerPage *= 1.3
  } else if (serviceType === 'presentation' && documentType === 'pitch_deck') {
    basePricePerPage *= 1.2 // Premium for pitch decks
  }
  
  // Deadline multipliers
  const deadlineMultipliers: Record<string, number> = {
    '14': 0.85, // 15% discount
    '10': 0.9,  // 10% discount
    '7': 1.0,   // Standard rate
    '5': 1.05,  // 5% premium
    '3': 1.1,   // 10% premium
    '2': 1.2,   // 20% premium
    '1': 1.3,   // 30% premium
  }
  
  const deadlineMultiplier = deadlineMultipliers[deadline] || 1.0
  const adjustedPricePerPage = basePricePerPage * deadlineMultiplier
  
  // Bulk discounts - different thresholds for presentations
  let discountPercentage = 0
  let discountTier: string | null = null
  
  if (serviceType === 'presentation') {
    // Presentation bulk discounts (slides)
    if (pages >= 20) {
      discountPercentage = 20
      discountTier = 'Premium Saver'
    } else if (pages >= 15) {
      discountPercentage = 15
      discountTier = 'Value Pro'
    } else if (pages >= 10) {
      discountPercentage = 10
      discountTier = 'Smart Saver'
    }
  } else {
    // Writing/Editing bulk discounts (pages)
    if (pages >= 15) {
      discountPercentage = 20
      discountTier = 'Premium Saver'
    } else if (pages >= 10) {
      discountPercentage = 15
      discountTier = 'Value Pro'
    } else if (pages >= 5) {
      discountPercentage = 10
      discountTier = 'Smart Saver'
    }
  }
  
  // Calculate next discount incentive - NO pushy suggestions for presentations
  let nextDiscountAt: number | null = null
  let nextDiscountPercentage: number | null = null
  let bulkIncentiveMessage: string | null = null
  
  if (serviceType !== 'presentation') {
    // Only show bulk incentives for writing/editing
    if (pages < 5) {
      nextDiscountAt = 5
      nextDiscountPercentage = 10
    } else if (pages < 10) {
      nextDiscountAt = 10
      nextDiscountPercentage = 15
    } else if (pages < 15) {
      nextDiscountAt = 15
      nextDiscountPercentage = 20
    }
  }
  
  // Rush fees for urgent deadlines
  const deadlineNum = Number(deadline)
  let rushFeePercentage = 0
  let isRushOrder = false
  
  if (deadlineNum <= 3) {
    isRushOrder = true
    if (deadlineNum === 1) rushFeePercentage = 30      // 24 hours
    else if (deadlineNum === 2) rushFeePercentage = 20 // 48 hours  
    else if (deadlineNum === 3) rushFeePercentage = 15 // 3 days
  }
  
  // Apply discounts
  const discountMultiplier = 1 - (discountPercentage / 100)
  let subtotal = adjustedPricePerPage * pages * discountMultiplier
  
  // Add rush fee
  const rushFee = subtotal * (rushFeePercentage / 100)
  
  // Dynamic urgency discount (limited time offer)
  const now = new Date()
  const isWeekend = now.getDay() === 0 || now.getDay() === 6
  let urgencyDiscount = 0
  let urgencyMessage: string | null = null
  let timeRemaining: string | null = null
  
  const minPagesForDiscount = serviceType === 'presentation' ? 5 : 3
  if (isWeekend && pages >= minPagesForDiscount) {
    urgencyDiscount = subtotal * 0.05 // 5% weekend discount
    urgencyMessage = "🎉 Weekend Special: 5% Extra Discount!"
    timeRemaining = "Ends Monday at midnight"
  }
  
  // Calculate final price
  const finalPrice = subtotal + rushFee - urgencyDiscount
  const basePrice = basePricePerPage * pages
  const totalSavings = basePrice - finalPrice + urgencyDiscount
  
  // Competitor comparison (simulate competitor pricing)
  let competitorMultiplier: number
  if (serviceType === 'presentation') {
    competitorMultiplier = 1.6 // PowerPoint freelancers charge 60% more
  } else if (serviceType === 'editing') {
    competitorMultiplier = 1.3 // Editors charge 30% more
  } else {
    competitorMultiplier = 1.4 // Writers charge 40% more
  }
  
  const competitorPrice = basePrice * competitorMultiplier
  const competitorSavings = competitorPrice - finalPrice
  
  // Determine price per unit label
  const finalPricePerUnit = finalPrice / pages
  
  return {
    basePrice: Math.round(basePrice * 100) / 100,
    totalPrice: Math.round(finalPrice * 100) / 100,
    savings: Math.round(totalSavings * 100) / 100,
    discountPercentage,
    discountTier,
    pricePerPage: Math.round(finalPricePerUnit * 100) / 100,
    rushFee: Math.round(rushFee * 100) / 100,
    rushFeePercentage,
    isRushOrder,
    competitorPrice: Math.round(competitorPrice * 100) / 100,
    competitorSavings: Math.round(competitorSavings * 100) / 100,
    nextDiscountAt,
    nextDiscountPercentage,
    bulkIncentiveMessage,
    urgencyDiscount: Math.round(urgencyDiscount * 100) / 100,
    urgencyMessage,
    timeRemaining
  }
}