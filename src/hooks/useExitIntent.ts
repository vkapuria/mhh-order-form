'use client'

import { useEffect, useState, useCallback } from 'react'

interface ExitIntentOptions {
  sensitivity: number // pixels from top before triggering
  delay: number // minimum time on page before enabling (ms)
  enabled: boolean
}

export function useExitIntent(
  callback: () => void,
  options: ExitIntentOptions = {
    sensitivity: 20,
    delay: 10000, // 10 seconds
    enabled: true
  }
) {
  const [isEnabled, setIsEnabled] = useState(false)
  const [hasTriggered, setHasTriggered] = useState(false)

  // Enable after delay
  useEffect(() => {
    if (!options.enabled) return

    const timer = setTimeout(() => {
      setIsEnabled(true)
    }, options.delay)

    return () => clearTimeout(timer)
  }, [options.enabled, options.delay])

  // Track mouse movement
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isEnabled || hasTriggered) return

    // Trigger when mouse moves to top of screen quickly
    if (e.clientY <= options.sensitivity && e.movementY < -50) {
      setHasTriggered(true)
      callback()
    }
  }, [isEnabled, hasTriggered, options.sensitivity, callback])

  // Track when user switches tabs/windows
  const handleVisibilityChange = useCallback(() => {
    if (!isEnabled || hasTriggered || document.hidden) return
    
    // Small delay to avoid false positives
    setTimeout(() => {
      if (document.hidden && !hasTriggered) {
        setHasTriggered(true)
        callback()
      }
    }, 100)
  }, [isEnabled, hasTriggered, callback])

  useEffect(() => {
    if (!options.enabled) return

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [handleMouseMove, handleVisibilityChange, options.enabled])

  // Reset trigger (useful for testing)
  const resetTrigger = useCallback(() => {
    setHasTriggered(false)
  }, [])

  return { hasTriggered, resetTrigger }
}