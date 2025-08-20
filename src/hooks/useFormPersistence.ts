'use client'

import { useEffect, useCallback } from 'react'
import { OrderFormData } from '@/types'

const STORAGE_KEY = 'homework_order_form'
const EXPIRY_HOURS = 24

interface StoredFormData {
  data: Partial<OrderFormData>
  timestamp: number
  currentStep: string
  completedSteps: string[]
  sessionId: string
}

export function useFormPersistence() {
  // Generate unique session ID
  const generateSessionId = useCallback(() => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }, [])

  // Save form data to localStorage
  const saveFormData = useCallback((
    formData: Partial<OrderFormData>,
    currentStep: string,
    completedSteps: string[]
  ) => {
    try {
      const existingData = getStoredFormData()
      const sessionId = existingData?.sessionId || generateSessionId()
      
      const dataToStore: StoredFormData = {
        data: formData,
        timestamp: Date.now(),
        currentStep,
        completedSteps,
        sessionId
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore))
      
      // Track in analytics (you can replace with your analytics)
      console.log('Form progress saved:', {
        sessionId,
        step: currentStep,
        progress: completedSteps.length
      })
    } catch (error) {
      console.error('Failed to save form data:', error)
    }
  }, [generateSessionId])

  // Load form data from localStorage
  const getStoredFormData = useCallback((): StoredFormData | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return null

      const parsedData: StoredFormData = JSON.parse(stored)
      
      // Check if data has expired
      const hoursAgo = (Date.now() - parsedData.timestamp) / (1000 * 60 * 60)
      if (hoursAgo > EXPIRY_HOURS) {
        localStorage.removeItem(STORAGE_KEY)
        return null
      }

      return parsedData
    } catch (error) {
      console.error('Failed to load form data:', error)
      return null
    }
  }, [])

  // Clear stored data
  const clearStoredData = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('Failed to clear form data:', error)
    }
  }, [])

  // Check if form was abandoned
  const getAbandonmentData = useCallback(() => {
    const stored = getStoredFormData()
    if (!stored) return null

    const hoursAgo = (Date.now() - stored.timestamp) / (1000 * 60 * 60)
    const isAbandoned = hoursAgo > 0.5 && stored.data.email && stored.completedSteps.length < 4

    return isAbandoned ? {
      sessionId: stored.sessionId,
      email: stored.data.email,
      lastStep: stored.currentStep,
      progress: stored.completedSteps.length,
      hoursAgo: Math.round(hoursAgo * 10) / 10
    } : null
  }, [getStoredFormData])

  return {
    saveFormData,
    getStoredFormData,
    clearStoredData,
    getAbandonmentData
  }
}