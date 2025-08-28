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

const MEMORY_KEY = 'hwf:lastServiceType'

interface ServiceSelectorProps {
  value?: ServiceType
  onChange: (value: ServiceType) => void
}

export default function ServiceSelector({ value, onChange }: ServiceSelectorProps) {
  const [selectedValue, setSelectedValue] = useState<ServiceType | undefined>(value)

  // Set initial selection based on memory or default
  useEffect(() => {
    if (!selectedValue && !value) {
      let initialValue: ServiceType = 'writing' // Default
      
      if (typeof window !== 'undefined') {
        const saved = window.localStorage.getItem(MEMORY_KEY) as ServiceType | null
        if (saved && services.some((s) => s.value === saved)) {
          initialValue = saved
        }
      }
      
      setSelectedValue(initialValue)
    }
  }, [selectedValue, value])

  const handleSelect = (val: ServiceType) => {
    try {
      window.localStorage.setItem(MEMORY_KEY, val)
    } catch (e) {
      console.error('Failed to save to localStorage', e)
    }
    setSelectedValue(val)
  }

  const handleNext = () => {
    if (selectedValue) {
      onChange(selectedValue)
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 pb-24 lg:pb-8">
      {/* Header with micro-trust */}
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
          What type of help do you need?
        </h2>
        <p className="mt-3 text-base text-gray-600">
          We'll tailor the next steps based on your choice.
        </p>
        <div className="mt-2 flex items-center justify-center gap-2 text-sm">
          <span className="inline-flex items-center gap-1 text-purple-600 font-medium">
            <CheckIcon className="w-4 h-4" />
            Trusted by 5,000+ students this month
          </span>
        </div>
      </div>

      <RadioGroup
        value={selectedValue || ''}
        onValueChange={(v) => handleSelect(v as ServiceType)}
        className="space-y-3"
        aria-label="Service Type"
      >
        {services.map((service) => {
          const Icon = service.icon
          const selected = selectedValue === service.value

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
                  px-4 py-4 transition-all duration-200 ease-in-out border-2 hover:shadow-md bg-white hover:border-purple-300
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2
                  ${
                    selected
                      ? 'border-purple-500 shadow-md bg-purple-50'
                      : 'border-gray-200'
                  }
                `}
                style={{ borderRadius: '6px' }}
              >
                <div className="flex items-center justify-between">
                  {/* Left side: Icon + Content */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex-shrink-0">
                      <Icon className={`h-6 w-6 ${selected ? 'text-purple-600' : 'text-gray-600'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`text-lg font-semibold ${selected ? 'text-purple-900' : 'text-gray-900'}`}>
                          {service.title}
                        </h3>
                        {service.popular && (
                          <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs px-2 py-0.5">
                            Popular
                          </Badge>
                        )}
                      </div>
                      <p className={`text-sm leading-relaxed ${selected ? 'text-purple-700' : 'text-gray-600'}`}>
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

      {/* Sticky Next button for mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 lg:static lg:p-0 lg:border-t-0">
        <Button 
          onClick={handleNext}
          disabled={!selectedValue}
          className="w-full h-12 text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          style={{ 
            backgroundColor: '#1b1b20', 
            borderRadius: '6px'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0f0f14'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1b1b20'}
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