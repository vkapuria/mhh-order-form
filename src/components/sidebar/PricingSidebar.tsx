'use client'

// ==================== ALL IMPORTS AT TOP ====================
import { useEffect, useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import {
  CheckCircleIcon,
  ClockIcon,
  ShieldCheckIcon,
  StarIcon,
  LockClosedIcon,
  DocumentTextIcon,
  HashtagIcon,
  AcademicCapIcon,
  EnvelopeIcon,
  UserIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline'
import {
  TagIcon,
} from '@heroicons/react/24/solid'
import { ServiceType, EnhancedPricingData } from '@/types'
import { calculateEnhancedPricing } from '@/lib/pricing/engine'

// ==================== TYPES ====================
type StepKey = 'service' | 'contact' | 'assignment' | 'details'

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
  currentStep: StepKey
  completedSteps: string[]
}

// ==================== HELPER FUNCTIONS ====================
function formatCurrency(n: number) {
  return `$${n.toFixed(2)}`
}

function TrustBadge({ icon: Icon, text }: { icon: React.ElementType, text: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs text-gray-600">
      <Icon className="w-4 h-4 text-green-600" />
      {text}
    </span>
  )
}

function BreakdownRow({ label, value, color }: {
  label: string,
  value: string,
  color?: 'green' | 'orange'
}) {
  const colorClass = color === 'green' ? 'text-green-600' : color === 'orange' ? 'text-orange-600' : 'text-gray-800';
  return (
    <div className="flex justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      <span className={`text-sm font-medium ${colorClass}`}>{value}</span>
    </div>
  );
}

// ==================== MOTIVATION BAR ====================
function EmailSub({ email }: { email: string }) {
  return (
    <>
      <div>We will send order updates to</div>
      <div className="mt-0.5 font-semibold text-slate-700 break-all">
        {email} <span aria-hidden>📩</span>
      </div>
    </>
  )
}

function TopMotivationBar({
  step,
  name,
  email,
}: {
  step: StepKey
  name?: string
  email?: string
}) {
  const firstName = (name ?? '').trim().split(/\s+/)[0] || ''
  const isValidEmail = !!(email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
  const onContact = step === 'contact'

  let title: string = 'Private & secure.'
  let sub: React.ReactNode = 'Choose your service to begin.'
  let pct = 12

  if (onContact) {
    pct = 33
    if (firstName && isValidEmail) {
      title = `Hi ${firstName} 👋`
      sub = <EmailSub email={email!} />
    } else if (firstName) {
      title = `Hello, ${firstName} 👋`
      sub = 'Add your email to save your progress.'
    } else if (isValidEmail) {
      title = 'Welcome 👋'
      sub = <EmailSub email={email!} />
    } else {
      title = 'Welcome — save your progress.'
      sub = 'Add your name & email (no spam).'
    }
  } else if (step === 'assignment') {
    pct = 66
    if (firstName) {
      title = `Almost done, ${firstName} ✨`
    } else {
      title = 'Almost done ✨'
    }
    sub = 'Set your deadline & pages to see your price.'
  } else if (step === 'details') {
    title = 'Review & confirm.'
    sub = 'Live price reflects your selections.'
    pct = 90
  }
  
  return (
    <Card className="p-4 rounded-2xl border border-slate-200 shadow-sm mb-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-slate-900">{title}</div>
          <div className="mt-0.5 text-xs text-slate-600">{sub}</div>
        </div>
        <div className="w-28 h-2 rounded-full bg-slate-200 ml-4 overflow-hidden">
          <div
            className="h-2 bg-[#8800e9] transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </Card>
  )
}

// ==================== STEP CARDS ====================
function PromisesCard() {
  return (
    <Card className="p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-start gap-3 mb-4">
        <img
          src="/icons/best-results.svg"
          alt="Quality & security"
          className="h-8 w-8 sm:h-6 sm:w-6"
        />
        <div>
          <h4 className="font-semibold text-slate-900 text-lg">Our promises</h4>
          <p className="text-xs text-slate-500">Trusted by students worldwide</p>
        </div>
      </div>

      <ul className="space-y-3 text-sm text-slate-700">
        <li className="flex items-center gap-2">
          <CheckCircleIcon className="w-4 h-4 text-[#8800e9]" />
          Original work & free revisions (7 days)
        </li>
        <li className="flex items-center gap-2">
          <ClockIcon className="w-4 h-4 text-[#8800e9]" />
          On-time delivery commitment
        </li>
        <li className="flex items-center gap-2">
          <ShieldCheckIcon className="w-4 h-4 text-[#8800e9]" />
          Plagiarism & AI Free Guarantee
        </li>
        <li className="flex items-center gap-2">
          <LockClosedIcon className="w-4 h-4 text-[#8800e9]" />
          SSL-secure checkout
        </li>
      </ul>
    </Card>
  )
}

function StatsCard() {
  const [studentCount, setStudentCount] = useState(0)

  useEffect(() => {
    let start = 0
    const end = 2847
    const duration = 1200 // ms
    const stepTime = 20 // ms per tick
    const increment = Math.ceil(end / (duration / stepTime))

    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setStudentCount(end)
        clearInterval(timer)
      } else {
        setStudentCount(start)
      }
    }, stepTime)

    return () => clearInterval(timer)
  }, [])

  const pills = [
    { icon: StarIcon, text: '4.9/5 average' },
    { icon: ClockIcon, text: '98% on-time' },
    { icon: ShieldCheckIcon, text: `${studentCount.toLocaleString()} students this month` },
  ]

  return (
    <Card className="p-5 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex flex-wrap gap-2">
        {pills.map(({ icon: Icon, text }) => (
          <span
            key={text}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-700"
          >
            <Icon className="w-4 h-4 text-slate-500" />
            {text}
          </span>
        ))}
      </div>
    </Card>
  )
}

function ReviewsCard() {
  const reviews = [
    { rating: 5, text: "Great sources and formatting. A+.", source: "Nursing Student" },
    { rating: 5, text: "Fast turnaround saved my grade.", source: "Business Student" },
    { rating: 5, text: "Well-cited, polished draft.", source: "English Student" },
    { rating: 5, text: "Clear, on time, and exactly per rubric.", source: "Psychology Student" },
  ]

  const plugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: false })
  )

  const [api, setApi] = useState<CarouselApi>()
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    if (!api) return

    const updateIndex = () => setSelectedIndex(api.selectedScrollSnap())
    api.on("select", updateIndex)
    updateIndex()
  }, [api])

  const totalSlides = Math.ceil(reviews.length / 2)

  return (
    <Card className="p-5 rounded-2xl border border-slate-200 shadow-sm">
      <h5 className="text-sm font-medium text-slate-900 mb-3">Recent reviews</h5>

      <Carousel
        plugins={[plugin.current]}
        opts={{ align: "start", loop: true }}
        setApi={setApi}
      >
        <CarouselContent>
          {reviews.map((r, i) => (
            <CarouselItem key={i} className="md:basis-1/2 lg:basis-1/2">
              <Card className="p-4 h-full flex flex-col justify-between border border-slate-200 rounded-xl">
                <div className="flex mb-2">
                  {Array.from({ length: r.rating }).map((_, idx) => (
                    <StarIcon key={idx} className="w-4 h-4 text-yellow-500" />
                  ))}
                </div>
                <p className="text-sm text-slate-700 mb-2">"{r.text}"</p>
                <p className="text-xs text-slate-500">— {r.source}</p>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {totalSlides > 1 && (
        <div className="flex justify-center mt-3 gap-2">
          {Array.from({ length: totalSlides }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => api?.scrollTo(idx)}
              className={`h-2 w-2 rounded-full transition-colors ${
                selectedIndex === idx ? "bg-[#8800e9]" : "bg-slate-300"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </Card>
  )
}

// ==================== PRICING DISPLAY ====================
function PricingSidebarBody({ formData }: { formData: any }) {
  const readyForPrice = !!formData.serviceType && !!formData.deadline && (formData.pages || 0) > 0;

  const pricing: EnhancedPricingData | null = readyForPrice
    ? calculateEnhancedPricing({
        serviceType: formData.serviceType!,
        pages: formData.pages,
        deadline: formData.deadline,
        documentType: formData.documentType,
      })
    : null;
    
  const MARKET_UPLIFT = 0.12; // 12%
  const unit = formData.serviceType === 'presentation' ? 'slide' : 'page';

  // Skeleton Loader State
  if (!pricing) {
    return (
      <div className="space-y-4">
        <Card className="p-6 rounded-xl border-gray-200 shadow-sm">
          <div className="space-y-3">
            <div className="h-8 w-40 bg-gray-200/70 rounded-md animate-pulse" />
            <div className="h-4 w-24 bg-gray-200/70 rounded-md animate-pulse" />
            <Separator className="my-4" />
            <div className="h-4 w-full bg-gray-200/70 rounded-md animate-pulse" />
            <p className="text-xs text-gray-500 pt-2">
              Add a <span className="font-medium">deadline</span> and <span className="font-medium">pages</span> to calculate your price.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // Main Pricing Display
  const competitorTotal = pricing.totalPrice * (1 + MARKET_UPLIFT);
  const saveVsMarket = Math.max(0, competitorTotal - pricing.totalPrice);

  console.log("=== UI PRICING DEBUG ===");
console.log("Pricing object:", pricing);
console.log(`Base: $${pricing.basePrice}, Savings: $${pricing.savings}, Rush: $${pricing.rushFee}, Total: $${pricing.totalPrice}`);
console.log(`Math check: $${pricing.basePrice} - $${pricing.savings} + $${pricing.rushFee} = $${pricing.basePrice - pricing.savings + pricing.rushFee}`);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Price Card */}
      <Card className="p-6 rounded-xl border-gray-200 shadow-sm">
        <CardHeader className="p-0 mb-4">
          <CardTitle className="text-base font-semibold text-gray-900">YOUR PRICE</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 tracking-tight">
              {formatCurrency(pricing.totalPrice)}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {formatCurrency(pricing.pricePerPage)} per {unit}
            </p>
            <p className="text-xs text-gray-500 mt-2 italic">
              {formData.pages} {unit}{formData.pages > 1 ? 's' : ''} × {formatCurrency(pricing.pricePerPage)} per {unit}. 
              Our base rates vary by service, assignment type, and deadline urgency.
            </p>
          </div>
          <Separator className="my-4" />
          <div className="space-y-2 text-sm">
  <BreakdownRow label="Base Price" value={formatCurrency(pricing.basePrice)} />
  
  {/* Show ALL discounts, no $10 threshold! */}
  {pricing.savings > 0 && (
    <BreakdownRow 
      label={`${pricing.discountTier} Discount`} 
      value={`-${formatCurrency(pricing.savings)}`} 
      color="green" 
    />
  )}
  
  {/* Show rush charges if they exist */}
  {pricing.rushFee > 0 && (
    <BreakdownRow 
      label={`Rush Charges (+${pricing.rushFeePercentage}%)`} 
      value={`+${formatCurrency(pricing.rushFee)}`} 
      color="orange" 
    />
  )}
</div>
        </CardContent>
      </Card>

      {/* Value Proposition Card */}
      <Card className="p-5 rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="space-y-3">
          {pricing.savings > 0 && (
            <div className="flex items-center gap-3 text-sm text-green-700">
              <TagIcon className="w-5 h-5 flex-shrink-0"/>
              <span>You saved <strong>{formatCurrency(pricing.savings)}</strong> with your volume discount.</span>
            </div>
          )}
          {saveVsMarket > 0 && (
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <TagIcon className="w-5 h-5 flex-shrink-0"/>
              <span>Save <strong>{formatCurrency(saveVsMarket)}</strong> vs competitors</span>
            </div>
          )}
        </div>
      </Card>

      {/* Trust Badges */}
      <div className="flex justify-center items-center gap-6 pt-2">
        <TrustBadge icon={ShieldCheckIcon} text="SSL Secure Checkout" />
        <TrustBadge icon={CheckCircleIcon} text="Money-Back Guarantee" />
      </div>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================
export default function PricingSidebar({ formData, currentStep }: PricingSidebarProps) {
  let firstCard: React.ReactElement | null = null

  if (currentStep === 'service') {
    firstCard = <PromisesCard />
  } else if (currentStep === 'contact') {
    firstCard = <StatsCard />
  } else if (currentStep === 'assignment') {
    firstCard = <ReviewsCard />
  }

  const content = currentStep === 'details' ? (
    <PricingSidebarBody formData={formData} />
  ) : (
    <div className="space-y-6">{firstCard}</div>
  )

  return (
    <div className="space-y-4">
      <TopMotivationBar
        step={currentStep}
        name={formData.fullName}
        email={formData.email}
      />
      {content}
    </div>
  )
}