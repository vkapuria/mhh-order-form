'use client'

import { Card } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { DocumentTextIcon, PencilSquareIcon } from '@heroicons/react/24/outline'
import { ServiceType } from "@/types"

interface ServiceSelectorProps {
  value?: ServiceType  // Changed from ServiceType | null to ServiceType?
  onChange: (value: ServiceType) => void
}

const services = [
  {
    value: 'writing' as ServiceType,
    title: 'Writing',
    description: 'Essays, research papers, and more, crafted from scratch',
    icon: DocumentTextIcon,
    color: 'blue'
  },
  {
    value: 'editing' as ServiceType,
    title: 'Editing', 
    description: 'Proofreading, revisions, and content refinement',
    icon: PencilSquareIcon,
    color: 'green'
  }
]

export default function ServiceSelector({ value, onChange }: ServiceSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          What type of help do you need?
        </h2>
        <p className="text-gray-600">
          Choose the service that best fits your needs
        </p>
      </div>
      
      <RadioGroup
        value={value || ''}
        onValueChange={(val) => onChange(val as ServiceType)}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {services.map((service) => {
          const IconComponent = service.icon
          const isSelected = value === service.value
          
          return (
            <Label
              key={service.value}
              htmlFor={service.value}
              className="cursor-pointer"
            >
              <Card className={`p-6 transition-all duration-200 hover:shadow-md ${
                isSelected 
                  ? service.color === 'blue' 
                    ? 'ring-2 ring-blue-500 bg-blue-50' 
                    : 'ring-2 ring-green-500 bg-green-50'
                  : 'hover:bg-gray-50'
              }`}>
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg ${
                    service.color === 'blue' 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-green-100 text-green-600'
                  }`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {service.title}
                      </h3>
                      <RadioGroupItem
                        value={service.value}
                        id={service.value}
                        className="ml-auto"
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {service.description}
                    </p>
                  </div>
                </div>
              </Card>
            </Label>
          )
        })}
      </RadioGroup>
    </div>
  )
}