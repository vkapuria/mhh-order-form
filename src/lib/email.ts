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
      from: 'DoMyHomework <orders@domyhomework.co>',
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
        from: 'DoMyHomework <orders@domyhomework.co>',
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
              <a href="${file.fileUrl}" target="_blank" style="color: #8800e9; text-decoration: none; font-weight: 500;">
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
        <title>Pre-Order Alert</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f5f5f5;">
        <div style="max-width: 700px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #8800e9 0%, #6600cc 100%); color: white; padding: 25px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px; font-weight: bold;">🔔 Pre-Order Alert</h1>
                <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 16px;">New order inquiry received - customer details below</p>    
            </div>

            <!-- Content -->
            <div style="padding: 25px;">
                <p style="font-size: 16px; margin-bottom: 20px; color: #555;">
                    A customer has completed the order form and is currently on the checkout page. Here are the details:
                </p>

                <!-- Contact Information Section -->
                <h3 style="color: #8800e9; margin: 25px 0 15px 0; font-size: 18px; border-bottom: 2px solid #8800e9; padding-bottom: 5px;">
                    👤 Contact Information
                </h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; border: 1px solid #e5e5e5;">
                    <tr>
                        <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; background: #f9f9f9; font-weight: bold; width: 180px;">Name</td>
                        <td style="padding: 12px; border-bottom: 1px solid #e5e5e5;">${data.customerName}</td>
                    </tr>
                    <tr>
<tr>
                        <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; background: #f9f9f9; font-weight: bold;">Email</td>
                        <td style="padding: 12px; border-bottom: 1px solid #e5e5e5;">
                            <a href="mailto:${data.customerEmail}" style="color: #8800e9; text-decoration: none;">${data.customerEmail}</a>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; background: #f9f9f9; font-weight: bold;">Country</td>
                        <td style="padding: 12px; border-bottom: 1px solid #e5e5e5;">🌍 ${data.customerCountry}</td>
                    </tr>
                </table>

                <!-- Order Details Section -->
                <h3 style="color: #8800e9; margin: 25px 0 15px 0; font-size: 18px; border-bottom: 2px solid #8800e9; padding-bottom: 5px;">
                    📝 Order Details
                </h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; border: 1px solid #e5e5e5;">
                    <tr>
                        <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; background: #f9f9f9; font-weight: bold; width: 180px;">Order ID</td>
                        <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; font-family: monospace; color: #8800e9; font-weight: bold;">#${data.orderId.slice(0, 8).toUpperCase()}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; background: #f9f9f9; font-weight: bold;">Service Type</td>
                        <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-transform: capitalize;">${data.serviceType}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; background: #f9f9f9; font-weight: bold;">Subject</td>
                        <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-transform: capitalize;">${data.subject}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; background: #f9f9f9; font-weight: bold;">Document Type</td>
                        <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-transform: capitalize;">${data.documentType.replace(/_/g, ' ')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; background: #f9f9f9; font-weight: bold;">Pages</td>
                        <td style="padding: 12px; border-bottom: 1px solid #e5e5e5;">${data.pages} page${data.pages !== 1 ? 's' : ''}</td>
                    </tr>
                    <tr>
<tr>
                        <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; background: #f9f9f9; font-weight: bold;">Deadline</td>
                        <td style="padding: 12px; border-bottom: 1px solid #e5e5e5;">${data.deadline} day${data.deadline !== '1' ? 's' : ''} (${getDeadlineDate(data.deadline)})</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; background: #f9f9f9; font-weight: bold;">Reference Style</td>
                        <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-transform: uppercase;">${data.referenceStyle}</td>
                    </tr>
                    ${data.instructions ? `
                    <tr>
                        <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; background: #f9f9f9; font-weight: bold;">Instructions</td>
                        <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; font-style: italic;">${data.instructions}</td>
                    </tr>
                    ` : ''}
                    ${filesSection}
                </table>

                <!-- Pricing Section -->
                <h3 style="color: #8800e9; margin: 25px 0 15px 0; font-size: 18px; border-bottom: 2px solid #8800e9; padding-bottom: 5px;">
                    💰 Pricing Breakdown
                </h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; border: 1px solid #e5e5e5;">
                    <tr>
                        <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; background: #f9f9f9; font-weight: bold; width: 180px;">Base Price</td>
                        <td style="padding: 12px; border-bottom: 1px solid #e5e5e5;">$${data.basePrice.toFixed(2)}</td>
                    </tr>
                    ${data.savings > 0 ? `
                    <tr>
                        <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; background: #f9f9f9; font-weight: bold;">Discount</td>
                        <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; color: #10b981;">-$${data.savings.toFixed(2)}</td>
                    </tr>
                    ` : ''}
                    ${data.rushFee > 0 ? `
                    <tr>
                        <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; background: #f9f9f9; font-weight: bold;">Rush Fee</td>
                        <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; color: #f59e0b;">+$${data.rushFee.toFixed(2)}</td>
                    </tr>
                    ` : ''}
                    <tr style="background: #8800e9; color: white;">
                        <td style="padding: 15px; font-weight: bold; font-size: 16px;">Total Price</td>
                        <td style="padding: 15px; font-weight: bold; font-size: 18px;">$${data.totalPrice.toFixed(2)}</td>
                    </tr>
                </table>

                <!-- Action Item -->
                <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 20px; margin-top: 25px;">
                    <h4 style="margin: 0 0 10px 0; color: #92400e; font-size: 16px;">⚠️ Action Required</h4>
                    <p style="margin: 0; color: #92400e;">
                        The customer is currently on the checkout page. Follow up if payment is not completed within 30 minutes.
                    </p>
                </div>
            </div>

            <!-- Footer -->
            <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e5e5e5;">
                <p style="margin: 0; color: #666; font-size: 14px;">
                    Academic Excellence Hub | Admin Notification System
                </p>
            </div>
        </div>
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
        <title>Complete Your Order</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #8800e9 0%, #6600cc 100%); color: white; padding: 25px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px; font-weight: bold;">Almost Done! 🎓</h1>
                <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 16px;">Your order details are safely saved</p>
            </div>

            <!-- Content -->
            <div style="padding: 30px;">
                <p style="font-size: 16px; margin-bottom: 20px;">
                    Hi <strong>${data.customerName}</strong>,
                </p>
                
                <p style="font-size: 16px; margin-bottom: 20px; line-height: 1.6;">
                    Thank you for choosing Academic Excellence Hub! Your order details have been securely saved, and you're just one step away from getting expert help with your ${data.serviceType} project.
                </p>

                <!-- Order Summary -->
                <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 25px 0;">
                    <h3 style="margin: 0 0 15px 0; color: #8800e9; font-size: 18px;">📋 Your Order Summary</h3>
                    <table style="width: 100%; font-size: 14px;">
                        <tr>
                            <td style="padding: 5px 0; color: #666;">Order ID:</td>
                            <td style="padding: 5px 0; font-weight: bold; font-family: monospace;">#${data.orderId.slice(0, 8).toUpperCase()}</td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0; color: #666;">Service:</td>
                            <td style="padding: 5px 0; text-transform: capitalize;">${data.serviceType}</td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0; color: #666;">Subject:</td>
                            <td style="padding: 5px 0; text-transform: capitalize;">${data.subject}</td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0; color: #666;">Pages:</td>
                            <td style="padding: 5px 0;">${data.pages}</td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0; color: #666;">Deadline:</td>
                            <td style="padding: 5px 0;">${data.deadline} day${data.deadline !== '1' ? 's' : ''}</td>
                        </tr>
                        <tr style="border-top: 1px solid #ddd; font-weight: bold;">
                            <td style="padding: 10px 0 5px 0; color: #8800e9;">Total:</td>
                            <td style="padding: 10px 0 5px 0; color: #8800e9; font-size: 16px;">$${data.totalPrice.toFixed(2)}</td>
                        </tr>
                    </table>
                </div>

                <!-- CTA Button -->
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${data.checkoutUrl}" style="display: inline-block; background: #8800e9; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; transition: background 0.3s;">
                        Complete Your Payment →
                    </a>
                </div>

                <p style="font-size: 14px; color: #666; text-align: center; margin-top: 20px;">
                    💡 <strong>Tip:</strong> Save this email! You can return to complete your payment anytime using the button above.
                </p>

                <!-- Guarantees -->
                <div style="border-top: 1px solid #e5e5e5; margin-top: 30px; padding-top: 20px;">
                    <h4 style="color: #8800e9; margin: 0 0 15px 0; font-size: 16px;">✅ Our Guarantees</h4>
                    <div style="display: flex; flex-wrap: wrap; gap: 15px;">
                        <div style="flex: 1; min-width: 200px; text-align: center; padding: 15px; background: #f0f9ff; border-radius: 6px;">
                            <div style="font-size: 24px; margin-bottom: 8px;">⏰</div>
                            <div style="font-size: 14px; color: #0369a1; font-weight: 500;">On-Time Delivery</div>
                        </div>
                        <div style="flex: 1; min-width: 200px; text-align: center; padding: 15px; background: #f0fdf4; border-radius: 6px;">
                            <div style="font-size: 24px; margin-bottom: 8px;">🛡️</div>
                            <div style="font-size: 14px; color: #166534; font-weight: 500;">100% Original Work</div>
                        </div>
                        <div style="flex: 1; min-width: 200px; text-align: center; padding: 15px; background: #fefce8; border-radius: 6px;">
                            <div style="font-size: 24px; margin-bottom: 8px;">🔄</div>
                            <div style="font-size: 14px; color: #a16207; font-weight: 500;">Free Revisions</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e5e5e5;">
                <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">
                    Questions? Reply to this email or contact us anytime.
                </p>
                <p style="margin: 0; color: #999; font-size: 12px;">
                    Academic Excellence Hub | Professional Academic Services
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
        from: 'DoMyHomework <orders@domyhomework.co>',
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