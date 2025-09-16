'use client'

// ==================== ALL IMPORTS AT TOP ====================
import { useEffect, useState, useRef, useMemo } from 'react'
import type { Variants } from "framer-motion";
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
  CalendarIcon,
  ShoppingCartIcon,
} from '@heroicons/react/24/outline'
import { TagIcon } from '@heroicons/react/24/solid'
import { ServiceType, EnhancedPricingData } from '@/types'
import { calculateEnhancedPricing } from '@/lib/pricing/engine'
import { generateLiveActivityItems, NotificationItem } from '@/lib/live-activity/generator'

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
      title = `Great start, ${firstName}!`
    } else {
      title = 'Tell us about your assignment'
    }
    sub = 'Share your assignment details and requirements.'
  } else if (step === 'details') {
    pct = 90
    if (firstName) {
      title = `Almost done, ${firstName} ✨`
    } else {
      title = 'Almost done ✨'  
    }
    sub = 'Set your deadline & pages to see your price.'
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
            className="h-2 bg-[#007bff] transition-all"
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
          className="h-10 w-auto sm:h-10 sm:w-auto"
        />
        <div>
          <h4 className="font-semibold text-slate-900 text-lg">Our promises</h4>
          <p className="text-xs text-slate-500">Trusted by students worldwide</p>
        </div>
      </div>

      <ul className="space-y-3 text-sm text-slate-700">
        <li className="flex items-center gap-2">
          <CheckCircleIcon className="w-4 h-4 text-[#007bff]" />
          Original work & free revisions
        </li>
        <li className="flex items-center gap-2">
          <ClockIcon className="w-4 h-4 text-[#007bff]" />
          On-time delivery commitment
        </li>
        <li className="flex items-center gap-2">
          <ShieldCheckIcon className="w-4 h-4 text-[#007bff]" />
          Plagiarism & AI Free Guarantee
        </li>
        <li className="flex items-center gap-2">
          <LockClosedIcon className="w-4 h-4 text-[#007bff]" />
          SSL-secure checkout
        </li>
      </ul>
    </Card>
  )
}

function StatsCard() {
  const trustSignals = [
    {
      icon: '/icons/security-shield.svg',
      title: 'Secure & Confidential',
      description: 'Your privacy protected with SSL encryption',
      highlight: true
    },
    {
      icon: '/icons/success-chart.svg', 
      title: '98% Success Rate',
      description: 'Consistently high-quality academic results',
      highlight: false
    },
    {
      icon: '/icons/expert-support.svg',
      title: 'Expert Care & Support', 
      description: 'Dedicated academic professionals at your service',
      highlight: false
    },
    {
      icon: '/icons/help-support.svg',
      title: '24/7 Help Available',
      description: 'Round-the-clock assistance when you need it',
      highlight: false
    }
  ]

  return (
    <Card className="p-5 rounded-2xl border border-slate-200 shadow-sm">
      <div className="space-y-3">
        {trustSignals.map((signal, index) => (
          <div 
            key={index} 
            className={`relative flex items-start gap-3 p-3 rounded-lg transition-colors ${
              signal.highlight 
                ? 'bg-blue-50 border border-blue-100 hover:bg-blue-100' 
                : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex-shrink-0">
            <img 
  src={signal.icon} 
  alt={signal.title}
  className="w-8 h-8"
  style={{ 
    filter: 'brightness(0) saturate(100%) invert(21%) sepia(100%) saturate(3961%) hue-rotate(211deg) brightness(102%) contrast(101%)'
  }}
/>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900 leading-tight">
                {signal.title}
              </h4>
              <p className="text-xs text-gray-600 mt-0.5 leading-tight">
                {signal.description}
              </p>
            </div>
            
            {signal.highlight && (
              <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 z-10">
                <img 
                  src="/icons/signup-hand.svg" 
                  alt="Look here"
                  className="w-6 h-6 animate-pulse"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}

// ==================== REVIEWS CARD ====================
import { generateLiveReviews, ReviewItem } from "@/lib/reviews/generator"

function ReviewsCard({ reviews }: { reviews: ReviewItem[] }) {
  // Map rating -> your SVGs
  const RATING_IMG: Record<4 | 5, string> = {
    4: "/icons/rating-4-stars.svg",
    5: "/icons/rating-5-stars.svg",
  }

  // Animation timings
  const SHOW_MS = 10000  // visible duration
  const GAP_MS = 2000    // gap between slides

  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    let t1: ReturnType<typeof setTimeout> | undefined
    let t2: ReturnType<typeof setTimeout> | undefined
    let mounted = true

    const run = () => {
      setVisible(true)
      t1 = setTimeout(() => {
        setVisible(false)
        t2 = setTimeout(() => {
          if (!mounted) return
          setIndex(i => (i + 1) % reviews.length)
          run()
        }, GAP_MS)
      }, SHOW_MS)
    }

    run()
    return () => {
      mounted = false
      if (t1) clearTimeout(t1)
      if (t2) clearTimeout(t2)
    }
  }, [reviews.length])

  const r = reviews[index]
  if (!r) return null

  // Simple slide-in/out animation
  const slideVariants: Variants = {
    initial: { x: 24, opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
    exit: { x: -24, opacity: 0, transition: { duration: 0.6, ease: "easeIn" } },
  }

  return (
    <Card className="p-6 rounded-2xl border border-slate-200">
      <div className="flex items-center gap-2 mb-2">
  <img
    src="/icons/reviews.svg"
    alt="Reviews"
    className="w-8 h-auto"
    loading="lazy"
  />
  <h5 className="text-base font-bold text-slate-900">
    What students say...
  </h5>
</div>


      <div className="relative h-[160px]">
        <AnimatePresence mode="wait">
          {visible && (
            <motion.div
              key={r.code}
              className="h-full flex flex-col gap-4"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {/* Header / Row 1: Type: [Subject]  |  Stars */}
<div className="flex items-center justify-between mb-1">
  <div className="flex items-center gap-2">
    <span className="text-[12px] text-slate-500">Type:</span>
    <span className="text-blue-800 py-0.5 rounded-full text-[12px] font-medium">
      {r.subject}
    </span>
  </div>

  <img
    src={RATING_IMG[r.rating]}
    alt={`${r.rating} star rating`}
    width={120}
    height={20}
    className="h-4 w-auto shrink-0 overflow-visible"
    loading="lazy"
  />
</div>

{/* Row 2: Review text */}
<p className="text-sm text-slate-700 mb-1">“{r.text}”</p>

{/* Row 3: Date (left)  |  DMH code (right) */}
<div className="flex items-center justify-between">
  <div className="flex items-center gap-1 text-xs text-slate-500">
    <CalendarIcon className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
    <span>{r.label}</span>
  </div>
  <span className="px-2 py-0.5 rounded-full text-[11px] text-white" style={{ backgroundColor: '#1b1b20' }}>

    {r.code}
  </span>
</div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  )
}


// ==================== LIVE ACTIVITY FEED (flip-board) ====================
import { AnimatePresence, motion } from "framer-motion";

type LiveActivityFeedProps = {
  items: NotificationItem[]
}

function LiveActivityFeed({ items }: LiveActivityFeedProps) {
  const countryMaps = {
    usa: '/maps/002-united states of america.svg',
    uk: '/maps/006-united kingdom.svg',
    sg: '/maps/014-singapore.svg',
    kr: '/maps/012-south korea.svg',
    uae: '/maps/013-united arab emirates.svg',
    ch: '/maps/051-switzerland.svg',
  }

  // index of current item and whether it’s visible
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  // 15s visible → 30s hidden → advance → repeat
  useEffect(() => {
    let tShow: ReturnType<typeof setTimeout> | undefined
    let tHide: ReturnType<typeof setTimeout> | undefined
    let mounted = true

    const cycle = () => {
      setVisible(true) // show current
      tShow = setTimeout(() => {
        setVisible(false) // hide
        tHide = setTimeout(() => {
          if (!mounted) return
          setIndex((i) => (i + 1) % Math.max(items.length, 1))
          cycle()
        }, 2000) // hidden for 30s
      }, 5000) // visible for 15s
    }

    cycle()
    return () => {
      mounted = false
      if (tShow) clearTimeout(tShow)
      if (tHide) clearTimeout(tHide)
    }
  }, [items.length])

  const n = items[index]
  if (!n) return null

  // flip-board animation variants
  const flipVariants: Variants = {
    initial: { rotateX: 90, opacity: 0 },
    animate: {
      rotateX: 0,
      opacity: 1,
      transition: { duration: 1.0, ease: [0.25, 0.1, 0.25, 1] },  // slower & smoother
    },
    exit: {
      rotateX: -90,
      opacity: 0,
      transition: { duration: 0.9, ease: [0.25, 0.1, 0.25, 1] },
    },
  };
  

  return (
    <div
      className="max-w-sm mx-auto"
      style={{ perspective: 900 }} // needed for 3D flip
    >
      <AnimatePresence mode="wait">
        {visible && (
          <motion.div
          key={n.id}
          className="bg-white rounded-full border border-gray-200 py-2 px-2"
          variants={flipVariants}
          initial="initial"
          animate="animate"  // <-- was "enter"
          exit="exit"
          style={{ transformOrigin: "top center" }}
          role="log"
          aria-live="polite"
          aria-relevant="additions text"
        >
        
            <div className="flex items-center gap-3">
              {/* Left: icon / map */}
              <div className="flex-shrink-0">
                {n.type === 'order' ? (
                  <div className="w-12 h-12 overflow-hidden">
                    <img
                      src={countryMaps[n.country]}
                      alt={`${'cityLabel' in n ? n.cityLabel : 'Location'} map`}
                      width={48}
                      height={48}
                      loading="lazy"
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                ) : (
                  // mailed icon for completions
                  <div className="w-12 h-12 flex items-center justify-center">
                    <img
                      src="/icons/mailed.svg"
                      alt="Completed order"
                      width={48}
                      height={48}
                      loading="lazy"
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {n.type === 'order' ? (
                  <>
                    <div className="font-semibold text-gray-900 text-sm">
                      A customer from {n.cityLabel}
                    </div>
                    <div className="text-gray-600 text-xs mt-0.5">
                      {n.label === 'Today'
                        ? `just ordered help with ${n.subject}`
                        : `ordered help with ${n.subject}`}
                    </div>
                    {/* timestamp row (single source of truth for time) */}
                    <div className="flex items-center gap-1 mt-1">
                      <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs text-gray-500">{n.label}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="font-semibold text-gray-900 text-sm">
                      <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-mono">
                        {n.orderID}
                      </span>{' '}
                      {n.subject /* subject now included in completion items */}
                    </div>
                    <div className="text-gray-600 text-xs mt-0.5">
                      completed and delivered {n.label}
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}


// ==================== PRICING DISPLAY ====================
function PricingSidebarBody({ formData }: { formData: any }) {
  const readyForPrice = !!formData.serviceType && !!formData.deadline && (formData.pages || 0) > 0

  const pricing: EnhancedPricingData | null = readyForPrice
    ? calculateEnhancedPricing({
        serviceType: formData.serviceType!,
        pages: formData.pages,
        deadline: formData.deadline,
        documentType: formData.documentType,
      })
    : null
    
  const MARKET_UPLIFT = 0.12
  const unit = formData.serviceType === 'presentation' ? 'slide' : 'page'

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
    )
  }

  return (
    <div className="space-y-4 animate-fade-in">
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
          <div className="space-y-2 text-sm mb-6">
            <BreakdownRow label="Base Price" value={formatCurrency(pricing.basePrice)} />
            {pricing.savings > 0 && (
              <BreakdownRow 
                label={`${pricing.discountTier} Discount`} 
                value={`-${formatCurrency(pricing.savings)}`} 
                color="green" 
              />
            )}
            {pricing.rushFee > 0 && (
              <BreakdownRow 
                label={`Rush Charges (+${pricing.rushFeePercentage}%)`} 
                value={`+${formatCurrency(pricing.rushFee)}`} 
                color="orange" 
              />
            )}
          </div>
          <button className="w-full h-12 px-6 rounded-lg border-2 border-blue-600 bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium">
            <ShoppingCartIcon className="w-5 h-5" />
            Continue to Checkout
          </button>
        </CardContent>
      </Card>
      {pricing.savings > 0 && (
        <Card className="p-5 rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-green-700">
              <TagIcon className="w-5 h-5 flex-shrink-0"/>
              <span>You saved <strong>{formatCurrency(pricing.savings)}</strong> with your volume discount.</span>
            </div>
          </div>
        </Card>
      )}
      <div className="flex justify-center items-center gap-6 pt-2">
        <TrustBadge icon={ShieldCheckIcon} text="SSL Secure Checkout" />
        <TrustBadge icon={CheckCircleIcon} text="Money-Back Guarantee" />
      </div>
    </div>
  )
}

// ==================== MAIN COMPONENT ====================
export default function PricingSidebar({ formData, currentStep }: PricingSidebarProps) {
  // Memoize expensive generators
  const notifications = useMemo(() => 
    generateLiveActivityItems({
      days: 7,
      minTotal: 12,
      maxTotal: 18,
      completionRatio: 0.25,
      timezone: 'Asia/Kolkata',
    }), 
    [] // Empty deps = compute once per component mount
  );

  const reviews = useMemo(() => 
    generateLiveReviews({ count: 20 }), 
    [] // Empty deps = compute once per component mount
  );

  let firstCard: React.ReactElement | null = null

  if (currentStep === 'service') {
    firstCard = <PromisesCard />
  } else if (currentStep === 'contact') {
    firstCard = <StatsCard />
  } else if (currentStep === 'assignment') {
    firstCard = (
      <div className="space-y-4">
        <ReviewsCard reviews={reviews} />
        <LiveActivityFeed items={notifications} />
      </div>
    )
  }

  const content = currentStep === 'details'
    ? <PricingSidebarBody formData={formData} />
    : <div className="space-y-6">{firstCard}</div>

  const readyForPrice = !!formData.serviceType && !!formData.deadline && (formData.pages || 0) > 0
  const showPricing = currentStep === 'details' && readyForPrice

  return (
    <div className="space-y-4">
      {!showPricing && (
        <TopMotivationBar
          step={currentStep}
          name={formData.fullName}
          email={formData.email}
        />
      )}
      <div className={showPricing ? "animate-slideUp" : ""}>
        {content}
      </div>
    </div>
  )
}
