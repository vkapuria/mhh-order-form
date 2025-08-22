import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

// Initialize R2 client (S3-compatible)
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export async function uploadToR2(
  file: Buffer,
  fileName: string,
  mimeType: string,
  orderId: string
): Promise<{ key: string; url: string }> {
  // Create unique key: orders/[orderId]/[timestamp]-[filename]
  const timestamp = Date.now()
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
  const key = `orders/${orderId}/${timestamp}-${sanitizedFileName}`

  console.log('R2 Upload:', {
    fileName,
    key,
    bucket: process.env.R2_BUCKET_NAME,
    orderId
  })

  try {
    // Upload to R2
    await r2Client.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: key,
        Body: file,
        ContentType: mimeType,
        Metadata: {
          orderId,
          uploadDate: new Date().toISOString(),
        },
      })
    )

    // Generate public URL
    const url = `${process.env.R2_PUBLIC_URL}/${key}`
    
    console.log('R2 upload successful:', url)
    return { key, url }
    
  } catch (error) {
    console.error('R2 upload error:', error)
    throw new Error('Failed to upload file to R2')
  }
}

export async function deleteFromR2(key: string): Promise<void> {
  try {
    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: key,
      })
    )
  } catch (error) {
    console.error('R2 delete error:', error)
    throw new Error('Failed to delete file from R2')
  }
}