// Get country from IP address using ipapi.co (free tier: 1000 requests/day)
export async function getCountryFromIP(ip: string): Promise<string> {
  try {
    console.log('🌍 [GEO] Starting geolocation for IP:', ip)
    
    // Handle localhost/development
    if (ip === '127.0.0.1' || ip === '::1' || ip.includes('localhost')) {
      console.log('🌍 [GEO] Localhost detected, returning India')
      return 'India'
    }

    const url = `https://ipapi.co/${ip}/country_name/`
    console.log('🌍 [GEO] Fetching from URL:', url)
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'DoMyHomework/1.0'
      }
    })
    
    console.log('🌍 [GEO] Response status:', response.status)
    console.log('🌍 [GEO] Response ok:', response.ok)
    
    if (response.ok) {
      const country = await response.text()
      console.log('🌍 [GEO] Raw response:', `"${country}"`)
      const trimmed = country.trim()
      console.log('🌍 [GEO] Trimmed result:', `"${trimmed}"`)
      
      if (trimmed && trimmed !== 'Undefined' && trimmed !== '') {
        console.log('✅ [GEO] SUCCESS:', trimmed)
        return trimmed
      } else {
        console.log('⚠️ [GEO] Empty or invalid response')
      }
    } else {
      console.log('❌ [GEO] HTTP Error:', response.status, response.statusText)
    }
    
    console.log('🔄 [GEO] Fallback: returning Unknown')
    return 'Unknown'
    
  } catch (error) {
    console.error('❌ [GEO] Exception:', error)
    return 'Unknown'
  }
}

// Extract real IP from request headers
export function getClientIP(request: Request): string {
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