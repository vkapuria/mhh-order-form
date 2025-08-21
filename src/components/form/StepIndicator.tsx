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
      {/* Simple progress line */}
      <div className="relative">
        <div className="absolute top-4 left-0 w-full h-1 bg-gray-200 rounded-full">
          <div 
            className="h-full bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${(getCurrentStepIndex() / (steps.length - 1)) * 100}%` }}
          />
        </div>
        
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id)
            const isCurrent = step.id === currentStep
            
            return (
              <div key={step.id} className="flex flex-col items-center">
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200 bg-white
                  ${isCompleted 
                    ? 'bg-blue-500 border-blue-500 text-white' 
                    : isCurrent 
                      ? 'border-blue-500 text-blue-600' 
                      : 'border-gray-300 text-gray-400'
                  }
                `}>
                  {isCompleted ? (
                    <CheckIcon className="w-4 h-4" />
                  ) : (
                    <span className="text-xs font-semibold">{index + 1}</span>
                  )}
                </div>
                
                <div className="mt-2 text-center">
                  <div className={`text-sm font-medium ${
                    isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}