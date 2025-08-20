'use client'

import { CheckIcon } from '@heroicons/react/20/solid'
import { FormStep } from '@/types'

interface StepIndicatorProps {
  currentStep: FormStep
  completedSteps: FormStep[]
}

const steps = [
  { id: 'service' as FormStep, title: 'Service' },
  { id: 'contact' as FormStep, title: 'Contact' },
  { id: 'assignment' as FormStep, title: 'Assignment' },
  { id: 'details' as FormStep, title: 'Details' },
]

export default function StepIndicator({ currentStep, completedSteps }: StepIndicatorProps) {
  const getCurrentStepIndex = () => steps.findIndex(step => step.id === currentStep)
  
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id)
          const isCurrent = step.id === currentStep
          const isUpcoming = index > getCurrentStepIndex()
          
          return (
            <div key={step.id} className="flex items-center">
              {/* Step Circle */}
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200
                ${isCompleted 
                  ? 'bg-blue-500 border-blue-500 text-white' 
                  : isCurrent 
                    ? 'border-blue-500 bg-blue-50 text-blue-600' 
                    : 'border-gray-300 bg-white text-gray-400'
                }
              `}>
                {isCompleted ? (
                  <CheckIcon className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-semibold">{index + 1}</span>
                )}
              </div>
              
              {/* Step Title */}
              <div className="ml-3">
                <div className={`text-sm font-medium ${
                  isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {step.title}
                </div>
              </div>
              
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className={`hidden md:block w-16 h-0.5 ml-6 ${
                  isCompleted ? 'bg-blue-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}