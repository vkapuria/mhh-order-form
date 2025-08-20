'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  CheckCircleIcon, 
  ClockIcon, 
  TrophyIcon,
  StarIcon,
  FireIcon 
} from '@heroicons/react/24/outline'

interface ProgressIncentivesProps {
  currentStep: string
  completedSteps: string[]
  totalSteps: number
  hasEmail: boolean
}

export default function ProgressIncentives({
  currentStep,
  completedSteps,
  totalSteps,
  hasEmail
}: ProgressIncentivesProps) {
  const progress = (completedSteps.length / totalSteps) * 100
  
  const getMotivationalMessage = () => {
    if (progress >= 75) {
      return {
        icon: TrophyIcon,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        title: "Almost there! 🏆",
        message: "You're just one step away from getting expert help with your assignment!"
      }
    } else if (progress >= 50) {
      return {
        icon: FireIcon,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        title: "You're on fire! 🔥",
        message: "Halfway done! Your assignment help is getting closer."
      }
    } else if (progress >= 25) {
      return {
        icon: StarIcon,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        title: "Great start! ⭐",
        message: "You're making good progress. Keep going to unlock your pricing!"
      }
    } else {
      return {
        icon: ClockIcon,
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        title: "Let's get started! 🚀",
        message: "Complete your order in just a few simple steps."
      }
    }
  }

  const incentive = getMotivationalMessage()
  const IconComponent = incentive.icon

  // Show urgency based on progress
  const getUrgencyMessage = () => {
    if (progress >= 50 && hasEmail) {
      return {
        show: true,
        message: "⚡ Complete in the next 15 minutes to lock in current pricing!",
        type: 'warning'
      }
    } else if (progress >= 75) {
      return {
        show: true,
        message: "🎯 Just 2 minutes left to finish your order!",
        type: 'success'
      }
    }
    return { show: false, message: '', type: '' }
  }

  const urgency = getUrgencyMessage()

  return (
    <div className="space-y-4">
      {/* Main Progress Card */}
      <Card className={`p-4 ${incentive.bgColor} ${incentive.borderColor} border`}>
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-lg bg-white ${incentive.color}`}>
            <IconComponent className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-1">
              {incentive.title}
            </h4>
            <p className="text-sm text-gray-700 mb-3">
              {incentive.message}
            </p>
            
            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium">{Math.round(progress)}% complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>
        </div>
      </Card>

      {/* Urgency Message */}
      {urgency.show && (
        <Card className={`p-3 ${
          urgency.type === 'warning' ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'
        } border`}>
          <p className="text-sm font-medium text-center">
            {urgency.message}
          </p>
        </Card>
      )}

      {/* Steps Checklist */}
      <Card className="p-4">
        <h5 className="font-semibold text-gray-900 mb-3">Your Progress</h5>
        <div className="space-y-2">
          {[
            { id: 'service', label: 'Choose Service Type' },
            { id: 'contact', label: 'Provide Contact Info' },
            { id: 'assignment', label: 'Assignment Details' },
            { id: 'details', label: 'Final Details' }
          ].map((step, index) => {
            const isCompleted = completedSteps.includes(step.id)
            const isCurrent = currentStep === step.id
            
            return (
              <div key={step.id} className="flex items-center space-x-2">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  isCompleted 
                    ? 'bg-green-500 text-white' 
                    : isCurrent 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200'
                }`}>
                  {isCompleted ? (
                    <CheckCircleIcon className="w-3 h-3" />
                  ) : (
                    <span className="text-xs font-bold">{index + 1}</span>
                  )}
                </div>
                <span className={`text-sm ${
                  isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {step.label}
                </span>
                {isCompleted && (
                  <Badge variant="secondary" className="text-xs">
                    ✓ Done
                  </Badge>
                )}
                {isCurrent && (
                  <Badge variant="default" className="text-xs">
                    Current
                  </Badge>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      {/* Social Proof */}
      <div className="text-center text-xs text-gray-500 space-y-1">
        <p>⭐ <strong>4.9/5</strong> average rating from 2,847 students</p>
        <p>🚀 <strong>98%</strong> of orders delivered on time</p>
        <p>🔥 <strong>156 students</strong> completed orders this week</p>
      </div>
    </div>
  )
}