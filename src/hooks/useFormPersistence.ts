'use client'

import { useCallback } from 'react'
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
  const generateSessionId = useCallback(() => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }, [])

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
      
      // Removed console.log here
    } catch (error) {
      // Silent fail for localStorage
    }
  }, [generateSessionId])

  const getStoredFormData = useCallback((): StoredFormData | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return null

      const parsedData: StoredFormData = JSON.parse(stored)
      
      const hoursAgo = (Date.now() - parsedData.timestamp) / (1000 * 60 * 60)
      if (hoursAgo > EXPIRY_HOURS) {
        localStorage.removeItem(STORAGE_KEY)
        return null
      }

      return parsedData
    } catch (error) {
      return null
    }
  }, [])

  const clearStoredData = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      // Silent fail
    }
  }, [])

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