"use server"

import { uploadFile, getFile } from "./storage"
import type { ThemeConfig, AIConfig, S3Config } from "@/types"

const THEME_CONFIG_FILE = "config/theme.json"
const AI_CONFIG_FILE = "config/ai.json"
const S3_CONFIG_FILE = "config/s3.json"

// 默认 AI 配置
const DEFAULT_AI_CONFIG: AIConfig = {
  baseURL: "https://api.openai.com/v1",
  apiKey: "",
  model: "gpt-4o-mini",
  autoGenerateExcerpt: false,
  autoGenerateCoverImage: false,
  autoGenerateTags: false,
  excerptPrompt: "请为以下文章生成一段简洁的摘要(100-150字),用于SEO和列表预览:\n\n{content}",
  coverImagePrompt: "Generate a beautiful cover image for a blog post with the following title: {title}",
  tagsPrompt: "Based on the following blog post content, suggest 3-5 relevant tags. Return only the tags as a JSON array of strings, without any explanation.\n\nContent:\n{content}",
}

// 默认主题配置
const DEFAULT_THEME_CONFIG: ThemeConfig = {
  siteName: "My Blog",
  siteDescription: "A personal blog built with Next.js",
  siteUrl: "",
  logo: "",
  favicon: "",
  theme: {
    primaryColor: "#000000",
    fontFamily: "system-ui",
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
export async function getThemeConfig(): Promise<ThemeConfig> {
  try {
    const json = await getFile(THEME_CONFIG_FILE)
    if (!json) return DEFAULT_THEME_CONFIG
    return { ...DEFAULT_THEME_CONFIG, ...JSON.parse(json) }
  } catch (e) {
    console.error("Error fetching theme config:", e)
    return DEFAULT_THEME_CONFIG
  }
}

export async function saveThemeConfig(config: ThemeConfig) {
  try {
    await uploadFile(THEME_CONFIG_FILE, JSON.stringify(config, null, 2), "application/json")
    return { success: true }
  } catch (e) {
    console.error("Error saving theme config:", e)
    throw new Error("Failed to save theme config")
  }
}

// AI 配置管理
export async function getAIConfig(): Promise<AIConfig> {
  try {
    const json = await getFile(AI_CONFIG_FILE)
    if (!json) return DEFAULT_AI_CONFIG
    return { ...DEFAULT_AI_CONFIG, ...JSON.parse(json) }
  } catch (e) {
    console.error("Error fetching AI config:", e)
    return DEFAULT_AI_CONFIG
  }
}

export async function saveAIConfig(config: AIConfig) {
  try {
    await uploadFile(AI_CONFIG_FILE, JSON.stringify(config, null, 2), "application/json")
    return { success: true }
  } catch (e) {
    console.error("Error saving AI config:", e)
    throw new Error("Failed to save AI config")
  }
}

// S3 配置管理
export async function getS3Config(): Promise<S3Config> {
  try {
    const json = await getFile(S3_CONFIG_FILE)
    if (!json) return DEFAULT_S3_CONFIG
    return { ...DEFAULT_S3_CONFIG, ...JSON.parse(json) }
  } catch (e) {
    console.error("Error fetching S3 config:", e)
    return DEFAULT_S3_CONFIG
  }
}

export async function saveS3Config(config: S3Config) {
  try {
    await uploadFile(S3_CONFIG_FILE, JSON.stringify(config, null, 2), "application/json")
    return { success: true }
  } catch (e) {
    console.error("Error saving S3 config:", e)
    throw new Error("Failed to save S3 config")
  }
}
