import { getPost } from "@/lib/posts"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { PostArticle } from "@/components/post/article"

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

  if (!post || !post.published) {
    notFound()
  }

  return <PostArticle post={post} editLinkHref={`/admin/posts/${post.slug}`} backLinkHref="/" />
}
