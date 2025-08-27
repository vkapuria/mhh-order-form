'use client'

import { useEffect, useRef } from 'react'

interface PaperformEmbedProps {
  formId: string
  prefillData?: {
    name?: string
    email?: string
    amount?: number
    orderId?: string
  }
}

export default function PaperformEmbed({ formId, prefillData }: PaperformEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Build the prefill query string with YOUR field names
    const params = new URLSearchParams()
    
    // Use exact Paperform field names
    if (prefillData?.name) {
      params.append('name', prefillData.name)
    }
    if (prefillData?.email) {
      params.append('email', prefillData.email)
    }
    if (prefillData?.amount) {
      params.append('price', prefillData.amount.toString())
    }

    // Create the Paperform div with prefill parameters
    if (containerRef.current) {
      containerRef.current.innerHTML = `
        <div 
          data-paperform-id="${formId}"
          data-prefill="${params.toString()}"
          data-prefill-inherit="1"
        ></div>
      `
      
      // Load Paperform script
      const existingScript = document.querySelector('script[src*="paperform.co"]')
      if (!existingScript) {
        const script = document.createElement('script')
        script.src = 'https://paperform.co/__embed.min.js'
        script.async = true
        document.body.appendChild(script)
      } else {
        // Re-initialize if script already exists (with safety check)
        if (window.Paperform && typeof window.Paperform.init === 'function') {
          window.Paperform.init()
        }
      }
    }
  }, [formId, prefillData])

  return <div ref={containerRef} />
}

declare global {
  interface Window {
    Paperform: any
  }
}