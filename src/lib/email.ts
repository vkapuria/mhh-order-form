import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Types for email data
interface OrderEmailData {
    orderId: string
    customerName: string
    customerEmail: string
    customerCountry: string
  serviceType: string
  subject: string
  documentType: string
  pages: number
  deadline: string
  totalPrice: number
  basePrice: number
  savings: number
  rushFee: number
  instructions: string
  referenceStyle: string
  hasFiles: boolean
  fileCount?: number
  uploadedFiles?: Array<{
    fileName: string
    fileUrl: string
    fileSize: number
  }>
  checkoutUrl: string
}

export async function sendCustomerConfirmation(orderData: OrderEmailData) {
  try {
    console.log('📧 Sending customer recovery email to:', orderData.customerEmail)
    
    const { data, error } = await resend.emails.send({
      from: 'MyHomeworkHelp <orders@myhomeworkhelp.com>',
      to: [orderData.customerEmail],
      subject: 'Your Order Details Saved - Finish Payment',
      html: generateCustomerEmailHTML(orderData),
      text: generateCustomerEmailText(orderData)
    })

    if (error) {
      console.error('❌ Customer email error:', error)
      throw error
    }

    console.log('✅ Customer email sent successfully:', data?.id)
    return { success: true, messageId: data?.id }
    
  } catch (error) {
    console.error('❌ Failed to send customer email:', error)
    return { success: false, error }
  }
}

export async function sendAdminNotification(orderData: OrderEmailData) {
  try {
    console.log('📧 Sending admin pre-order alert to:', process.env.ADMIN_EMAIL)
    
    const { data, error } = await resend.emails.send({
        from: 'MyHomeworkHelp <orders@myhomeworkhelp.com>',
        to: [process.env.ADMIN_EMAIL!],
        replyTo: [orderData.customerEmail],
        subject: `Pre-Order Alert: ${orderData.customerName} (${orderData.customerCountry}): $${orderData.totalPrice}`,
      html: generateAdminEmailHTML(orderData),
      text: generateAdminEmailText(orderData)
    })

    if (error) {
      console.error('❌ Admin email error:', error)
      throw error
    }

    console.log('✅ Admin email sent successfully:', data?.id)
    return { success: true, messageId: data?.id }
    
  } catch (error) {
    console.error('❌ Failed to send admin email:', error)
    return { success: false, error }
  }
}

// Helper function to calculate deadline date
function getDeadlineDate(days: string): string {
    const date = new Date()
    date.setDate(date.getDate() + parseInt(days))
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  function getUnitLabels(serviceType: string) {
    const isPresentation = serviceType === 'presentation'
    return {
      unitSingular: isPresentation ? 'slide' : 'page',
      unitPlural: isPresentation ? 'slides' : 'pages',
      unitLabel: isPresentation ? 'Slides' : 'Pages',
    }
  }
  
// WP Forms style HTML template for admin
function generateAdminEmailHTML(data: OrderEmailData): string {
  const filesSection = data.hasFiles && data.uploadedFiles && data.uploadedFiles.length > 0 
    ? `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; background: #f9f9f9; font-weight: bold; width: 180px;">
          📎 Uploaded Files
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e5e5;">
          ${data.uploadedFiles.map(file => `
            <div style="margin-bottom: 8px;">
              <a href="${file.fileUrl}" target="_blank" style="color: #2c4dfa; text-decoration: none; font-weight: 500;">
                📄 ${file.fileName}
              </a> 
              <span style="color: #666; font-size: 12px; margin-left: 8px;">(${(file.fileSize / 1024).toFixed(1)} KB)</span>
            </div>
          `).join('')}
        </td>
      </tr>
    ` 
    : data.hasFiles ? `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; background: #f9f9f9; font-weight: bold; width: 180px;">
          📎 Files
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; color: #666;">
          Customer indicated files but none uploaded
        </td>
      </tr>
    ` : ''

  return `
    <!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pre-Order Notification</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  
  <style>
    /* Reset and base styles */
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; }
    
    /* Mobile-first responsive styles */
    @media screen and (max-width: 600px) {
      .container { width: 100% !important; max-width: 100% !important; }
      .mobile-padding { padding: 20px !important; }
      .mobile-text-center { text-align: center !important; }
      .mobile-stack { display: block !important; width: 100% !important; }
      .mobile-hide { display: none !important; }
      .mobile-font-size { font-size: 14px !important; }
      .header-padding { padding: 24px !important; }
      .content-padding { padding: 24px !important; }
      
      /* Stack table cells on mobile */
      .responsive-table td {
        display: block !important;
        width: 100% !important;
        text-align: left !important;
        padding: 8px 0 !important;
      }
      
      .responsive-table td:first-child {
        font-weight: 600 !important;
        color: #111827 !important;
      }
    }
    
    @media screen and (min-width: 601px) {
      .desktop-width { width: 800px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background:#f8f9fa; font-family:'Inter', Arial, sans-serif; line-height:1.6;">

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table class="container desktop-width" width="600" cellspacing="0" cellpadding="0" border="0" style="background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.08); max-width:100%;">
          
          <!-- Header -->
          <tr>
            <td class="header-padding" style="background:#1a1a1a; padding:32px; text-align:center; color:#ffffff;">
              <img src="https://myhomeworkhelp.com/wp-content/uploads/2024/03/Hero-Logo.png" alt="MyHomeworkHelp" style="max-height:50px; margin-bottom:16px; height:auto; display:block; margin-left:auto; margin-right:auto;">
              <h1 style="margin:0; font-size:22px; font-weight:600; letter-spacing:-0.02em;">Pre-Order Notification</h1>
              <p style="margin:8px 0 0; font-size:14px; opacity:0.8;">New customer inquiry awaiting review</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td class="content-padding" style="padding:32px;">
              
              <p style="font-size:16px; color:#374151; margin:0 0 32px; font-weight:500;">
                A customer has completed the order form and is currently on the checkout page.
              </p>

              <!-- Customer Information -->
              <div style="margin-bottom:24px; border:1px solid #e5e7eb; border-radius:6px; overflow:hidden;">
                <div style="background:#f8f9fa; padding:16px; font-weight:600; color:#111827; font-size:14px; border-bottom:1px solid #e5e7eb;">
                  Customer Information
                </div>
                <div style="padding:20px;">
                  <table class="responsive-table" width="100%" cellspacing="0" cellpadding="0" style="font-size:14px; color:#374151;">
                    <tr>
                      <td style="padding:8px 0; width:120px; font-weight:500; vertical-align:top;">Name:</td>
                      <td style="padding:8px 0;">${data.customerName}</td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0; font-weight:500; vertical-align:top;">Email:</td>
                      <td style="padding:8px 0;">
                        <a href="mailto:${data.customerEmail}" style="color:#1a1a1a; text-decoration:none; word-break:break-all;">${data.customerEmail}</a>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0; font-weight:500; vertical-align:top;">Country:</td>
                      <td style="padding:8px 0;">${data.customerCountry}</td>
                    </tr>
                  </table>
                </div>
              </div>

              <!-- Order Details -->
              <div style="margin-bottom:24px; border:1px solid #e5e7eb; border-radius:6px; overflow:hidden;">
                <div style="background:#f8f9fa; padding:16px; font-weight:600; color:#111827; font-size:14px; border-bottom:1px solid #e5e7eb;">
                  Order Details
                </div>
                <div style="padding:20px;">
                  <table class="responsive-table" width="100%" cellspacing="0" cellpadding="0" style="font-size:14px; color:#374151;">
                    <tr>
                      <td style="padding:8px 0; width:120px; font-weight:500; vertical-align:top;">Order ID:</td>
                      <td style="padding:8px 0;">
                        <span style="color:#1a1a1a; font-family:monospace; font-weight:600; background:#f3f4f6; padding:4px 8px; border-radius:3px; font-size:13px;">
                          #${data.orderId.slice(0, 8).toUpperCase()}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0; font-weight:500; vertical-align:top;">Service Type:</td>
                      <td style="padding:8px 0;">${data.serviceType}</td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0; font-weight:500; vertical-align:top;">Subject:</td>
                      <td style="padding:8px 0;">${data.subject}</td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0; font-weight:500; vertical-align:top;">Document Type:</td>
                      <td style="padding:8px 0;">${data.documentType.replace(/_/g,' ')}</td>
                    </tr>
                  </table>
                  ${filesSection ? `<div style="margin-top:16px; padding-top:16px; border-top:1px solid #e5e7eb;">${filesSection}</div>` : ''}
                </div>
              </div>

              <!-- Pricing -->
              <div style="margin-bottom:32px; border:1px solid #e5e7eb; border-radius:6px; overflow:hidden;">
                <div style="background:#f8f9fa; padding:16px; font-weight:600; color:#111827; font-size:14px; border-bottom:1px solid #e5e7eb;">
                  Pricing Summary
                </div>
                <div style="padding:20px;">
                  <table class="responsive-table" width="100%" cellspacing="0" cellpadding="0" style="font-size:14px; color:#374151;">
                    <tr>
                      <td style="padding:8px 0; font-weight:500; vertical-align:top;">Base Price:</td>
                      <td style="padding:8px 0; text-align:right;">$${data.basePrice.toFixed(2)}</td>
                    </tr>
                    ${data.savings > 0 ? `
                    <tr>
                      <td style="padding:8px 0; font-weight:500; color:#059669; vertical-align:top;">Discount:</td>
                      <td style="padding:8px 0; text-align:right; color:#059669;">-$${data.savings.toFixed(2)}</td>
                    </tr>
                    ` : ''}
                    ${data.rushFee > 0 ? `
                    <tr>
                      <td style="padding:8px 0; font-weight:500; vertical-align:top;">Rush Fee:</td>
                      <td style="padding:8px 0; text-align:right;">+$${data.rushFee.toFixed(2)}</td>
                    </tr>
                    ` : ''}
                  </table>
                  
                  <!-- Total Section -->
                  <div style="margin-top:16px; padding-top:16px; border-top:2px solid #e5e7eb;">
                    <table width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="font-weight:600; font-size:18px; color:#111827; padding:8px 0;">Total:</td>
                        <td style="text-align:right; font-weight:700; font-size:20px; color:#111827; padding:8px 0;">$${data.totalPrice.toFixed(2)}</td>
                      </tr>
                    </table>
                  </div>
                </div>
              </div>

              <!-- Action Required -->
              <div style="background:#fef3c7; border:1px solid #fbbf24; border-radius:6px; padding:20px;">
                <table width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="width:24px; vertical-align:top; padding-right:12px;">
                      <div style="width:20px; height:20px; background:#f59e0b; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-weight:bold; font-size:12px;">!</div>
                    </td>
                    <td>
                      <p style="margin:0; font-size:14px; color:#92400e; font-weight:500; line-height:1.5;">
                        <strong>Action Required:</strong> Customer is currently on checkout page. Follow up if payment is not completed within 30 minutes.
                      </p>
                    </td>
                  </tr>
                </table>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8f9fa; text-align:center; padding:24px; border-top:1px solid #e5e7eb;">
              <p style="margin:0; font-size:12px; color:#6b7280; line-height:1.4;">
                MyHomeworkHelp<br class="mobile-hide">
                <span class="mobile-hide">&bull;</span> Admin Notification System
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

</body>
</html>
  `
}

// Simple recovery email for customer
function generateCustomerEmailHTML(data: OrderEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Secure Your Expert Now</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="background: #000; color: white; padding: 25px; text-align: center;">
      <img 
        src="https://myhomeworkhelp.com/wp-content/uploads/2024/03/Hero-Logo.png" 
        alt="MyHomeworkHelp Logo" 
        style="max-height: 32px; margin-bottom: 10px; filter: brightness(0) invert(1);" 
      />
      <h1 style="margin: 0; font-size: 24px; font-weight: bold;">Your Order is Saved 🎓</h1>
      <p style="margin: 8px 0 0 0; opacity: 0.85; font-size: 15px;">Secure your expert in minutes</p>
    </div>

    <!-- Content -->
    <div style="padding: 30px;">
      <p style="font-size: 16px; margin-bottom: 20px;">
        Hi <strong>${data.customerName}</strong>,
      </p>
      
      <p style="font-size: 16px; margin-bottom: 20px; color:#555;">
        Your <strong>${data.subject}</strong> ${data.serviceType} is ready to begin.  
        Confirm payment today and our expert will start work within <strong>2 hours</strong>.
      </p>

      <!-- Order Summary (Minimal) -->
      <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 25px 0;">
        <h3 style="margin: 0 0 15px 0; color: #2c4dfa; font-size: 18px;">📋 Order #${data.orderId.slice(0, 8).toUpperCase()}</h3>
        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; color: #666;">Service:</td>
            <td style="padding: 6px 0; font-weight: bold; text-transform: capitalize;">${data.serviceType}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #666;">Subject:</td>
            <td style="padding: 6px 0; text-transform: capitalize;">${data.subject}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #666;">${getUnitLabels(data.serviceType).unitLabel}:</td>
            <td style="padding: 6px 0;">${data.pages}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #666;">Deadline:</td>
            <td style="padding: 6px 0; font-weight: bold; color:#d9534f;">${data.deadline} day${data.deadline !== '1' ? 's' : ''}</td>
          </tr>
          <tr style="border-top: 1px solid #ddd; font-weight: bold;">
            <td style="padding: 10px 0 5px 0; color: #2c4dfa;">Total:</td>
            <td style="padding: 10px 0 5px 0; color: #2c4dfa; font-size: 16px;">$${data.totalPrice.toFixed(2)}</td>
          </tr>
        </table>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.checkoutUrl}" style="display: inline-block; background: #2c4dfa; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
          Secure My Expert Now
        </a>
      </div>

      <p style="font-size: 14px; color: #666; text-align: center; margin-top: 10px;">
        ⏳ <strong>Tip:</strong> Experts are assigned quickly. Complete payment today to lock in your deadline.
      </p>
      
    </div>

    <!-- Footer -->
    <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e5e5e5;">
      <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">
        Need help? Just reply to this email — we’re online 24/7.
      </p>
      <p style="margin: 0; color: #999; font-size: 12px;">
        MyHomeworkHelp | Professional Homework Help Services
      </p>
    </div>
  </div>
</body>
</html>
  `
}


// Text versions
function generateAdminEmailText(data: OrderEmailData): string {
  const filesSection = data.hasFiles && data.uploadedFiles && data.uploadedFiles.length > 0
    ? `\n📎 Uploaded Files:\n${data.uploadedFiles.map(file => 
        `- ${file.fileName}: ${file.fileUrl} (${(file.fileSize / 1024).toFixed(1)} KB)`
      ).join('\n')}`
    : data.hasFiles ? '\n📎 Files: Customer indicated files but none uploaded' : ''

  return `
🔔 PRE-ORDER ALERT: ${data.customerName} ($${data.totalPrice})

A customer has completed the order form and is currently on the checkout page.

CONTACT INFORMATION:
- Name: ${data.customerName}
- Email: ${data.customerEmail}

ORDER DETAILS:
- Order ID: #${data.orderId.slice(0, 8).toUpperCase()}
- Service: ${data.serviceType.charAt(0).toUpperCase() + data.serviceType.slice(1)}
- Subject: ${data.subject}
- Document Type: ${data.documentType.replace(/_/g, ' ')}
- Pages: ${data.pages}
 - ${getUnitLabels(data.serviceType).unitLabel}: ${data.pages}
 - ${getUnitLabels(data.serviceType).unitLabel}: ${data.pages}
- Deadline: ${data.deadline} days
- Reference Style: ${data.referenceStyle.toUpperCase()}
${data.instructions ? `- Instructions: ${data.instructions}` : ''}${filesSection}

PRICING:
- Base Price: $${data.basePrice.toFixed(2)}
${data.savings > 0 ? `- Discount: -$${data.savings.toFixed(2)}` : ''}
${data.rushFee > 0 ? `- Rush Fee: +$${data.rushFee.toFixed(2)}` : ''}
- TOTAL: $${data.totalPrice.toFixed(2)}

⚠️ ACTION REQUIRED: Customer is on checkout page. Follow up if payment not completed within 30 minutes.

Academic Excellence Hub | Admin Notification
  `
}

function generateCustomerEmailText(data: OrderEmailData): string {
  return `
Your Order Details Saved - Finish Payment

Hi ${data.customerName},

Thank you for choosing Academic Excellence Hub! Your order details have been securely saved, and you're just one step away from getting expert help with your ${data.serviceType} project.

YOUR ORDER SUMMARY:
- Order ID: #${data.orderId.slice(0, 8).toUpperCase()}
- Service: ${data.serviceType.charAt(0).toUpperCase() + data.serviceType.slice(1)}
- Subject: ${data.subject}
- Pages: ${data.pages}
- Deadline: ${data.deadline} day${data.deadline !== '1' ? 's' : ''}
- Total: $${data.totalPrice.toFixed(2)}

Complete your payment here: ${data.checkoutUrl}

💡 Tip: Save this email! You can return to complete your payment anytime using the link above.

OUR GUARANTEES:
✅ On-Time Delivery
✅ 100% Original Work  
✅ Free Revisions

Questions? Reply to this email or contact us anytime.

Academic Excellence Hub | Professional Academic Services
  `
}

// Test function (unchanged)
export async function sendTestEmail(toEmail: string) {
  try {
    const { data, error } = await resend.emails.send({
        from: 'MyHomeworkHelp <orders@myhomeworkhelp.com>',
      to: [toEmail],
      subject: '🧪 Test Email from Academic Excellence Hub',
      html: '<h2>✅ Email system is working!</h2><p>This is a test email to verify Resend integration.</p>',
      text: '✅ Email system is working! This is a test email to verify Resend integration.'
    })

    if (error) throw error
    
    return { success: true, messageId: data?.id }
  } catch (error) {
    return { success: false, error }
  }
}