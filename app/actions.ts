"use server"

import { savePost } from "@/lib/posts"
import type { Post } from "@/types"
import { revalidatePath } from "next/cache"
import { isAuthenticated } from "@/lib/auth"
import { generateExcerpt, generateCoverImage } from "@/lib/ai"
import { getAIConfig } from "@/lib/config"

export async function savePostAction(post: Post) {
  if (!(await isAuthenticated())) {
    throw new Error("Unauthorized")
  }

  // 获取 AI 配置
  const aiConfig = await getAIConfig()

  // 如果开启了自动生成摘要且文章没有摘要,则生成
  if (aiConfig.autoGenerateExcerpt && !post.excerpt && post.content) {
    const excerpt = await generateExcerpt(post.content)
    if (excerpt) {
      post.excerpt = excerpt
    }
  }

  // 如果开启了自动生成封面图且文章没有封面图,则生成
  if (aiConfig.autoGenerateCoverImage && !post.coverImage && post.title) {
    const coverImageUrl = await generateCoverImage(post.title)
    if (coverImageUrl) {
      post.coverImage = coverImageUrl
    }
  }

  await savePost(post)
  revalidatePath("/admin")
  revalidatePath(`/p/${post.slug}`)
  return { success: true }
}
