'use client'

import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

interface StepSummaryProps {
  stepNumber: number
  title: string
  data: Array<{ label: string; value: string }>
  onEdit?: () => void
}

export default function StepSummary({ stepNumber, title, data, onEdit }: StepSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">Step {stepNumber}</span>
          <span className="font-medium text-gray-900">{title}</span>
          {!isExpanded && (
            <span className="text-sm text-gray-600 ml-2">
              {data[0]?.value}
              {data.length > 1 && `, +${data.length - 1} more`}
            </span>
          )}
        </div>
        <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>
      
      {isExpanded && (
        <div className="px-4 pb-3 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-3 pt-3">
            {data.map((item, index) => (
              <div key={index}>
                <span className="text-xs text-gray-500">{item.label}:</span>
                <span className="text-sm text-gray-900 ml-2">{item.value}</span>
              </div>
            ))}
          </div>
          {onEdit && (
            <button 
              onClick={onEdit}
              className="text-sm text-blue-600 hover:text-blue-700 mt-3"
            >
              Edit this step
            </button>
          )}
        </div>
      )}
    </div>
  )
}