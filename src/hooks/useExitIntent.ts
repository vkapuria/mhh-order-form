'use client'

import { useEffect, useState, useCallback } from 'react'

interface ExitIntentOptions {
  sensitivity: number
  delay: number
  enabled: boolean
}

export function useExitIntent(
  callback: () => void,
  options: ExitIntentOptions = {
    sensitivity: 20,
    delay: 10000,
    enabled: true
  }
) {
  const [isEnabled, setIsEnabled] = useState(false)
  const [hasTriggered, setHasTriggered] = useState(false)

  // Enable after delay - NO LOGS
  useEffect(() => {
    if (!options.enabled) return

    const timer = setTimeout(() => {
      setIsEnabled(true)
    }, options.delay)

    return () => clearTimeout(timer)
  }, [options.enabled, options.delay])

  // Track mouse movement - NO LOGS
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isEnabled || hasTriggered) return

    // Trigger when mouse moves quickly toward top of screen
    if (e.clientY <= options.sensitivity && e.movementY < -30) {
      setHasTriggered(true)
      callback()
    }
  }, [isEnabled, hasTriggered, options.sensitivity, callback])

  // Track when user switches tabs/windows - NO LOGS
  const handleVisibilityChange = useCallback(() => {
    if (!isEnabled || hasTriggered || document.hidden) return
    
    setTimeout(() => {
      if (document.hidden && !hasTriggered) {
        setHasTriggered(true)
        callback()
      }
    }, 100)
  }, [isEnabled, hasTriggered, callback])

  // Event listeners - NO LOGS
  useEffect(() => {
    if (!options.enabled) return

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [handleMouseMove, handleVisibilityChange, options.enabled])

  const resetTrigger = useCallback(() => {
    setHasTriggered(false)
  }, [])

  return { hasTriggered, resetTrigger }
}