// src/app/checkout/page.tsx
'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import PaperformEmbed from '@/components/payment/PaperformEmbed'

import {
  DocumentTextIcon,
  ClockIcon,
  UserIcon,
  EnvelopeIcon,
  PaperClipIcon,
  ArrowLeftIcon,
  LockClosedIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  PencilIcon,
  MagnifyingGlassIcon,  // ADD THIS
  ShoppingCartIcon      // ADD THIS
} from '@heroicons/react/24/outline'

// Separate component for the search params logic
function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = searchParams.get('orderId')
  const [orderData, setOrderData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('checkout_order')
    if (stored) {
      setOrderData(JSON.parse(stored))
    }
    setLoading(false)
  }, [orderId])

  const getDeliveryDate = (days: string) => {
    const date = new Date()
    date.setDate(date.getDate() + parseInt(days))
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
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

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 lg:px-10 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* LEFT SIDE: Order Summary */}
          <div className="space-y-6">
            
            {/* Order Details Card */}
            <Card className="p-4 sm:p-6 border border-gray-400 rounded-xl bg-white">
              <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <MagnifyingGlassIcon className="w-5 h-5 text-purple-600" />
                Review Your Order
              </h2>
                <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                  Order #{orderData.id?.slice(0, 8).toUpperCase()}
                </Badge>
              </div>

              <div className="space-y-6">
                
                {/* Contact Information */}
                <div>
                  <h3 className="font-medium flex items-center gap-2 mb-3">
                    <UserIcon className="w-5 h-5 text-purple-600" />
                    Contact
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">Name</span>
                        <p className="font-medium">{orderData.fullName}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Email</span>
                        <p className="font-medium">{orderData.email}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Assignment Details */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium flex items-center gap-2">
                      <DocumentTextIcon className="w-5 h-5 text-purple-600" />
                      Assignment
                    </h3>
                    <button
                      onClick={() => router.push('/')}
                      className="flex items-center gap-1 px-2 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <PencilIcon className="w-3 h-3" />
                      <span className="hidden sm:inline">Change</span>
                    </button>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">Service</span>
                        <p className="font-medium capitalize">{orderData.serviceType}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Subject</span>
                        <p className="font-medium capitalize">{orderData.subject}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Paper Type</span>
                        <p className="font-medium capitalize">{orderData.documentType?.replace(/_/g, ' ')}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Reference Style</span>
                        <p className="font-medium uppercase">{orderData.referenceStyle}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Pages</span>
                        <p className="font-medium">{orderData.pages} page{orderData.pages > 1 ? 's' : ''} ({orderData.pages * 275} words)</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Deadline</span>
                        <p className="font-medium">{orderData.deadline} day{orderData.deadline !== '1' ? 's' : ''} ({getDeliveryDate(orderData.deadline)})</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                {orderData.instructions && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Instructions</h3>
                    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                      <p className="text-sm text-gray-700">{orderData.instructions}</p>
                    </div>
                  </div>
                )}

                {/* Files */}
                {orderData.attachments && orderData.attachments.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium flex items-center gap-2">
                        <PaperClipIcon className="w-5 h-5 text-purple-600" />
                        Files ({orderData.attachments.length})
                      </h3>
                      <button
                        onClick={() => router.push('/')}
                        className="flex items-center gap-1 px-2 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <PencilIcon className="w-3 h-3" />
                        <span className="hidden sm:inline">Change</span>
                      </button>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                      {orderData.attachments.map((file: any, index: number) => (
                        <div key={index} className="text-sm text-gray-700">
                          • {file.fileName || file.file_name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Price Summary Card */}
            <Card className="p-4 sm:p-6 shadow-none sm:shadow-sm border-0 sm:border sm:border-gray-200 sm:rounded-xl bg-transparent sm:bg-white">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <CreditCardIcon className="w-5 h-5 text-purple-600" />
                Price Summary
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Base Price</span>
                  <span>${(orderData.basePrice || 0).toFixed(2)}</span>
                </div>
                
                {orderData.discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-${orderData.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                
                {orderData.rushFee > 0 && (
                  <div className="flex justify-between text-sm text-orange-600">
                    <span>Rush Fee</span>
                    <span>+${orderData.rushFee.toFixed(2)}</span>
                  </div>
                )}
                
                <Separator />
                
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-purple-600">${(orderData.totalPrice || 0).toFixed(2)}</span>
                </div>
              </div>
            </Card>

            {/* Edit Order Button */}
            <Button 
              variant="outline" 
              className="w-full h-12 rounded-lg border border-gray-300 hover:bg-gray-50"
              onClick={() => router.push('/')}
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Edit Order
            </Button>
          </div>

          {/* RIGHT SIDE: Payment */}
          <div className="space-y-6">
            
            {/* Payment Section */}
            <Card className="p-4 sm:p-6 border border-gray-400 rounded-xl bg-white">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <ShoppingCartIcon className="w-5 h-5 text-purple-600" />
                Secure Checkout
              </h2>

              {/* Payment Embed */}
              <div className="mb-2" data-payment-section>
                <PaperformEmbed
                  formId="homework-payment"
                  prefillData={{
                    name: orderData.fullName,
                    email: orderData.email,
                    amount: orderData.totalPrice,
                    orderId: orderData.id?.slice(0, 8).toUpperCase()
                  }}
                />
              </div>

              {/* Trust Strip */}
              <div className="text-center text-sm text-gray-600 mb-2">
                <div className="flex items-center justify-center gap-2">
                  <ShieldCheckIcon className="w-4 h-4" />
                  <span>SSL Secure</span>
                  <span className="text-gray-300">|</span>
                  <span>Money-Back Guarantee</span>
                  <span className="text-gray-300">|</span>
                  <span>98% On-Time</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="flex justify-center items-center gap-3 opacity-70">
                <img 
                  src="/icons/visa.svg" 
                  alt="Visa" 
                  className="h-8 w-auto"
                />
                <img 
                  src="/icons/Mastercard.svg" 
                  alt="Mastercard" 
                  className="h-8 w-auto"
                />
                <img 
                  src="/icons/PayPal.svg" 
                  alt="PayPal" 
                  className="h-8 w-auto"
                />
                <img 
                  src="/icons/stripe.svg" 
                  alt="Stripe" 
                  className="h-8 w-auto"
                />
                <img 
                  src="/icons/Amex.svg" 
                  alt="American Express" 
                  className="h-8 w-auto"
                />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main component with Suspense wrapper
export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}