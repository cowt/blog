import { getPost } from "@/lib/posts"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { PostArticle } from "@/components/post/article"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"
import Image from "next/image"
import { getContentConfig } from "@/lib/content-config"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return { title: "Not Found" }
  return {
    title: post.title,
    description: post.content.substring(0, 160),
  }
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPost(slug)
  const contentConfig = await getContentConfig()

  if (!post || !post.published) {
    notFound()
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
      <PostArticle 
        post={post} 
        editLinkHref={`/admin/posts/${post.slug}`} 
        backLinkHref="/" 
        contentConfig={contentConfig}
      />
    </div>
  )
}
