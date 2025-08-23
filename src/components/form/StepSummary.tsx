'use client'

import { ChevronDownIcon, PencilIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

interface StepSummaryProps {
  stepNumber: number
  title: string
  data: Array<{ label: string; value: string }>
  onEdit?: () => void
  status?: 'active' | 'complete' | 'incomplete'
  isCurrentStep?: boolean
}

export default function StepSummary({ 
  stepNumber, 
  title, 
  data, 
  onEdit,
  status = 'complete',
  isCurrentStep = false
}: StepSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // 🎯 SMART INLINE SNAPSHOTS
  const getSmartPreview = () => {
    const validData = data.filter(item => item.value && item.value !== '—' && item.value !== 'None')
    
    if (validData.length === 0) return '— Not set'
    
    // Step-specific smart previews
    if (title.includes('Service')) {
      return validData[0]?.value || '—'
    }
    
    if (title.includes('Contact')) {
      const name = validData.find(item => item.label === 'Name')?.value
      const email = validData.find(item => item.label === 'Email')?.value
      
      if (name && email) {
        const truncatedEmail = email.length > 25 
          ? email.replace(/(.{1,8}).*@(.{1,10}).*/, '$1...@$2...')
          : email
        return `${name} • ${truncatedEmail}`
      }
      return name || email || '—'
    }
    
    if (title.includes('Assignment')) {
      const subject = validData.find(item => item.label === 'Subject')?.value
      const type = validData.find(item => item.label === 'Type')?.value?.replace(/_/g, ' ')
      
      if (subject && type) {
        return `${type} • ${subject}`
      }
      return subject || type || '—'
    }
    
    if (title.includes('Final') || title.includes('Details')) {
      const pages = validData.find(item => item.label === 'Pages')?.value
      const deadline = validData.find(item => item.label === 'Deadline')?.value
      const style = validData.find(item => item.label === 'Reference Style')?.value
      
      const parts = [
        pages && `${pages} pages`,
        deadline && `${deadline} days`,
        style
      ].filter(Boolean)
      
      return parts.slice(0, 3).join(' • ') || '—'
    }
    
    return validData.slice(0, 2).map(item => item.value).join(' • ')
  }

  // 🎯 ENHANCED STATUS STYLING WITH BEAUTIFUL GREEN
  const getBorderStyle = () => {
    if (isCurrentStep) {
      return 'border-purple-300 bg-purple-50/50'
    }
    
    switch (status) {
      case 'active':
        return 'border-purple-200 bg-purple-50'
      case 'incomplete':
        return 'border-amber-200 bg-amber-50'
      default: // complete - BEAUTIFUL GREEN TINGE
        return 'border-green-200 bg-green-50/60 shadow-green-100/50'
    }
  }

  const preview = getSmartPreview()

  return (
    <div className={`
      rounded-xl shadow-sm border transition-all duration-300
      ${getBorderStyle()}
    `}>
      {/* SINGLE ROW HEADER */}
      <div className="px-6 py-2 flex items-center justify-between min-h-[54px]">
        
        {/* Left side: All info in one row */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Step number */}
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Step {stepNumber}
          </span>
          
          {/* Title */}
          <span className="text-sm font-semibold text-gray-900">{title}</span>
          
          {/* Status icon - Checkmark for complete */}
          {status === 'complete' && (
            <img 
              src="/icons/check-mark.svg" 
              alt="Complete" 
              className="w-4 h-4 flex-shrink-0"
            />
          )}
          
          {status === 'active' && (
            <div className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0" />
          )}
          
          {status === 'incomplete' && (
            <div className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
          )}
          
          {/* Smart preview - same line */}
          <span className="text-sm text-gray-600 truncate">
            {preview}
          </span>
        </div>

        {/* Right side: Change + Chevron */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Always-visible Change button */}
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <PencilIcon className="w-3 h-3" />
              Change
            </button>
          )}
          
          {/* Expand/collapse chevron */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-expanded={isExpanded}
          >
            <ChevronDownIcon 
              className={`w-4 h-4 transition-transform duration-200 ${
                isExpanded ? 'rotate-180' : ''
              }`} 
            />
          </button>
        </div>
      </div>
      
      {/* Expanded content */}
      {isExpanded && (
        <div className="px-6 pb-4 border-t border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            {data.map((item, index) => (
              <div key={index} className="min-w-0">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  {item.label}
                </div>
                <div className="text-sm text-gray-900 break-words">
                  {item.value || '—'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}