import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3"
import type { S3Config } from "@/types"

// 从环境变量读取默认配置
const ENV_CONFIG = {
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  endpoint: process.env.R2_ENDPOINT,
  bucketName: process.env.R2_BUCKET_NAME || "blog-storage",
  region: "auto",
}

// 缓存的 S3 客户端
let cachedClient: S3Client | null = null
let cachedConfig: string | null = null

// 配置缓存（避免重复读取 S3）
let configCache: S3Config | null = null
let configCacheTime: number = 0
const CONFIG_CACHE_TTL = 60 * 1000 // 缓存 60 秒

/**
 * 获取 S3 配置
 * 优先级: 管理后台配置 > 环境变量
 */
async function getStorageConfig(): Promise<S3Config | null> {
  try {
    // 检查缓存是否有效
    const now = Date.now()
    if (configCache && (now - configCacheTime) < CONFIG_CACHE_TTL) {
      return configCache
    }

    // 尝试从配置文件读取(避免循环依赖,直接读取)
    const configKey = "config/s3.json"
    
    // 如果有环境变量配置,先用环境变量创建临时客户端读取配置文件
    if (ENV_CONFIG.accessKeyId && ENV_CONFIG.secretAccessKey && ENV_CONFIG.endpoint) {
      const tempClient = new S3Client({
        region: ENV_CONFIG.region,
        endpoint: ENV_CONFIG.endpoint,
        credentials: {
          accessKeyId: ENV_CONFIG.accessKeyId,
          secretAccessKey: ENV_CONFIG.secretAccessKey,
        },
      })

      try {
        const command = new GetObjectCommand({
          Bucket: ENV_CONFIG.bucketName,
          Key: configKey,
        })
        const response = await tempClient.send(command)
        const configJson = await response.Body?.transformToString()
        
        if (configJson) {
          const config = JSON.parse(configJson) as S3Config
          // 如果配置文件中有完整的配置,使用配置文件
          if (config.accessKeyId && config.secretAccessKey && config.endpoint) {
            // 缓存配置
            configCache = config
            configCacheTime = now
            return config
          }
        }
      } catch (error: any) {
        // 配置文件不存在或读取失败,继续使用环境变量
        if (error?.Code === "NoSuchKey" || error?.name === "NoSuchKey") {
          console.log("No S3 config file found, using environment variables")
        } else {
          console.error("Error reading S3 config file:", error)
        }
      }
    }

    // 回退到环境变量配置
    if (ENV_CONFIG.accessKeyId && ENV_CONFIG.secretAccessKey && ENV_CONFIG.endpoint) {
      const envConfig = {
        accessKeyId: ENV_CONFIG.accessKeyId,
        secretAccessKey: ENV_CONFIG.secretAccessKey,
        endpoint: ENV_CONFIG.endpoint,
        bucketName: ENV_CONFIG.bucketName,
        region: ENV_CONFIG.region,
      }
      // 缓存环境变量配置
      configCache = envConfig
      configCacheTime = now
      return envConfig
    }

    return null
  } catch (error) {
    console.error("Error getting storage config:", error)
    return null
  }
}

/**
 * 获取或创建 S3 客户端
 * 支持配置更新后自动重新创建客户端
 */
async function getS3Client(): Promise<S3Client | null> {
  const config = await getStorageConfig()
  
  if (!config) {
    return null
  }

  // 生成配置的哈希值用于缓存判断
  const configHash = JSON.stringify({
    accessKeyId: config.accessKeyId,
    endpoint: config.endpoint,
    bucketName: config.bucketName,
  })

  // 如果配置没变,返回缓存的客户端
  if (cachedClient && cachedConfig === configHash) {
    return cachedClient
  }

  // 配置变化,创建新客户端
  cachedClient = new S3Client({
    region: config.region || "auto",
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  })
  cachedConfig = configHash

  return cachedClient
}

/**
 * 获取当前使用的 Bucket 名称
 */
async function getBucketName(): Promise<string> {
  const config = await getStorageConfig()
  return config?.bucketName || ENV_CONFIG.bucketName
}

export async function uploadFile(key: string, body: string | Uint8Array | Buffer, contentType: string) {
  const client = await getS3Client()
  
  if (!client) {
    throw new Error(
      "Storage not configured: Missing S3 configuration. Please configure via admin panel or environment variables.",
    )
  }

  try {
    const bucketName = await getBucketName()
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
    await client.send(command)
    return key
  } catch (error) {
    console.error("Error uploading file:", error)
    throw error
  }
}

export async function getFile(key: string) {
  const client = await getS3Client()
  
  if (!client) {
    console.warn("Storage not configured: Missing S3 configuration")
    return null
  }

  try {
    const bucketName = await getBucketName()
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    })
    const response = await client.send(command)
    const str = await response.Body?.transformToString()
    return str
  } catch (error: any) {
    // 文件不存在是正常情况，不打印错误日志
    if (error?.Code === "NoSuchKey" || error?.name === "NoSuchKey") {
      return null
    }
    // 其他错误才打印日志
    console.error("Error getting file:", error)
    return null
  }
}

export async function listFiles(prefix = "") {
  const client = await getS3Client()
  
  if (!client) {
    console.warn("Storage not configured: Missing S3 configuration")
    return []
  }

  try {
    const bucketName = await getBucketName()
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
    })
    const response = await client.send(command)
    return response.Contents || []
  } catch (error) {
    console.error("Error listing files:", error)
    return []
  }
}

// 导出用于测试或手动刷新配置
export async function refreshS3Client() {
  cachedClient = null
  cachedConfig = null
  configCache = null
  configCacheTime = 0
  return getS3Client()
}
