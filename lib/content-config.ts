"use server"

import { getConfig, saveConfig } from "./config"
import { ContentStyleConfig, defaultContentConfig } from "./content-styles"
import { unstable_cache, revalidateTag } from "next/cache"

const CONTENT_CONFIG_KEY = "content"

// 缓存内容配置，5 分钟过期
const getCachedContentConfig = unstable_cache(
  async () => {
    try {
      const config = await getConfig(CONTENT_CONFIG_KEY)
      return config ? { ...defaultContentConfig, ...config } : defaultContentConfig
    } catch (error) {
      console.error("Failed to get content config:", error)
      return defaultContentConfig
    }
  },
  ["content-config"],
  { revalidate: 300, tags: ["config", "content-config"] }
)

export async function getContentConfig(): Promise<ContentStyleConfig> {
  return getCachedContentConfig()
}

export async function saveContentConfig(config: ContentStyleConfig): Promise<void> {
  try {
    await saveConfig(CONTENT_CONFIG_KEY, config)
    // 清除缓存
    revalidateTag("content-config", "max")
  } catch (error) {
    console.error("Failed to save content config:", error)
    throw error
  }
}