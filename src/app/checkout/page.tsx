// src/app/checkout/page.tsx
'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import PaperformEmbed from '@/components/payment/PaperformEmbed'

import {
  CheckCircleIcon,
  DocumentTextIcon,
  ClockIcon,
  UserIcon,
  EnvelopeIcon,
  DocumentDuplicateIcon,
  AcademicCapIcon,
  PaperClipIcon,
  ArrowLeftIcon,
  LockClosedIcon,
  CreditCardIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

// Separate component for the search params logic
function CheckoutContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const [orderData, setOrderData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In real app, fetch order details from API using orderId
    // For now, get from localStorage (passed from form)
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
          <p className="text-gray-600 mb-6">We couldn&apos;t find your order details.</p>
          <Button onClick={() => window.location.href = '/'}>
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Form
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Secure Checkout</h1>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <LockClosedIcon className="w-4 h-4" />
              <span>SSL Encrypted</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* LEFT SIDE: Order Summary */}
          <div className="space-y-6">
            {/* Order Details Card */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">1. Review Your Order</h2>
                <Badge className="bg-purple-100 text-purple-800">
                  Order: #{orderData.id?.slice(0, 8).toUpperCase()}
                </Badge>
              </div>

              <div className="space-y-4">
                {/* Assignment Details */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <DocumentTextIcon className="w-5 h-5 text-purple-600" />
                    Assignment Details
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Academic Level</span>
                      <p className="font-medium">N/A</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Subject</span>
                      <p className="font-medium capitalize">{orderData.subject}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Document Type</span>
                      <p className="font-medium capitalize">{orderData.documentType?.replace(/_/g, ' ')}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Reference Style</span>
                      <p className="font-medium uppercase">{orderData.referenceStyle}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Deadline</span>
                      <p className="font-medium">{orderData.deadline} Days ({getDeliveryDate(orderData.deadline)})</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Number of Pages</span>
                      <p className="font-medium">{orderData.pages} page{orderData.pages > 1 ? 's' : ''} ({orderData.pages * 275} words)</p>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                {orderData.instructions && (
                  <div className="border rounded-lg p-3">
                    <p className="text-sm text-gray-500 mb-1">📝 Assignment Instructions</p>
                    <p className="text-sm italic">{orderData.instructions}</p>
                  </div>
                )}

                {/* Uploaded Files */}
                {orderData.attachments && orderData.attachments.length > 0 && (
                  <div className="border rounded-lg p-3">
                    <p className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                      <PaperClipIcon className="w-4 h-4" />
                      Uploaded Files ({orderData.attachments.length})
                    </p>
                    {orderData.attachments.map((file: any, index: number) => (
                      <div key={index} className="text-sm text-blue-600 hover:underline">
                        • {file.file_name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* Price Summary Card */}
            <Card className="p-6">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <CreditCardIcon className="w-5 h-5" />
                Price Summary
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Base Price:</span>
                  <span>${orderData.basePrice || '0.00'}</span>
                </div>
                
                {orderData.discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount:</span>
                    <span>-${orderData.discountAmount}</span>
                  </div>
                )}
                
                {orderData.rushFee > 0 && (
                  <div className="flex justify-between text-sm text-orange-600">
                    <span>Rush Fee:</span>
                    <span>+${orderData.rushFee}</span>
                  </div>
                )}
                
                <Separator />
                
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total Price:</span>
                  <span className="text-purple-600">${orderData.totalPrice || '0.00'}</span>
                </div>
              </div>
            </Card>

            {/* Edit Order Button */}
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.location.href = '/'}
            >
              ✏️ Edit Order
            </Button>
          </div>

          {/* RIGHT SIDE: Payment Form */}
          <div className="space-y-6">
            {/* Payment Card */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">2. Make Secure Payment</h2>
              
              {/* Contact Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <UserIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Your Name:</span>
                    <span className="font-medium">{orderData.fullName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <EnvelopeIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Email Address:</span>
                    <span className="font-medium">{orderData.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CreditCardIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Order Price:</span>
                    <span className="font-medium text-purple-600">${orderData.totalPrice}</span>
                  </div>
                </div>
              </div>

              {/* Total Payable */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Payable*</span>
                  <span className="text-2xl font-bold text-purple-600">${orderData.totalPrice}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Includes 5% PayPal Service Fee (auto-calculated)
                </p>
              </div>

              {/* PAPERFORM PAYMENT EMBED */}
              <div className="border rounded-lg p-4">
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

              {/* Payment Methods */}
              <div className="flex justify-center gap-3 mt-4 opacity-60">
                <Badge variant="outline">Visa</Badge>
                <Badge variant="outline">Mastercard</Badge>
                <Badge variant="outline">PayPal</Badge>
                <Badge variant="outline">Stripe</Badge>
              </div>
            </Card>

            {/* Service Guarantees */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <ShieldCheckIcon className="w-5 h-5 text-green-600" />
                Our Service Guarantees
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl mb-1">✅</div>
                  <p className="text-xs font-medium">100% Quality Guarantee</p>
                  <p className="text-xs text-gray-600">Original work that meets requirements</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl mb-1">⏰</div>
                  <p className="text-xs font-medium">On-Time Delivery</p>
                  <p className="text-xs text-gray-600">Or your money back</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl mb-1">🔄</div>
                  <p className="text-xs font-medium">Free Revisions</p>
                  <p className="text-xs text-gray-600">14 days after delivery</p>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-2xl mb-1">🚫</div>
                  <p className="text-xs font-medium">Plagiarism-Free</p>
                  <p className="text-xs text-gray-600">Checked for plagiarism</p>
                </div>
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}