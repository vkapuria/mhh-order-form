import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCountryFromIP } from '@/lib/geolocation'

// Inline getClientIP function to avoid import issues
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return '127.0.0.1' // Fallback for development
}

export async function POST(request: NextRequest) {
  try {
    const { email, fullName, step, formData, sessionId } = await request.json()
    
    console.log('📊 Starting progress tracking:', { email, step, sessionId })
    
    // Get user location with detailed logging
    const clientIP = getClientIP(request)
    console.log('🌍 Extracted client IP:', clientIP)
    console.log('🌍 Calling geolocation for IP:', clientIP)
    
    const country = await getCountryFromIP(clientIP)
    console.log('🌍 Geolocation returned:', country)
    
    console.log('📊 Full tracking data:', { 
      email, 
      step, 
      sessionId, 
      country, 
      ip: clientIP,
      formData
    })
    
    // Upsert progress tracking
    // Upsert progress tracking
const { data, error } = await supabase
.from('form_abandonment')
.upsert({
  session_id: sessionId,
  email,
  full_name: fullName,
  current_step: step,
  service_type: formData?.serviceType || null,
  subject: formData?.subject || null,
  document_type: formData?.documentType || null,        // ADD THIS
  instructions: formData?.instructions || null,          // ADD THIS
  pages: formData?.pages || null,
  deadline: formData?.deadline || null,
  reference_style: formData?.referenceStyle || null,    // ADD THIS
  has_files: formData?.hasFiles || null,                // ADD THIS
  country: country,
  ip_address: clientIP,
  last_activity: new Date().toISOString(),
  admin_notified: false
}, { 
  onConflict: 'session_id',
  ignoreDuplicates: false 
})

    if (error) {
      console.error('❌ Supabase error:', error)
      throw error
    }

    console.log('✅ Progress tracking successful:', data)
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('❌ Progress tracking error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}