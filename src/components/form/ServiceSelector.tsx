'use client'

import { useMemo, useState } from 'react'
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
  recommended?: boolean
}

const services: ServiceOption[] = [
  {
    value: 'writing',
    title: 'Writing',
    description: 'Get an original essay, research paper, or report from scratch.',
    icon: DocumentTextIcon,
    recommended: true
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

  // Visually hint a default choice based on last selection
  const hintedValue = useMemo<ServiceType>(() => {
    if (selectedValue) return selectedValue
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem(MEMORY_KEY) as ServiceType | null
      if (saved && services.some((s) => s.value === saved)) return saved
    }
    return 'writing' // Default hint
  }, [selectedValue])

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
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
          What type of help do you need?
        </h2>
        <p className="mt-3 text-lg text-gray-600">
          Choose the service that best fits your academic needs
        </p>
      </div>

      <RadioGroup
        value={selectedValue || hintedValue}
        onValueChange={(v) => handleSelect(v as ServiceType)}
        className="space-y-4"
        aria-label="Service Type"
      >
        {services.map((service) => {
          const Icon = service.icon
          const selected = (selectedValue || hintedValue) === service.value

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
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2
                  ${
                    selected
                      ? 'border-blue-500 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <div className="flex items-start gap-5">
                  {/* Simplified icon - single neutral color */}
                  <div className="mt-2 flex-shrink-0">
                    <Icon className="h-8 w-8 text-gray-600" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-semibold text-gray-900">{service.title}</h3>
                        {service.recommended && (
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                            Recommended
                          </Badge>
                        )}
                      </div>

                      {/* Selection indicator with checkmark */}
                      {selected && (
                        <div className="flex items-center text-blue-600">
                          <CheckIcon className="w-5 h-5 mr-1" />
                          <span className="text-sm font-medium">Selected</span>
                        </div>
                      )}
                    </div>

                    <p className="mt-2 text-sm text-gray-600 leading-relaxed">
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

      {/* Next Button - black styling with arrow */}
      {selectedValue && (
        <div className="flex justify-end pt-2">
          <Button 
            onClick={handleNext}
            size="lg"
            className="px-6 py-3 text-base flex items-center gap-2 bg-black text-white hover:bg-gray-800"
          >
            Next
            <ArrowRightIcon className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  )
}