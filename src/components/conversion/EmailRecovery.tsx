'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useFormPersistence } from '@/hooks/useFormPersistence'
import { EnvelopeIcon, ClockIcon, ArrowRightIcon } from '@heroicons/react/24/outline' // Fixed: MailIcon -> EnvelopeIcon

interface EmailRecoveryProps {
  onRestoreForm: (data: any) => void
}

export default function EmailRecovery({ onRestoreForm }: EmailRecoveryProps) {
  const [abandonmentData, setAbandonmentData] = useState<any>(null)
  const [isRestoring, setIsRestoring] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const { getAbandonmentData, clearStoredData } = useFormPersistence()

  useEffect(() => {
    // Check for abandoned form on mount
    const data = getAbandonmentData()
    if (data) {
      setAbandonmentData(data)
    }
  }, [getAbandonmentData])

  const handleRestore = async () => {
    if (!abandonmentData) return
    
    setIsRestoring(true)
    try {
      // Simulate API call to log restoration
      await new Promise(resolve => setTimeout(resolve, 500))
      
      onRestoreForm(abandonmentData)
      setIsDismissed(true)
      
      console.log('Form restored for session:', abandonmentData.sessionId)
    } catch (error) {
      console.error('Failed to restore form:', error)
    } finally {
      setIsRestoring(false)
    }
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    // Optionally clear the stored data
    // clearStoredData()
  }

  // Don't show if no abandonment data or if dismissed
  if (!abandonmentData || isDismissed) {
    return null
  }

  const getStepName = (step: string) => {
    const stepNames: Record<string, string> = {
      'service': 'Service Selection',
      'contact': 'Contact Information', 
      'assignment': 'Assignment Details',
      'details': 'Final Details'
    }
    return stepNames[step] || step
  }

  return (
    <Card className="p-4 bg-blue-50 border-blue-200 mb-6">
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <EnvelopeIcon className="w-5 h-5 text-blue-600" /> {/* Fixed: MailIcon -> EnvelopeIcon */}
        </div>
        
        <div className="flex-1">
          <h4 className="font-semibold text-blue-900 mb-1">
            Welcome back! Continue your order
          </h4>
          <p className="text-sm text-blue-700 mb-3">
            We saved your progress from {abandonmentData.hoursAgo} hour{abandonmentData.hoursAgo !== 1 ? 's' : ''} ago. 
            You were on the <strong>{getStepName(abandonmentData.lastStep)}</strong> step.
          </p>
          
          <div className="flex items-center space-x-2 text-xs text-blue-600 mb-4">
            <ClockIcon className="w-3 h-3" />
            <span>Progress: {abandonmentData.progress}/4 steps completed</span>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              onClick={handleRestore}
              disabled={isRestoring}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isRestoring ? 'Restoring...' : (
                <>
                  Continue Order
                  <ArrowRightIcon className="w-3 h-3 ml-1" />
                </>
              )}
            </Button>
            
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleDismiss}
              className="text-blue-600 hover:text-blue-700"
            >
              Start Fresh
            </Button>
          </div>
        </div>
        
        <button
          onClick={handleDismiss}
          className="text-blue-400 hover:text-blue-600"
        >
          ×
        </button>
      </div>
    </Card>
  )
}