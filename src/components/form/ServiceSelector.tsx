'use client'

import { useMemo, useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup } from '@/components/ui/radio-group'
import { CheckIcon } from '@heroicons/react/20/solid'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import {
  DocumentTextIcon,
  PencilSquareIcon,
  PresentationChartLineIcon
} from '@heroicons/react/24/outline'
import type { ServiceType } from '@/types'

interface ServiceOption {
  value: ServiceType
  title: string
  description: string
  icon: React.ComponentType<React.ComponentProps<'svg'>>
  popular?: boolean
}

const services: ServiceOption[] = [
  {
    value: 'writing',
    title: 'Writing',
    description: 'Essays, reports, research papers',
    icon: DocumentTextIcon,
    popular: true
  },
  {
    value: 'editing',
    title: 'Editing',
    description: 'Proofreading, grammar, clarity',
    icon: PencilSquareIcon
  },
  {
    value: 'presentation',
    title: 'Presentation',
    description: 'Designer-quality slides + notes',
    icon: PresentationChartLineIcon
  }
]

interface ServiceSelectorProps {
  value?: ServiceType
  onChange: (value: ServiceType) => void
}

// Dynamic stats calculation - FIXED
const getMonthlyStats = () => {
  const now = new Date()
  const month = now.getMonth() // 0-11
  const day = now.getDate() // 1-31
  const daysInMonth = new Date(now.getFullYear(), month + 1, 0).getDate()
  
  // Seasonal multipliers for MONTHLY TARGETS
  const seasonalBoost = [
    1.1, // Jan - 330-880 target
    1.3, // Feb - 390-1040 target  
    1.4, // Mar - 420-1120 target
    1.5, // Apr - 450-1200 target
    0.8, // May - 240-640 target (summer)
    0.7, // Jun - 210-560 target (low season)
    0.8, // Jul - 240-640 target
    1.0, // Aug - 300-800 target
    1.4, // Sep - 420-1120 target (back to school!)
    1.5, // Oct - 450-1200 target (midterms)
    1.6, // Nov - 480-1280 target (finals prep)
    1.2  // Dec - 360-960 target
  ][month]
  
  // Calculate MONTHLY TARGET (300-800 base range)
  const baseMonthlyTarget = 500 + (day * 8) // Slight daily variation in target
  const monthlyTarget = Math.round(baseMonthlyTarget * seasonalBoost)
  const cappedMonthlyTarget = Math.min(Math.max(monthlyTarget, 300), 1200)
  
  // Calculate CURRENT PROGRESS through month
  const progressThroughMonth = day / daysInMonth
  const currentStudents = Math.round(cappedMonthlyTarget * progressThroughMonth)
  
  // Ensure minimum of 50 students (even on day 1)
  const finalStudents = Math.max(currentStudents, 50)
  
  // Calculate assignments based on CURRENT student count (not monthly target)
  const returningStudents = Math.round(finalStudents * 0.6)
  const newStudents = finalStudents - returningStudents
  const assignments = Math.round(returningStudents * 1.8 + newStudents * 1.2)
  
  // On-time rate stays the same
  const onTimeRate = 97 + (day % 2) // 97-98%
  
  return {
    students: finalStudents,
    assignments,
    onTimeRate,
    // Debug info (remove in production)
    monthlyTarget: cappedMonthlyTarget,
    progress: Math.round(progressThroughMonth * 100)
  }
}

// Animated counter component - custom starting percentage
const AnimatedCounter = ({ 
  target, 
  suffix = '', 
  startPercentage = 0.8, // Default 80%, but can be customized
  duration = 2000 
}: { 
  target: number
  suffix?: string
  startPercentage?: number
  duration?: number 
}) => {
  const [current, setCurrent] = useState(Math.floor(target * startPercentage))

  useEffect(() => {
    const startValue = Math.floor(target * startPercentage)
    const difference = target - startValue
    const increment = difference / (duration / 16) // 60fps
    let currentValue = startValue
    
    setCurrent(startValue)
    
    const timer = setInterval(() => {
      currentValue += increment
      if (currentValue >= target) {
        setCurrent(target)
        clearInterval(timer)
      } else {
        setCurrent(Math.floor(currentValue))
      }
    }, 16)

    return () => clearInterval(timer)
  }, [target, duration, startPercentage])

  return (
    <span className="font-bold">
      {current.toLocaleString()}{suffix}
    </span>
  )
}

// Single rotating trust signal
const RotatingTrustSignal = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const stats = getMonthlyStats()

  const metrics = [
    {
      text: 'Students this month',
      value: stats.students,
      suffix: '+',
      icon: '/icons/customers.svg', // You'll need this SVG or use existing one
      startPercentage: 0.97
    },
    {
      text: 'Assignments Completed',
      value: stats.assignments,
      suffix: '+',
      icon: '/icons/assignments.svg', // Or another appropriate SVG
      startPercentage: 0.95
    },
    {
      text: 'On-time delivery',
      value: stats.onTimeRate,
      suffix: '%',
      icon: '/icons/on-time.svg', // Your mailed.svg
      startPercentage: 0.99
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false) // Fade out
      
      setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % metrics.length)
        setIsVisible(true) // Fade in
      }, 500) // Half second for transition
      
    }, 7000) // 5 seconds for each metric

    return () => clearInterval(interval)
  }, [metrics.length])

  const currentMetric = metrics[currentIndex]

  return (
    <div className="mt-2 flex items-center justify-center gap-2 text-sm">
      <span 
        className={`inline-flex items-center gap-2 font-medium transition-all duration-300 ${
          isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-2'
        }`}
        style={{ color: '#2c4dfa' }}
      >
        <img 
          src={currentMetric.icon} 
          alt="" 
          className="w-8 h-8 flex-shrink-0"
        />
        <AnimatedCounter 
          target={currentMetric.value} 
          suffix={currentMetric.suffix}
          startPercentage={currentMetric.startPercentage}
          key={`${currentIndex}-${currentMetric.value}`}
        />
        <span>{currentMetric.text}</span>
      </span>
    </div>
  )
}

export default function ServiceSelector({ value, onChange }: ServiceSelectorProps) {
  // Clear any existing localStorage data on mount
  useEffect(() => {
    try {
      localStorage.removeItem('hwf:lastServiceType')
      localStorage.removeItem('homework_order_form')
    } catch (e) {
      // Silent fail
    }
  }, [])

  const handleSelect = (val: ServiceType) => {
    onChange(val) // Call parent immediately when user selects
  }

  const handleNext = () => {
    if (value) {
      onChange(value)
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 pb-24 lg:pb-8">
      {/* Header with rotating trust signal */}
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
          What type of help do you need?
        </h2>
        <p className="mt-3 text-base text-gray-600">
          We'll tailor the next steps based on your choice.
        </p>
        
        {/* Single rotating trust signal */}
        <RotatingTrustSignal />
      </div>

      <RadioGroup
        value={value || ''}
        onValueChange={(v) => handleSelect(v as ServiceType)}
        className="space-y-3"
        aria-label="Service Type"
      >
        {services.map((service) => {
          const Icon = service.icon
          const selected = value === service.value

          return (
            <Label key={service.value} htmlFor={service.value} className="block cursor-pointer">
              <Card
                role="radio"
                aria-checked={selected}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleSelect(service.value)
                  }
                }}
                className={`
                  px-4 py-4 transition-all duration-200 ease-in-out border-2 hover:shadow-md bg-white hover:border-blue-300
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2
                  ${
                    selected
                      ? 'border-blue-500 shadow-md bg-blue-50'
                      : 'border-gray-200'
                  }
                `}
                style={{ borderRadius: '6px' }}
              >
                <div className="flex items-center justify-between">
                  {/* Left side: Icon + Content */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex-shrink-0">
                      <Icon className={`h-6 w-6 ${selected ? 'text-blue-600' : 'text-gray-600'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`text-lg font-semibold ${selected ? 'text-blue-900' : 'text-gray-900'}`}>
                          {service.title}
                        </h3>
                        {service.popular && (
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs px-2 py-0.5">
                            Popular
                          </Badge>
                        )}
                      </div>
                      <p className={`text-sm leading-relaxed ${selected ? 'text-blue-700' : 'text-gray-600'}`}>
                        {service.description}
                      </p>
                    </div>
                  </div>

                  {/* Right side: Selection indicator */}
                  <div className="flex-shrink-0">
                    {selected && (
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckIcon className="w-4 h-4 text-green-600" />
                      </div>
                    )}
                  </div>
                </div>
              </Card>
              <input
                type="radio"
                id={service.value}
                name="serviceType"
                value={service.value}
                checked={selected}
                onChange={() => handleSelect(service.value)}
                className="sr-only"
              />
            </Label>
          )
        })}
      </RadioGroup>

      {/* Continue button */}
      <div className="lg:static lg:p-0 lg:border-t-0 z-50 pt-4">
        <Button 
          onClick={handleNext}
          disabled={!value}
          className="w-full h-12 text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          style={{ 
            backgroundColor: '#1b1b20', 
            borderRadius: '6px'
          }}
          onMouseEnter={(e) => !value || (e.currentTarget.style.backgroundColor = '#0f0f14')}
          onMouseLeave={(e) => !value || (e.currentTarget.style.backgroundColor = '#1b1b20')}
        >
          Continue
          <ArrowRightIcon className="w-4 h-4" />
        </Button>
        <p className="text-xs text-gray-500 text-center mt-2">
          Takes less than 10 seconds
        </p>
      </div>
    </div>
  )
}