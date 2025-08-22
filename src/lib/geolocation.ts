// Get country from IP address using ipapi.co (free tier: 1000 requests/day)
export async function getCountryFromIP(ip: string): Promise<string> {
    try {
      // Handle localhost/development
      if (ip === '127.0.0.1' || ip === '::1' || ip.includes('localhost')) {
        return 'United States' // Default for development
      }
  
      const response = await fetch(`https://ipapi.co/${ip}/country_name/`, {
        headers: {
          'User-Agent': 'DoMyHomework/1.0'
        }
      })
      
      if (response.ok) {
        const country = await response.text()
        return country.trim() || 'Unknown'
      }
      
      return 'Unknown'
    } catch (error) {
      console.error('Geolocation error:', error)
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