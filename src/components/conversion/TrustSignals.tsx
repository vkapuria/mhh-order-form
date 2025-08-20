'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ShieldCheckIcon, 
  CreditCardIcon, 
  ClockIcon,
  StarIcon,
  UserGroupIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline'

interface TrustSignalsProps {
  variant?: 'sidebar' | 'modal' | 'footer'
  showDetailed?: boolean
}

export default function TrustSignals({ 
  variant = 'sidebar', 
  showDetailed = false 
}: TrustSignalsProps) {
  
  const testimonials = [
    {
      text: "Got my essay 2 days early and it was perfect! Saved my semester.",
      author: "Sarah M.",
      subject: "Psychology",
      rating: 5
    },
    {
      text: "Professional work, great communication. Will definitely use again.",
      author: "Mike T.", 
      subject: "Business",
      rating: 5
    },
    {
      text: "The editing service transformed my paper. Worth every penny!",
      author: "Emma L.",
      subject: "English Literature", 
      rating: 5
    }
  ]

  const guarantees = [
    {
      icon: ShieldCheckIcon,
      title: "100% Original Work",
      description: "Plagiarism-free guarantee with free report"
    },
    {
      icon: ClockIcon,
      title: "On-Time Delivery",
      description: "98% delivered early or on time"
    },
    {
      icon: CreditCardIcon,
      title: "Money Back Guarantee",
      description: "Full refund if not satisfied"
    },
    {
      icon: CheckBadgeIcon,
      title: "Expert Writers",
      description: "PhD & Masters qualified professionals"
    }
  ]

  if (variant === 'footer') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        {guarantees.map((guarantee, index) => {
          const IconComponent = guarantee.icon
          return (
            <div key={index} className="flex flex-col items-center space-y-2">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <IconComponent className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{guarantee.title}</p>
                <p className="text-xs text-gray-600">{guarantee.description}</p>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  if (variant === 'modal') {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {guarantees.slice(0, 4).map((guarantee, index) => {
            const IconComponent = guarantee.icon
            return (
              <div key={index} className="flex items-center space-x-2">
                <IconComponent className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-medium text-gray-700">{guarantee.title}</span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Sidebar variant (default)
  return (
    <div className="space-y-4">
      {/* Stats Card */}
      <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
        <h5 className="font-semibold text-gray-900 mb-3 text-center">
          Trusted by Students Worldwide
        </h5>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">2,847+</div>
            <div className="text-xs text-gray-600">Happy Students</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">4.9/5</div>
            <div className="text-xs text-gray-600">Average Rating</div>
          </div>
        </div>
      </Card>

      {/* Guarantees */}
      <Card className="p-4">
        <h5 className="font-semibold text-gray-900 mb-3">Our Guarantees</h5>
        <div className="space-y-3">
          {guarantees.map((guarantee, index) => {
            const IconComponent = guarantee.icon
            return (
              <div key={index} className="flex items-start space-x-2">
                <IconComponent className="w-4 h-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{guarantee.title}</p>
                  <p className="text-xs text-gray-600">{guarantee.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Recent Testimonial */}
      {showDetailed && (
        <Card className="p-4 bg-gray-50">
          <div className="flex items-center space-x-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <StarIcon key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <p className="text-sm text-gray-700 mb-2 italic">
            "{testimonials[0].text}"
          </p>
          <div className="flex justify-between text-xs text-gray-500">
            <span>- {testimonials[0].author}</span>
            <span>{testimonials[0].subject}</span>
          </div>
        </Card>
      )}

      {/* Security Badges */}
      <div className="flex justify-center space-x-2">
        <Badge variant="outline" className="text-xs">
          🔒 SSL Secure
        </Badge>
        <Badge variant="outline" className="text-xs">
          💳 Safe Payment
        </Badge>
      </div>
    </div>
  )
}