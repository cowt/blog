"use server"

import { getConfig, saveConfig } from "./config"
import { ContentStyleConfig, defaultContentConfig } from "./content-styles"

const CONTENT_CONFIG_KEY = "content"

export async function getContentConfig(): Promise<ContentStyleConfig> {
  try {
    const config = await getConfig(CONTENT_CONFIG_KEY)
    return config ? { ...defaultContentConfig, ...config } : defaultContentConfig
  } catch (error) {
    console.error("Failed to get content config:", error)
    return defaultContentConfig
  }
}

export async function saveContentConfig(config: ContentStyleConfig): Promise<void> {
  try {
    await saveConfig(CONTENT_CONFIG_KEY, config)
  } catch (error) {
    console.error("Failed to save content config:", error)
    throw error
  }
}