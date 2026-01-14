"use server"

import { uploadFile, getFile } from "./storage"
import type { ThemeConfig, AIConfig, S3Config } from "@/types"
import { unstable_cache, revalidateTag } from "next/cache"

const THEME_CONFIG_FILE = "config/theme.json"
const AI_CONFIG_FILE = "config/ai.json"
const S3_CONFIG_FILE = "config/s3.json"

// 默认 AI 配置
const DEFAULT_AI_CONFIG: AIConfig = {
  baseURL: "https://api.openai.com/v1",
  apiKey: "",
  model: "gpt-4o-mini",
  autoGenerateTags: false,
  excerptPrompt: "请为以下文章生成一段简洁的摘要(100-150字),用于SEO和列表预览:\n\n{content}",
  coverImagePrompt: "Generate a beautiful cover image for a blog post with the following title: {title}",
  tagsPrompt: "Based on the following blog post content, suggest 3-5 relevant tags. Return only the tags as a JSON array of strings, without any explanation.\n\nContent:\n{content}",
}

// 默认主题配置
const DEFAULT_THEME_CONFIG: ThemeConfig = {
  siteName: "My Blog",
  siteDescription: "A personal blog",
  siteUrl: "",
  logo: "/logo.svg",
  favicon: "/logo.svg",
  theme: {
    primaryColor: "#000000",
    fontFamily: "system-ui",
  },
  announcement: {
    enabled: false,
    message: "",
    scrolling: false,
    dismissible: true,
    type: "info",
  },
}

// 默认 S3 配置
const DEFAULT_S3_CONFIG: S3Config = {
  accessKeyId: "",
  secretAccessKey: "",
  endpoint: "",
  bucketName: "",
  region: "auto",
  publicUrl: "",
}

// 主题配置管理
const getCachedThemeConfig = unstable_cache(
  async () => {
    try {
      const json = await getFile(THEME_CONFIG_FILE)
      if (!json) return DEFAULT_THEME_CONFIG

      const storedConfig = JSON.parse(json)
      // Merge configs, but use default values for empty strings
      return {
        siteName: storedConfig.siteName || DEFAULT_THEME_CONFIG.siteName,
        siteDescription: storedConfig.siteDescription || DEFAULT_THEME_CONFIG.siteDescription,
        siteUrl: storedConfig.siteUrl || DEFAULT_THEME_CONFIG.siteUrl,
        logo: storedConfig.logo || DEFAULT_THEME_CONFIG.logo,
        favicon: storedConfig.favicon || DEFAULT_THEME_CONFIG.favicon,
        theme: {
          primaryColor: storedConfig.theme?.primaryColor || DEFAULT_THEME_CONFIG.theme?.primaryColor,
          fontFamily: storedConfig.theme?.fontFamily || DEFAULT_THEME_CONFIG.theme?.fontFamily,
        },
        announcement: storedConfig.announcement ?? DEFAULT_THEME_CONFIG.announcement,
      }
    } catch (e) {
      console.error("Error fetching theme config:", e)
      return DEFAULT_THEME_CONFIG
    }
  },
  ["theme-config"],
  { revalidate: 300, tags: ["config", "theme-config"] }
)

export async function getThemeConfig(): Promise<ThemeConfig> {
  return getCachedThemeConfig()
}

export async function saveThemeConfig(config: ThemeConfig) {
  try {
    await uploadFile(THEME_CONFIG_FILE, JSON.stringify(config, null, 2), "application/json")
    revalidateTag("theme-config", "fetch")
    return { success: true }
  } catch (e) {
    console.error("Error saving theme config:", e)
    throw new Error("Failed to save theme config")
  }
}

// AI 配置管理
const getCachedAIConfig = unstable_cache(
  async () => {
    try {
      const json = await getFile(AI_CONFIG_FILE)
      if (!json) return DEFAULT_AI_CONFIG
      return { ...DEFAULT_AI_CONFIG, ...JSON.parse(json) }
    } catch (e) {
      console.error("Error fetching AI config:", e)
      return DEFAULT_AI_CONFIG
    }
  },
  ["ai-config"],
  { revalidate: 300, tags: ["config", "ai-config"] }
)

export async function getAIConfig(): Promise<AIConfig> {
  return getCachedAIConfig()
}

export async function saveAIConfig(config: AIConfig) {
  try {
    await uploadFile(AI_CONFIG_FILE, JSON.stringify(config, null, 2), "application/json")
    revalidateTag("ai-config", "fetch")
    return { success: true }
  } catch (e) {
    console.error("Error saving AI config:", e)
    throw new Error("Failed to save AI config")
  }
}

// S3 配置管理
const getCachedS3Config = unstable_cache(
  async () => {
    try {
      const json = await getFile(S3_CONFIG_FILE)
      if (!json) return DEFAULT_S3_CONFIG
      return { ...DEFAULT_S3_CONFIG, ...JSON.parse(json) }
    } catch (e) {
      console.error("Error fetching S3 config:", e)
      return DEFAULT_S3_CONFIG
    }
  },
  ["s3-config"],
  { revalidate: 300, tags: ["config", "s3-config"] }
)

export async function getS3Config(): Promise<S3Config> {
  return getCachedS3Config()
}

export async function saveS3Config(config: S3Config) {
  try {
    await uploadFile(S3_CONFIG_FILE, JSON.stringify(config, null, 2), "application/json")
    revalidateTag("s3-config", "fetch")
    return { success: true }
  } catch (e) {
    console.error("Error saving S3 config:", e)
    throw new Error("Failed to save S3 config")
  }
}

// 通用配置管理函数
export async function getConfig(key: string): Promise<any> {
  try {
    const configFile = `config/${key}.json`
    const json = await getFile(configFile)
    return json ? JSON.parse(json) : null
  } catch (e) {
    console.error(`Error fetching config for key ${key}:`, e)
    return null
  }
}

export async function saveConfig(key: string, config: any): Promise<void> {
  try {
    const configFile = `config/${key}.json`
    await uploadFile(configFile, JSON.stringify(config, null, 2), "application/json")
  } catch (e) {
    console.error(`Error saving config for key ${key}:`, e)
    throw new Error(`Failed to save config for key ${key}`)
  }
}
