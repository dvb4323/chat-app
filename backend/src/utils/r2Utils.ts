const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand
} = require('@aws-sdk/client-s3')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')
const { config } = require('dotenv')
config()

let S3: any

export async function initializeBucketR2() {
  S3 = await new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.ACCESS_KEY_ID,
      secretAccessKey: process.env.SECRET_ACCESS_KEY
    }
  })
}

async function getSignedURL(key: String) {
  const response = await getSignedUrl(
    S3,
    new GetObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: key
    }),
    {
      expiresIn: 6 * 60 * 60
    }
  )
  return response
}

async function putSignedURL(key: string) {
  const response = await getSignedUrl(
    S3,
    new PutObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: key
    }),
    {
      expiresIn: 6 * 60 * 60
    }
  )
  return response
}

export async function uploadFileToR2(
  file: Buffer,
  fileName: string
): Promise<string> {
  if (!S3) {
    throw new Error('S3 client not initialized')
  }
  let response = await putSignedURL(fileName)

  await fetch(response, { method: 'PUT', body: file })

  response = await getSignedURL(fileName)

  return response
}

export async function getFileFromR2(fileName: string): Promise<string> {
  if (!S3) {
    throw new Error('S3 client not initialized')
  }
  const response = await getSignedURL(fileName)
  return response
}
