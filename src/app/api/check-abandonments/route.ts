import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST() {
  try {
    const now = new Date()
    
    // Different time thresholds based on step
    const abandonmentThresholds = {
        contact: 30 * 60 * 1000,      // 30 minutes
        assignment: 20 * 60 * 1000,   // 20 minutes  
        details: 10 * 60 * 1000       // 10 minutes
      }

    console.log('🔍 Checking for abandonments at:', now.toISOString())

    // Find abandoned sessions that haven't been notified
    const { data: abandonedSessions, error } = await supabase
      .from('form_abandonment') 
      .select('*')
      .eq('admin_notified', false)
      .neq('current_step', 'submitted') // Don't alert on completed forms
    
    if (error) throw error

    console.log('📊 Found', abandonedSessions?.length || 0, 'unnotified sessions')

    const newAbandonment = []
    
    for (const session of abandonedSessions || []) {
      const lastActivity = new Date(session.last_activity)
      const stepThreshold = abandonmentThresholds[session.current_step as keyof typeof abandonmentThresholds] || abandonmentThresholds.contact
      const timeSinceLastActivity = now.getTime() - lastActivity.getTime()
      
      console.log(`⏰ Session ${session.email}: ${timeSinceLastActivity}ms ago, threshold: ${stepThreshold}ms`)
      
      if (timeSinceLastActivity > stepThreshold) {
        newAbandonment.push(session)
        console.log(`🚨 ABANDONMENT: ${session.email} at step ${session.current_step}`)
      }
    }

    // Send admin notification if there are new abandonments
    if (newAbandonment.length > 0) {
      console.log('📧 Sending admin notification for', newAbandonment.length, 'abandonments')
      await sendAdminAbandonmentAlert(newAbandonment)
      
      // Mark as notified
      const sessionIds = newAbandonment.map(s => s.session_id)
      await supabase
        .from('form_abandonment')
        .update({ admin_notified: true })
        .in('session_id', sessionIds)
    }

    return NextResponse.json({ 
      success: true, 
      abandonments: newAbandonment.length,
      processed: newAbandonment.map(s => ({ email: s.email, step: s.current_step }))
    })
    
  } catch (error) {
    console.error('❌ Abandonment check error:', error)
    return NextResponse.json({ success: false, error }, { status: 500 })
  }
}

async function sendAdminAbandonmentAlert(abandonments: any[]) {
    const getStepLabel = (step: string) => {
      const labels = {
        contact: '📥 Contact Info (Step 2)',
        assignment: '📄 Assignment Details (Step 3)', 
        details: '✅ Final Details (Step 4)'
      }
      return labels[step as keyof typeof labels] || step
    }
  
    const getUrgencyColor = (step: string) => {
      return step === 'details' ? '#dc2626' : step === 'assignment' ? '#f59e0b' : '#6b7280'
    }
  
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Form Abandonment Alert</title>
    </head>
    <body style="font-family: Arial, sans-serif; background:#f9fafb; margin:0; padding:0;">
  
      <table width="100%" cellspacing="0" cellpadding="0" style="background:#f9fafb; padding:20px;">
        <tr>
          <td>
            <table width="100%" cellspacing="0" cellpadding="0" style="max-width:650px; margin:auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.06);">
              
              <!-- Header -->
              <tr>
                <td style="background:#dc2626; color:#fff; padding:20px; text-align:center;">
                  <h1 style="margin:0; font-size:22px;">🚨 Form Abandonment Alert</h1>
                  <p style="margin:5px 0 0; font-size:14px; opacity:0.9;">${abandonments.length} lead(s) dropped off mid-form</p>
                </td>
              </tr>
  
              <!-- Body -->
              <tr>
                <td style="padding:25px; color:#374151;">
  
                  <p style="font-size:16px; margin:0 0 20px;">
                    <strong>Action Required:</strong> Follow up promptly with the following lead${abandonments.length>1 ? 's' : ''}.
                  </p>
  
                  ${abandonments.map(session => `
                    <div style="border:2px solid ${getUrgencyColor(session.current_step)}; border-radius:6px; padding:15px; margin-bottom:18px;">
                      <h3 style="margin:0 0 6px; font-size:16px; color:${getUrgencyColor(session.current_step)};">
                        👤 ${session.full_name || 'Unknown Name'}
                      </h3>
                      <p style="margin:0; font-size:14px;">📧 <a href="mailto:${session.email}" style="color:#2563eb;">${session.email}</a></p>
                      ${session.country ? `<p style="margin:0; font-size:14px;">🌍 ${session.country}</p>` : ''}
  
                      ${session.service_type ? `
                        <p style="margin:10px 0 0; font-size:14px;"><strong>Service:</strong> ${session.service_type}${session.subject ? ` – ${session.subject}` : ''}</p>` : ''}
  
                      ${session.pages ? `
                        <p style="margin:5px 0 0; font-size:14px;"><strong>Details:</strong> ${session.pages} pages${session.deadline ? `, ${session.deadline} days` : ''}</p>` : ''}
  
                      <p style="margin:10px 0 0; font-size:14px;"><strong>Dropped at:</strong> ${getStepLabel(session.current_step)}</p>
                      <p style="margin:5px 0 0; font-size:13px; color:#6b7280;"><strong>Last Activity:</strong> ${new Date(session.last_activity).toLocaleString('en-US', {
                        timeZone: 'Asia/Kolkata',
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })}</p>
                    </div>
                  `).join('')}
  
                  <!-- Suggested Strategy -->
                  <div style="background:#f3f4f6; padding:15px; border-radius:6px; margin-top:25px;">
                    <p style="margin:0 0 10px; font-weight:bold; color:#111827;">💡 Follow-up Strategy:</p>
                    <ul style="margin:0; padding-left:20px; color:#374151; font-size:14px;">
                      <li><strong style="color:#dc2626;">Final Details (Red):</strong> Call within 30 mins – very hot lead!</li>
                      <li><strong style="color:#f59e0b;">Assignment (Orange):</strong> Email within 2–4 hours with helpful tips</li>
                      <li><strong style="color:#6b7280;">Contact (Gray):</strong> Gentle email within 6–8 hours</li>
                    </ul>
                  </div>
  
                  <!-- CTA -->
                  <div style="text-align:center; margin-top:30px;">
                    <a href="${process.env.ADMIN_DASHBOARD_URL || '#'}" 
                       style="display:inline-block; background:#dc2626; color:#fff; text-decoration:none; padding:14px 28px; border-radius:6px; font-weight:bold; font-size:15px;">
                      🔎 View in Dashboard
                    </a>
                  </div>
  
                </td>
              </tr>
  
              <!-- Footer -->
              <tr>
                <td style="background:#f9fafb; text-align:center; padding:15px; font-size:12px; color:#6b7280;">
                  DoMyHomework Admin Alerts • Automated system
                </td>
              </tr>
  
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `
  
    await resend.emails.send({
      from: 'DoMyHomework Alerts <orders@domyhomework.co>',
      to: [process.env.ADMIN_EMAIL!],
      subject: `🚨 ${abandonments.length} Abandoned Form${abandonments.length>1 ? 's' : ''} – Follow-up Needed`,
      html
    })
  
    console.log('✅ Admin abandonment alert sent')
  }
  