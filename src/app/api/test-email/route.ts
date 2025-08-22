import { NextRequest, NextResponse } from 'next/server'
import { sendTestEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email address required' },
        { status: 400 }
      )
    }

    console.log('🧪 Testing email to:', email)
    
    const result = await sendTestEmail(email)
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully!',
        messageId: result.messageId
      })
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }
    
  } catch (error) {
    console.error('❌ Test email error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send test email' },
      { status: 500 }
    )
  }
}