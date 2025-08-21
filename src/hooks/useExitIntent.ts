// src/hooks/useExitIntent.ts
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

  // ADD DEBUG LOGGING
  useEffect(() => {
    console.log('🔥 useExitIntent Debug:', {
      optionsEnabled: options.enabled,
      isEnabled: isEnabled,
      hasTriggered: hasTriggered,
      delay: options.delay,
      sensitivity: options.sensitivity
    })
  }, [options.enabled, isEnabled, hasTriggered, options.delay, options.sensitivity])

  // Enable after delay
  useEffect(() => {
    console.log('⏰ Exit Intent - Checking if should enable:', options.enabled)
    
    if (!options.enabled) {
      console.log('❌ Exit Intent DISABLED by options')
      return
    }

    console.log(`⏳ Exit Intent - Starting ${options.delay}ms timer...`)
    
    const timer = setTimeout(() => {
      console.log('✅ Exit Intent - Timer completed, ENABLING!')
      setIsEnabled(true)
    }, options.delay)

    return () => {
      console.log('🧹 Exit Intent - Cleaning up timer')
      clearTimeout(timer)
    }
  }, [options.enabled, options.delay])

  // Track mouse movement
  // src/hooks/useExitIntent.ts - Update the handleMouseMove function:

const handleMouseMove = useCallback((e: MouseEvent) => {
  if (!isEnabled || hasTriggered) {
    if (!isEnabled) console.log('🚫 Exit Intent - Not enabled yet')
    if (hasTriggered) console.log('🚫 Exit Intent - Already triggered')
    return
  }

  // ADD MOUSE POSITION LOGGING
  console.log('🖱️ Mouse position:', {
    clientY: e.clientY,
    movementY: e.movementY,
    sensitivity: options.sensitivity,
    // Show both conditions separately
    isAtTop: e.clientY <= options.sensitivity,
    isFastMovement: e.movementY < -30, // Reduced from -50 to -30
    willTrigger: e.clientY <= options.sensitivity && e.movementY < -30
  })

  // FIXED: More forgiving trigger condition
  if (e.clientY <= options.sensitivity && e.movementY < -30) { // Changed from -50 to -30
    console.log('🎯 EXIT INTENT TRIGGERED BY MOUSE!')
    setHasTriggered(true)
    callback()
  }
}, [isEnabled, hasTriggered, options.sensitivity, callback])

  // Track when user switches tabs/windows
  const handleVisibilityChange = useCallback(() => {
    console.log('👁️ Visibility change:', {
      isEnabled,
      hasTriggered,
      documentHidden: document.hidden
    })

    if (!isEnabled || hasTriggered || document.hidden) return
    
    // Small delay to avoid false positives
    setTimeout(() => {
      console.log('🔍 Checking visibility after delay:', {
        documentHidden: document.hidden,
        hasTriggered: hasTriggered
      })
      
      if (document.hidden && !hasTriggered) {
        console.log('🎯 EXIT INTENT TRIGGERED BY TAB SWITCH!')
        setHasTriggered(true)
        callback()
      }
    }, 100)
  }, [isEnabled, hasTriggered, callback])

  useEffect(() => {
    if (!options.enabled) {
      console.log('❌ Exit Intent - Not adding event listeners (disabled)')
      return
    }

    console.log('🎧 Exit Intent - Adding event listeners')
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      console.log('🧹 Exit Intent - Removing event listeners')
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [handleMouseMove, handleVisibilityChange, options.enabled])

  // Reset trigger (useful for testing)
  const resetTrigger = useCallback(() => {
    console.log('🔄 Exit Intent - Resetting trigger')
    setHasTriggered(false)
  }, [])

  return { hasTriggered, resetTrigger }
}