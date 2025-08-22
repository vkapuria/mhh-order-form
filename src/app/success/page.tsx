'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  CheckCircleIcon,
  ClockIcon,
  EnvelopeIcon,
  PhoneIcon,
  DocumentTextIcon,
  StarIcon,
  ArrowRightIcon,
  ShareIcon
} from '@heroicons/react/24/outline'

// Separate component for the search params logic
function SuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const [orderData, setOrderData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get order data from localStorage (passed from checkout)
    const stored = localStorage.getItem('checkout_order')
    if (stored) {
      setOrderData(JSON.parse(stored))
    }
    setLoading(false)
  }, [orderId])

  const handleNewOrder = () => {
    // Clear previous order data
    localStorage.removeItem('checkout_order')
    // Redirect to new order
    window.location.href = '/'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">🎉 Order Complete!</h1>
            <p className="text-lg text-gray-600 mt-2">
              Thank you for choosing DoMyHomework - your academic success is our priority
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT SIDE: Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Order Confirmation Card */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Payment Confirmed</h2>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  PAID
                </Badge>
              </div>

              {orderData && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Order ID:</span>
                      <p className="font-medium font-mono">#{orderId?.slice(0, 8).toUpperCase()}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Amount Paid:</span>
                      <p className="font-medium text-green-600 text-lg">${orderData.totalPrice}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Service:</span>
                      <p className="font-medium capitalize">{orderData.serviceType}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Pages:</span>
                      <p className="font-medium">{orderData.pages} page{orderData.pages > 1 ? 's' : ''}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Subject:</span>
                      <p className="font-medium capitalize">{orderData.subject}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Deadline:</span>
                      <p className="font-medium">{orderData.deadline} days</p>
                    </div>
                  </div>

                  {orderData.attachments && orderData.attachments.length > 0 && (
                    <div className="border-t pt-4">
                      <p className="text-sm text-gray-500 mb-2">📎 Files Submitted:</p>
                      {orderData.attachments.map((file: any, index: number) => (
                        <p key={index} className="text-sm text-blue-600">• {file.fileName}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* What Happens Next */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-purple-600" />
                What Happens Next?
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-purple-600">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Expert Assignment (Within 2 Hours)</h4>
                    <p className="text-sm text-gray-600">We&apos;ll match you with a qualified expert in your subject area and begin work immediately.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-purple-600">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Progress Updates</h4>
                    <p className="text-sm text-gray-600">You&apos;ll receive email updates as we work on your assignment.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-purple-600">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Quality Review & Delivery</h4>
                    <p className="text-sm text-gray-600">Before your deadline, you&apos;ll receive the completed work with quality assurance.</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Contact Information */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Need Help or Have Questions?</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <EnvelopeIcon className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-medium">Email Support</p>
                    <a href="mailto:orders@domyhomework.co" className="text-sm text-purple-600 hover:underline">
                      orders@domyhomework.co
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <DocumentTextIcon className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-medium">Order Reference</p>
                    <p className="text-sm text-gray-600">Quote order ID in all communications</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* RIGHT SIDE: Social Proof & CTA */}
          <div className="space-y-6">
            
            {/* Email Confirmation Notice */}
            <Card className="p-6 bg-blue-50 border-blue-200">
              <div className="text-center">
                <EnvelopeIcon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h4 className="font-semibold text-blue-900 mb-2">Check Your Email</h4>
                <p className="text-sm text-blue-700">
                  Order confirmation and updates sent to:<br />
                  <strong>{orderData?.email}</strong>
                </p>
              </div>
            </Card>

            {/* Success Stats */}
            <Card className="p-6">
              <h4 className="font-semibold mb-4 text-center">Join Our Success Community</h4>
              
              <div className="space-y-3">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">2,847+</div>
                  <p className="text-xs text-green-700">Satisfied Students This Month</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-xl font-bold text-purple-600">4.9/5</div>
                    <p className="text-xs text-purple-700">Average Rating</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-xl font-bold text-blue-600">98%</div>
                    <p className="text-xs text-blue-700">On-Time Delivery</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Testimonial */}
            <Card className="p-6">
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm italic text-gray-600 mb-3">
                &quot;DoMyHomework helped me get my essay done perfectly and on time. The quality was amazing and my professor loved it!&quot;
              </p>
              <p className="text-xs text-gray-500">- Sarah M., Psychology Student</p>
            </Card>

            {/* Call to Actions */}
            <div className="space-y-3">
              <Button 
                onClick={handleNewOrder}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <DocumentTextIcon className="w-4 h-4 mr-2" />
                Need Another Assignment?
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  const shareText = `Just got help with my ${orderData?.serviceType || 'assignment'} from DoMyHomework! 🎓 Professional academic support that actually works.`
                  const shareUrl = 'https://order.domyhomework.co'
                  
                  if (navigator.share) {
                    navigator.share({ title: 'DoMyHomework', text: shareText, url: shareUrl })
                  } else {
                    navigator.clipboard.writeText(`${shareText} ${shareUrl}`)
                    alert('Link copied to clipboard!')
                  }
                }}
              >
                <ShareIcon className="w-4 h-4 mr-2" />
                Share with Friends
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border-t mt-12">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <p className="text-gray-600 mb-2">
            🎓 <strong>DoMyHomework</strong> - Your Academic Success Partner
          </p>
          <p className="text-sm text-gray-500">
            Professional academic services with guaranteed quality and on-time delivery.
          </p>
        </div>
      </div>
    </div>
  )
}

// Main component with Suspense wrapper
export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}