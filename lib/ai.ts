"use server"

import OpenAI from "openai"
import { getAIConfig } from "./config"

// 生成文章摘要
export async function generateExcerpt(content: string): Promise<string | null> {
  try {
    const config = await getAIConfig()
    
    if (!config.autoGenerateExcerpt || !config.apiKey) {
      return null
    }

    const openai = new OpenAI({
      baseURL: config.baseURL,
      apiKey: config.apiKey,
    })

    const prompt = config.excerptPrompt.replace("{content}", content.slice(0, 3000)) // 限制内容长度

    const completion = await openai.chat.completions.create({
      model: config.model || "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
    })

    return completion.choices[0]?.message?.content?.trim() || null
  } catch (error) {
    console.error("Error generating excerpt:", error)
    return null
  }
}

// 生成封面图提示词
export async function generateCoverImagePrompt(title: string): Promise<string | null> {
  try {
    const config = await getAIConfig()
    
    if (!config.autoGenerateCoverImage || !config.apiKey) {
      return null
    }

    const prompt = config.coverImagePrompt.replace("{title}", title)
    return prompt
  } catch (error) {
    console.error("Error generating cover image prompt:", error)
    return null
  }
}

// 使用 DALL-E 生成封面图
export async function generateCoverImage(title: string): Promise<string | null> {
  try {
    const config = await getAIConfig()
    
    if (!config.autoGenerateCoverImage || !config.apiKey) {
      return null
    }

    const openai = new OpenAI({
      baseURL: config.baseURL,
      apiKey: config.apiKey,
    })

    const prompt = config.coverImagePrompt.replace("{title}", title)

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1792x1024",
      quality: "standard",
    })

    return response.data?.[0]?.url || null
  } catch (error) {
    console.error("Error generating cover image:", error)
    return null
  }
}

// 生成文章标签
export async function generateTags(content: string): Promise<string[]> {
  try {
    const config = await getAIConfig()
    
    if (!config.autoGenerateTags || !config.apiKey) {
      return []
    }

    const openai = new OpenAI({
      baseURL: config.baseURL,
      apiKey: config.apiKey,
    })

    const prompt = config.tagsPrompt.replace("{content}", content.slice(0, 3000)) // 限制内容长度

    const completion = await openai.chat.completions.create({
      model: config.model || "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 100,
    })

    const responseText = completion.choices[0]?.message?.content?.trim()
    if (!responseText) return []

    // 尝试解析 JSON 数组
    try {
      const tags = JSON.parse(responseText)
      if (Array.isArray(tags)) {
        return tags.filter((tag): tag is string => typeof tag === "string").slice(0, 5)
      }
    } catch {
      // 如果不是 JSON，尝试按逗号分割
      return responseText
        .split(/[,，]/)
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)
        .slice(0, 5)
    }

    return []
  } catch (error) {
    console.error("Error generating tags:", error)
    return []
  }
}

