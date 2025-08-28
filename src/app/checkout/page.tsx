// src/app/checkout/page.tsx
'use client'

import { useEffect, useState, Suspense, useRef, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import PaperformEmbed from '@/components/payment/PaperformEmbed'

import {
  ArrowLeftIcon,
  LockClosedIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  CalendarIcon,
  ChatBubbleBottomCenterTextIcon,
} from '@heroicons/react/24/outline'

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = searchParams.get('orderId')
  const [orderData, setOrderData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [showStickyButton, setShowStickyButton] = useState(false)
  const paySectionRef = useRef<HTMLDivElement | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('checkout_order')
    if (stored) setOrderData(JSON.parse(stored))
    setLoading(false)
  }, [orderId])

  // Intersection Observer to track payment form visibility
  useEffect(() => {
    if (!paySectionRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        // Show sticky button when payment form is NOT in view (less than 10% visible)
        setShowStickyButton(!entry.isIntersecting || entry.intersectionRatio < 0.1)
      },
      {
        threshold: [0, 0.1], // Trigger when 0% and 10% visible
        rootMargin: '-20px 0px' // Add some buffer
      }
    )

    observer.observe(paySectionRef.current)

    return () => observer.disconnect()
  }, [paySectionRef.current])

  const getDeliveryDate = (days: string) => {
    const date = new Date()
    date.setDate(date.getDate() + parseInt(days || '0', 10))
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  const totalPrice = Number(orderData?.totalPrice || 0)
  const basePrice = Number(orderData?.basePrice || 0)
  const discountAmount = Number(orderData?.discountAmount || 0)
  const rushFee = Number(orderData?.rushFee || 0)

  const scrollToPayment = useCallback(() => {
    if (!paySectionRef.current) return
    paySectionRef.current.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center' // Better centering
    })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    )
  }

  if (!orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Card className="p-4 sm:p-8 shadow-none sm:shadow-sm border-0 sm:border sm:border-gray-200 sm:rounded-xl bg-transparent sm:bg-white text-center">
          <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
          <p className="text-gray-600 mb-6">We couldn't find your order details.</p>
          <Button
            onClick={() => router.push('/')}
            className="h-12 px-6 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Form
          </Button>
        </Card>
      </div>
    )
  }

  // --- unit helpers for presentation vs others ---
const isPresentation = orderData?.serviceType === 'presentation'
const unitsLabel = isPresentation ? 'Slides' : 'Pages'
const unitSingular = isPresentation ? 'slide' : 'page'


  return (
    <div className="min-h-screen bg-white">
      {/* Optimized sticky mobile pay bar - only shows when payment form out of view */}
      <div 
        className={`fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-4 py-3 lg:hidden transition-transform duration-300 shadow-lg ${
          showStickyButton ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ 
          boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1), 0 -2px 4px -1px rgba(0, 0, 0, 0.06)' 
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-gray-900">
              ${totalPrice.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500">
              Order #{orderData.id?.slice(0, 8).toUpperCase()}
            </div>
          </div>
          <Button
            onClick={scrollToPayment}
            className="h-11 px-6 rounded-lg bg-purple-600 text-white hover:bg-purple-700 font-medium shadow-md"
          >
            Complete Payment
          </Button>
        </div>
      </div>

      {/* Add bottom padding on mobile to account for sticky button */}
      <div className="pb-20 lg:pb-0">
        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-3 lg:px-10 py-8">
          {/* Simple breadcrumb / reassurance */}
          <div className="mb-6 flex items-center gap-2 text-sm text-gray-600">
            <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 font-medium">
              Step 3 of 3
            </span>
            <span className="text-gray-300">•</span>
            <span className="inline-flex items-center gap-2">
              <LockClosedIcon className="w-4 h-4 text-green-600" />
              Secure checkout
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* RIGHT on desktop, TOP on mobile: Payment */}
            <div className="order-1 lg:order-2 space-y-6">
              <Card 
                ref={paySectionRef} 
                className="p-6 border border-gray-200 rounded-xl bg-white shadow-sm"
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold mb-2 flex items-center gap-2">
                    <CreditCardIcon className="w-6 h-6 text-purple-600" />
                    Secure Payment
                  </h2>
                  <p className="text-sm text-gray-600">
                    🔒 Protected by SSL encryption. Most orders begin within 1 hour of payment.
                  </p>
                </div>

                {/* Payment Embed */}
                <div className="mb-6" data-payment-section>
                  <PaperformEmbed
                    formId="homework-payment"
                    prefillData={{
                      name: orderData.fullName,
                      email: orderData.email,
                      amount: totalPrice,
                      orderId: orderData.id?.slice(0, 8).toUpperCase(),
                    }}
                  />
                </div>

                {/* Enhanced trust strip */}
                <div className="border-t border-gray-100 pt-6">
                  <div className="grid grid-cols-2 gap-4 text-center text-sm mb-4">
                    <div className="flex flex-col items-center">
                      <ShieldCheckIcon className="w-6 h-6 text-green-600 mb-1" />
                      <span className="font-medium">Money-Back Guarantee</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <DocumentTextIcon className="w-6 h-6 text-blue-600 mb-1" />
                      <span className="font-medium">98% On-Time Delivery</span>
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="flex justify-center items-center gap-3 opacity-75">
                    <img src="/icons/visa.svg" alt="Visa" className="h-8 w-auto" />
                    <img src="/icons/Mastercard.svg" alt="Mastercard" className="h-8 w-auto" />
                    <img src="/icons/PayPal.svg" alt="PayPal" className="h-8 w-auto" />
                    <img src="/icons/stripe.svg" alt="Stripe" className="h-8 w-auto" />
                    <img src="/icons/Amex.svg" alt="American Express" className="h-8 w-auto" />
                  </div>
                </div>
              </Card>
            </div>

            {/* LEFT on desktop, BOTTOM on mobile: Minimal Order Summary */}
            <div className="order-2 lg:order-1 space-y-6">
              <Card className="p-6 border border-gray-200 rounded-xl bg-white shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                    <DocumentTextIcon className="w-6 h-6 text-purple-600" />
                    Review Your Order
                  </h2>
                  <Badge className="bg-purple-100 text-purple-800 border-purple-200 px-3 py-1">
                    #{orderData.id?.slice(0, 8).toUpperCase()}
                  </Badge>
                </div>

                {/* Clean summary rows */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Service</span>
                    <span className="font-semibold capitalize">{orderData.serviceType}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Assignment</span>
                    <div className="text-right">
                      <div className="font-semibold">
                        {orderData.pages}{' '}
                        {orderData.pages === 1 ? unitSingular : unitsLabel.toLowerCase()} •{' '}
                        {orderData.deadline} day{orderData.deadline !== '1' ? 's' : ''}
                      </div>
                      <div className="text-sm text-gray-500">
                        {isPresentation
                          ? <>Due {getDeliveryDate(orderData.deadline)}</>
                          : <>{orderData.pages * 275} words • Due {getDeliveryDate(orderData.deadline)}</>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-3 bg-purple-50 px-4 rounded-lg">
                    <span className="font-semibold text-lg">Total</span>
                    <span className="font-bold text-2xl text-purple-600">${totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                {/* Collapsible details */}
                <div className="border-t border-gray-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setDetailsOpen((v) => !v)}
                    className="w-full text-left flex items-center justify-between py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                    aria-expanded={detailsOpen}
                  >
                    <span className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-purple-600" />
                      {detailsOpen ? 'Hide order details' : 'View order details'}
                    </span>
                    <span className="text-gray-400">
                      {detailsOpen ? '−' : '+'}
                    </span>
                  </button>

                  {detailsOpen && (
                    <div className="mt-4 space-y-6 text-sm">
                      {/* Contact */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium mb-3 text-gray-900">Contact Information</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <span className="text-gray-500">Name</span>
                            <p className="font-medium">{orderData.fullName}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Email</span>
                            <p className="font-medium break-all">{orderData.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* Assignment details */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium mb-3 text-gray-900">Assignment Details</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <span className="text-gray-500">Subject</span>
                            <p className="font-medium capitalize">{orderData.subject}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Document Type</span>
                            <p className="font-medium capitalize">
                              {orderData.documentType?.replace(/_/g, ' ')}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">Reference Style</span>
                            <p className="font-medium uppercase">{orderData.referenceStyle}</p>
                          </div>
                        </div>
                      </div>

                      {/* Instructions */}
                      {orderData.instructions && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-medium mb-2 text-gray-900">Instructions</h4>
                          <div className="bg-white border border-gray-200 rounded p-3">
                            <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                              {orderData.instructions}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Files */}
                      {orderData.attachments && orderData.attachments.length > 0 && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-medium mb-2 text-gray-900">
                            Uploaded Files ({orderData.attachments.length})
                          </h4>
                          <div className="bg-white border border-gray-200 rounded p-3">
                            {orderData.attachments.map((file: any, index: number) => (
                              <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                                <DocumentTextIcon className="w-4 h-4 text-blue-500" />
                                {file.fileName || file.file_name}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Price breakdown */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium mb-3 text-gray-900">Price Breakdown</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Base Price</span>
                            <span className="font-medium">${basePrice.toFixed(2)}</span>
                          </div>
                          {discountAmount > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span>Discount</span>
                              <span className="font-medium">-${discountAmount.toFixed(2)}</span>
                            </div>
                          )}
                          {rushFee > 0 && (
                            <div className="flex justify-between text-orange-600">
                              <span>Rush Fee</span>
                              <span className="font-medium">+${rushFee.toFixed(2)}</span>
                            </div>
                          )}
                          <Separator />
                          <div className="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span className="text-purple-600">${totalPrice.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Subtle edit option */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="text-sm text-gray-500 hover:text-gray-700 underline decoration-dotted underline-offset-4"
                  >
                    Need to change something?
                  </button>
                </div>

                {/* Edit confirmation modal */}
                {showEditModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div 
                      className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
                      onClick={() => setShowEditModal(false)}
                    />
                    <div className="relative bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Return to edit your order?
                      </h3>
                      <p className="text-sm text-gray-600 mb-6">
                        You can come back to complete payment anytime using the link in your confirmation email.
                      </p>
                      <div className="flex gap-3">
                        <Button
                          onClick={() => {
                            setShowEditModal(false)
                            router.push('/')
                          }}
                          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          Yes, edit order
                        </Button>
                        <Button
                          onClick={() => setShowEditModal(false)}
                          variant="outline"
                          className="flex-1"
                        >
                          No, stay here
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </Card>

              {/* Help section */}
              <div className="flex items-start gap-3 text-sm text-gray-600 bg-blue-50 rounded-lg p-4">
                <ChatBubbleBottomCenterTextIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-blue-900 mb-1">Need Help?</p>
                  <p className="text-blue-700">
                    Reply to your confirmation email after payment. Our support team typically responds within a few hours.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main component with Suspense wrapper
export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  )
}