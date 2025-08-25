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
}

const services: ServiceOption[] = [
  {
    value: 'writing',
    title: 'Writing',
    description: 'Get an original essay, research paper, or report from scratch.',
    icon: DocumentTextIcon
  },
  {
    value: 'editing',
    title: 'Editing',
    description: 'Have your existing draft proofread for grammar, clarity, and flow.',
    icon: PencilSquareIcon
  },
  {
    value: 'presentation',
    title: 'Presentation',
    description: 'Receive designer-quality slides with compelling speaker notes.',
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
    <div className="mx-auto max-w-xl space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
          What type of help do you need?
        </h2>
        <p className="mt-3 text-lg text-gray-600">
          Choose the service that best fits your academic needs
        </p>
      </div>

      <RadioGroup
        value={selectedValue || ''}
        onValueChange={(v) => handleSelect(v as ServiceType)}
        className="space-y-4"
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
                  px-6 py-4 transition-all duration-200 ease-in-out border-2 hover:shadow-md bg-white
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2
                  ${
                    selected
                      ? 'border-purple-500 shadow-md bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <div className="flex items-start gap-5">
                  {/* Icon */}
                  <div className="mt-2 flex-shrink-0">
                    <Icon className={`h-8 w-8 ${selected ? 'text-purple-600' : 'text-gray-600'}`} />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <h3 className={`text-xl font-semibold ${selected ? 'text-purple-900' : 'text-gray-900'}`}>
                          {service.title}
                        </h3>
                      </div>

                      {/* Selection chip - green for confirmation */}
                      {selected && (
                        <div className="flex items-center">
                          <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1">
                            <CheckIcon className="w-3 h-3" />
                            Selected
                          </Badge>
                        </div>
                      )}
                    </div>

                    <p className={`mt-2 text-sm leading-relaxed ${selected ? 'text-purple-700' : 'text-gray-600'}`}>
                      {service.description}
                    </p>
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

      {/* Next Button - purple styling to match theme */}
      {selectedValue && (
        <div className="flex justify-end pt-2">
          <Button 
            onClick={handleNext}
            size="lg"
            className="px-6 py-3 text-base flex items-center gap-2 bg-purple-600 text-white hover:bg-purple-700"
          >
            Next
            <ArrowRightIcon className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  )
}