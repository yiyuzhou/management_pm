import { TosClient } from '@volcengine/tos-sdk'
import path from 'path'
import { stripTosProtocol, tosPublicBaseUrl } from '~/utils/tos-url'

let tosClient: TosClient | null = null

function getTosClient(): TosClient {
  if (tosClient) return tosClient

  const config = useRuntimeConfig()
  tosClient = new TosClient({
    accessKeyId: config.tos.accessKey,
    accessKeySecret: config.tos.accessSecret,
    endpoint: stripTosProtocol(config.tos.endpoint),
    region: config.tos.region,
    secure: true,
  })
  const axiosInst = (tosClient as any).axiosInst
  if (axiosInst?.defaults) {
    axiosInst.defaults.proxy = false
  }
  return tosClient
}

function generateObjectKey(filename: string): string {
  const ext = path.extname(filename)
  const baseName = path.basename(filename, ext)
  const uniqueName = `${baseName}-${Date.now()}${ext}`
  return `uploads/${uniqueName}`
}

export async function uploadToTOS(
  fileBuffer: Buffer,
  filename: string,
  contentType?: string
): Promise<{ url: string; key: string }> {
  const config = useRuntimeConfig()
  const client = getTosClient()
  const key = generateObjectKey(filename)

  await client.putObject({
    bucket: config.tos.bucket,
    key,
    body: fileBuffer,
    contentType: contentType || 'application/octet-stream',
    acl: 'public-read',
  })

  const url = `${tosPublicBaseUrl(config.tos.domain)}/${key}`
  return { url, key }
}

export async function deleteFromTOS(key: string): Promise<void> {
  const config = useRuntimeConfig()
  const client = getTosClient()
  await client.deleteObject({
    bucket: config.tos.bucket,
    key,
  })
}
