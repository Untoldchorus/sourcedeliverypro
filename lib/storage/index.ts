export interface StorageUploadResult {
  url: string
  key: string
  size: number
}

export async function uploadFile(
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<StorageUploadResult> {
  // In development, or if Cloudinary / Vercel Blob / S3 credentials aren't set:
  if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.CLOUDINARY_CLOUD_NAME) {
    const base64 = file.toString('base64')
    return {
      url: `data:${contentType};base64,${base64}`,
      key: `dev-${fileName}`,
      size: file.length,
    }
  }

  // Placeholder for real Vercel Blob / S3 / Cloudinary upload logic
  return {
    url: `https://storage.sourcedeliverypro.com/uploads/${fileName}`,
    key: `uploads/${fileName}`,
    size: file.length,
  }
}