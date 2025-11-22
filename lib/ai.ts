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
