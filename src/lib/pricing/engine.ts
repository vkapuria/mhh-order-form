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

// ✅ Perfect pricing function - ensures only .00 and .50 decimals
function roundPrice(price: number): number {
  const wholePart = Math.floor(price)
  const decimalPart = price - wholePart
  if (decimalPart === 0 || decimalPart === 0.5) return price
  if (decimalPart > 0 && decimalPart < 0.5) return wholePart + 0.5
  if (decimalPart > 0.5 && decimalPart < 1) return wholePart + 1
  return price
}

// ✅ Practical workload limits (your original smart logic)
const practicalLimits: Record<string, number> = {
  "0.5": 3,  // 12 hours: max 3 pages
  "1": 6,    // 24 hours: max 6 pages  
  "2": 10,   // 48 hours: max 10 pages
  "3": 15    // 3 days: max 15 pages
}

// ✅ Special pricing rules (your original logic)
const specialPricingRules = {
  smallOrder: 3,   // ≤3 pages = small order
  mediumOrder: 8   // 4-8 pages = medium order
}

// ✅ Smart rush fee logic - capacity based (your original)
function exceedsPracticalLimits(pages: number, deadline: string): boolean {
  const deadlineNum = Number(deadline)
  if (deadlineNum > 3) return false // No capacity rush fee for 4+ days
  
  const maxPages = practicalLimits[deadline] || Infinity
  return pages > maxPages
}

// ✅ Capacity-based rush fee calculation (your original)
function calculateCapacityRushFeePercentage(pages: number, deadline: string): number {
  if (!exceedsPracticalLimits(pages, deadline)) return 0
  
  const deadlineNum = Number(deadline)
  const maxPages = practicalLimits[deadline] || pages
  const excessRatio = (pages - maxPages) / maxPages
  
  let rushPercentage = 25 + (excessRatio * 25)
  return Math.min(50, Math.ceil(rushPercentage))
}

export function calculateEnhancedPricing({
  serviceType,
  pages,
  deadline,
  documentType
}: PricingParams): EnhancedPricingData {
  
  
  // Handle empty/invalid inputs
  if (!pages || !deadline) {
    return {
      basePrice: 0, totalPrice: 0, savings: 0, discountPercentage: 0, discountTier: null,
      pricePerPage: 0, rushFee: 0, rushFeePercentage: 0, isRushOrder: false,
      competitorPrice: 0, competitorSavings: 0, nextDiscountAt: null, nextDiscountPercentage: null,
      bulkIncentiveMessage: null, urgencyDiscount: 0, urgencyMessage: null, timeRemaining: null
    }
  }

  // 1️⃣ BASE PRICING per service type
  let basePricePerPage: number
  if (serviceType === 'writing') {
    basePricePerPage = 14
  } else if (serviceType === 'editing') {
    basePricePerPage = 9
  } else if (serviceType === 'presentation') {
    basePricePerPage = 10
  } else {
    basePricePerPage = 14 // Default
  }
  
  
  // 2️⃣ DOCUMENT TYPE adjustments
  const originalRate = basePricePerPage;
  if (documentType === 'dissertation' || documentType === 'thesis') {
    basePricePerPage = roundPrice(basePricePerPage * 1.3)
  } else if (serviceType === 'presentation' && documentType === 'pitch_deck') {
    basePricePerPage = roundPrice(basePricePerPage * 1.2)
  } else {
  }
  
  // 🎯 TRUE BASE PRICE (never changes - this is what customer sees as base)
  const trueBasePrice = roundPrice(basePricePerPage * pages)

  // 3️⃣ BULK DISCOUNTS (only for 5+ pages)
  let discountPercentage = 0
  let discountTier: string | null = null
  
  if (serviceType === 'presentation') {
    if (pages >= 20) {
      discountPercentage = 20; discountTier = 'Premium Saver'
    } else if (pages >= 15) {
      discountPercentage = 15; discountTier = 'Value Pro'
    } else if (pages >= 10) {
      discountPercentage = 10; discountTier = 'Smart Saver'
    }
  } else {
    // Regular services - only start discounts at 5+ pages
    if (pages >= 15) {
      discountPercentage = 20; discountTier = 'Premium Saver'
    } else if (pages >= 10) {
      discountPercentage = 15; discountTier = 'Value Pro'
    } else if (pages >= 5) { 
      discountPercentage = 10; discountTier = 'Smart Saver'
    }
    // No discount for pages < 5
  }
  
  const bulkDiscount = roundPrice(trueBasePrice * (discountPercentage / 100))
  const priceAfterDiscount = roundPrice(trueBasePrice - bulkDiscount)

  // 4️⃣ DEADLINE MULTIPLIERS with special rules
  let deadlineMultiplier = 1.0
  const deadlineNum = Number(deadline)
  
  // Apply special pricing rules
  if (pages <= specialPricingRules.smallOrder) {
    deadlineMultiplier = 1.0
  } else if (pages <= specialPricingRules.mediumOrder && deadlineNum >= 2) {
    deadlineMultiplier = 1.0
  } else {
    // Normal deadline multipliers
    const originalMultiplier = deadlineMultiplier;
    switch(deadlineNum) {
      case 14: deadlineMultiplier = 0.85; break // 15% discount
      case 10: deadlineMultiplier = 0.9; break  // 10% discount
      case 7: deadlineMultiplier = 1.0; break   // Standard rate
      case 5: deadlineMultiplier = 1.05; break  // 5% premium
      case 3: deadlineMultiplier = 1.1; break   // 10% premium
      case 2: deadlineMultiplier = 1.2; break   // 20% premium
      case 1: deadlineMultiplier = 1.3; break   // 30% premium
      case 0.5: deadlineMultiplier = 1.6; break // 60% premium
      default: deadlineMultiplier = 1.0
    }
  }

  // 5️⃣ CALCULATE RUSH CHARGES
  let totalRushCharges = 0
  let rushPercentage = 0
    
  // Only apply rush charges if there are premiums
  if (deadlineMultiplier !== 1.0 || exceedsPracticalLimits(pages, deadline)) {
    
    // Deadline premium (applied to price after bulk discount)
    let deadlinePremium = 0
    if (deadlineMultiplier > 1.0) {
      const premiumMultiplier = deadlineMultiplier - 1.0 // e.g., 1.3 - 1.0 = 0.3 (30%)
      deadlinePremium = roundPrice(priceAfterDiscount * premiumMultiplier)
    } else if (deadlineMultiplier < 1.0) {
      // This is actually a discount (longer deadlines)
      const discountMultiplier = 1.0 - deadlineMultiplier // e.g., 1.0 - 0.85 = 0.15 (15% off)
      deadlinePremium = -roundPrice(priceAfterDiscount * discountMultiplier)
    } else {
    }
    
    // Capacity rush fee (your original workload-based logic)
    const capacityRushPercentage = calculateCapacityRushFeePercentage(pages, deadline)
    const baseForCapacityFee = priceAfterDiscount + Math.max(0, deadlinePremium);
    const capacityRushFee = roundPrice(baseForCapacityFee * (capacityRushPercentage / 100))
    
    // Combine all rush charges
    totalRushCharges = roundPrice(deadlinePremium + capacityRushFee)
    
    // Calculate percentage based on price after discount
    if (priceAfterDiscount > 0) {
      rushPercentage = Math.round((Math.abs(totalRushCharges) / priceAfterDiscount) * 100)
    }
  } else {
  }

  // 🗑️ REMOVED: All weekend special code - GONE!

  // 6️⃣ FINAL PRICE CALCULATION (NO MORE WEEKEND CRAP!)
  const finalPrice = roundPrice(priceAfterDiscount + totalRushCharges)

  // 7️⃣ NEXT DISCOUNT INCENTIVE
  let nextDiscountAt: number | null = null
  let nextDiscountPercentage: number | null = null
  
  if (serviceType !== 'presentation') {
    if (pages < 5) {
      nextDiscountAt = 5; nextDiscountPercentage = 10
    } else if (pages < 10) {
      nextDiscountAt = 10; nextDiscountPercentage = 15
    } else if (pages < 15) {
      nextDiscountAt = 15; nextDiscountPercentage = 20
    }
  }
  
  // 8️⃣ COMPETITOR COMPARISON
  let competitorMultiplier: number
  if (serviceType === 'presentation') {
    competitorMultiplier = 1.6
  } else if (serviceType === 'editing') {
    competitorMultiplier = 1.3
  } else {
    competitorMultiplier = 1.4
  }
  
  const competitorPrice = roundPrice(trueBasePrice * competitorMultiplier)
  const competitorSavings = roundPrice(Math.max(0, competitorPrice - finalPrice))

  // 🎯 CLEAN RETURN DATA (NO WEEKEND GARBAGE!)
  const result = {
    basePrice: trueBasePrice,                    
    totalPrice: finalPrice,                      
    savings: bulkDiscount,                       
    discountPercentage,                          
    discountTier,                                
    pricePerPage: roundPrice(finalPrice / pages),
    rushFee: totalRushCharges,                   
    rushFeePercentage: rushPercentage,           
    isRushOrder: totalRushCharges > 0,           
    competitorPrice: competitorPrice,            
    competitorSavings: competitorSavings,        
    nextDiscountAt,                              
    nextDiscountPercentage,                      
    bulkIncentiveMessage: null,                  
    urgencyDiscount: 0,        // 🗑️ Always 0 - no more weekend BS
    urgencyMessage: null,      // 🗑️ Always null
    timeRemaining: null        // 🗑️ Always null
  }
  
  return result;
}