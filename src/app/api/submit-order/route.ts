import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { uploadToR2 } from '@/lib/r2'
import { calculateEnhancedPricing } from '@/lib/pricing/engine'

export async function POST(request: NextRequest) {
  try {
    // Check content type
    const contentType = request.headers.get('content-type')
    console.log('🔍 API Route - Content Type:', contentType)
    console.log('🔍 API Route - Headers:', Object.fromEntries(request.headers.entries()))
    
    if (contentType?.includes('multipart/form-data')) {
      console.log('📎 Processing multipart form with files...')
      
      const formData = await request.formData()
      
      // Debug: Log all form data entries
      console.log('📋 FormData received in API:')
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}: [File] ${value.name} (${value.size} bytes, type: ${value.type})`)
        } else {
          console.log(`  ${key}: ${value}`)
        }
      }
      
      // Extract form fields
      const orderData = {
        service_type: formData.get('serviceType') as string,
        full_name: formData.get('fullName') as string,
        email: formData.get('email') as string,
        subject: formData.get('subject') as string,
        document_type: formData.get('documentType') as string,
        instructions: formData.get('instructions') as string || '',
        pages: parseInt(formData.get('pages') as string),
        deadline: formData.get('deadline') as string,
        reference_style: formData.get('referenceStyle') as string,
        has_files: formData.get('hasFiles') === 'true',
        session_id: formData.get('sessionId') as string,
      }

      console.log('📦 Order data extracted:', orderData)

      // Calculate pricing
      const pricing = calculateEnhancedPricing({
        serviceType: orderData.service_type as any,
        pages: orderData.pages,
        deadline: orderData.deadline,
        documentType: orderData.document_type,
      })

      console.log('💰 Pricing calculated:', pricing)

      // Insert order into Supabase
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          ...orderData,
          total_price: pricing.totalPrice,
          base_price: pricing.basePrice,
          discount_amount: pricing.savings,
          rush_fee: pricing.rushFee,
          status: 'pending'
        })
        .select()
        .single()

      if (orderError) {
        console.error('❌ Order insert error:', orderError)
        throw orderError
      }

      console.log('✅ Order created:', order.id)

      // Handle file uploads if any
      const files = formData.getAll('files') as File[]
      console.log(`📎 Files to upload: ${files.length}`)
      
      const uploadedFiles = []

      if (files.length > 0 && files[0].size > 0) {
        console.log('🚀 Starting file uploads...')
        
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          console.log(`📤 Uploading file ${i + 1}/${files.length}: ${file.name}`)
          
          try {
            // Convert file to buffer
            const arrayBuffer = await file.arrayBuffer()
            const buffer = Buffer.from(arrayBuffer)
            console.log(`  File buffer size: ${buffer.length} bytes`)
            
            // Check R2 config
            console.log('  R2 Config check:', {
              hasAccountId: !!process.env.R2_ACCOUNT_ID,
              hasBucket: !!process.env.R2_BUCKET_NAME,
              hasAccessKey: !!process.env.R2_ACCESS_KEY_ID,
              hasSecretKey: !!process.env.R2_SECRET_ACCESS_KEY,
              hasPublicUrl: !!process.env.R2_PUBLIC_URL,
            })
            
            // Upload to R2
            console.log('  Calling uploadToR2...')
            const { key, url } = await uploadToR2(
              buffer,
              file.name,
              file.type || 'application/octet-stream',
              order.id
            )
            
            console.log(`  ✅ R2 upload successful:`, { key, url })
            
            // Save to database
            const attachmentData = {
              order_id: order.id,
              file_name: file.name,
              file_size: file.size,
              file_type: file.type || 'application/octet-stream',
              r2_key: key,
              r2_url: url,
            }
            
            console.log('  💾 Saving to database:', attachmentData)
            
            const { data: attachment, error: attachError } = await supabase
              .from('file_attachments')
              .insert(attachmentData)
              .select()
              .single()
            
            if (attachError) {
              console.error(`  ❌ Database insert error:`, attachError)
            } else {
              console.log(`  ✅ File record saved:`, attachment.id)
              uploadedFiles.push(attachment)
            }
            
          } catch (uploadError) {
            console.error(`❌ Failed to upload ${file.name}:`, uploadError)
            // Continue with other files even if one fails
          }
        }
        
        console.log(`✅ Uploaded ${uploadedFiles.length}/${files.length} files successfully`)
      } else {
        console.log('ℹ️ No files to upload or empty files')
      }

      return NextResponse.json({
        success: true,
        order: {
          ...order,
          attachments: uploadedFiles
        },
        message: 'Order submitted successfully!'
      })

    } else {
      console.log('📄 Processing JSON submission (no files)...')
      
      // Handle JSON submission (no files)
      const data = await request.json()
      console.log('📦 JSON data received:', data)
      
      // Calculate pricing
      const pricing = calculateEnhancedPricing({
        serviceType: data.serviceType,
        pages: data.pages,
        deadline: data.deadline,
        documentType: data.documentType,
      })

      // Insert order
      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          service_type: data.serviceType,
          full_name: data.fullName,
          email: data.email,
          subject: data.subject,
          document_type: data.documentType,
          instructions: data.instructions || '',
          pages: data.pages,
          deadline: data.deadline,
          reference_style: data.referenceStyle,
          has_files: data.hasFiles,
          total_price: pricing.totalPrice,
          base_price: pricing.basePrice,
          discount_amount: pricing.savings,
          rush_fee: pricing.rushFee,
          session_id: data.sessionId || `session_${Date.now()}`,
          status: 'pending'
        })
        .select()
        .single()

      if (error) {
        console.error('❌ Order insert error:', error)
        throw error
      }

      console.log('✅ Order created (no files):', order.id)

      return NextResponse.json({
        success: true,
        order,
        message: 'Order submitted successfully!'
      })
    }

  } catch (error) {
    console.error('❌ Order submission error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit order' },
      { status: 500 }
    )
  }
}