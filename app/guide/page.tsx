import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"
import Image from "next/image"
import { PostArticle } from "@/components/post/article"
import { GUIDE_CONTENT } from "@/lib/guide-content"
import { getContentConfig } from "@/lib/content-config"
import type { Post } from "@/types"

export const metadata = {
  title: "Markdown 语法指南",
  description: "博客系统支持的 Markdown 语法完整指南",
}

export default async function GuidePage() {
  const contentConfig = await getContentConfig()

  const guidePost: Post = {
    slug: "markdown-guide",
    title: "Markdown 语法指南",
    content: GUIDE_CONTENT,
    excerpt: "本指南涵盖博客系统支持的所有 Markdown 语法，包括基础格式、代码块、表格、数学公式、Mermaid 图表等高级功能。",
    coverImage: "/cover.svg",
    createdAt: "2024-01-01T00:00:00.000Z",
    published: true,
    showInList: false,
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="py-4">
        <div className="container max-w-3xl mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <Image
              src="/icon.png"
              alt="Home"
              width={32}
              height={32}
              className="w-8 h-8 rounded-lg"
            />
          </Link>
          <ThemeToggle />
        </div>
      </header>
      <PostArticle post={guidePost} backLinkHref="/" contentConfig={contentConfig} />
    </div>
  )
}
