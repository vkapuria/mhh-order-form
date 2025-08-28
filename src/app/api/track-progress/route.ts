import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCountryFromIP, getClientIP } from '@/lib/geolocation'

export async function POST(request: NextRequest) {
    try {
      const { email, fullName, step, formData, sessionId } = await request.json()
      
      // Get user location
      const clientIP = getClientIP(request)
      const country = await getCountryFromIP(clientIP)
      
      console.log('📊 Tracking progress:', { email, step, sessionId, country, ip: clientIP })
    
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
    pages: formData?.pages || null,
    deadline: formData?.deadline || null,
    country: country,
    ip_address: clientIP,
    last_activity: new Date().toISOString(),
    admin_notified: false
  }, {
        onConflict: 'session_id',
        ignoreDuplicates: false 
      })

    if (error) throw error

    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('❌ Progress tracking error:', error)
    return NextResponse.json({ success: false, error }, { status: 500 })
  }
}