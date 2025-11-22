import { getPost } from "@/lib/posts"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import Link from "next/link"
import type { Metadata } from "next"
import { Edit } from "lucide-react"
import { MarkdownRenderer } from "@/components/markdown"

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

  return (
    <article className="min-h-screen bg-background py-12 px-4 md:px-6">
      <div className="max-w-3xl mx-auto">
        <header className="mb-10 border-b pb-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight font-sans text-foreground text-center">{post.title}</h1>
          <div className="flex items-center justify-between text-muted-foreground font-sans">
            <address className="not-italic">
              By <span className="text-foreground font-medium">Admin</span>
            </address>
            <div className="flex items-center gap-4">
              <time dateTime={post.createdAt}>{format(new Date(post.createdAt), "MMMM d, yyyy")}</time>
              {/* Optional edit link for convenience if logged in (handled by middleware/redirect if not) */}
              <Link href={`/admin/posts/${post.slug}`} className="opacity-0 hover:opacity-100 transition-opacity">
                <Edit className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </header>

        <div className="prose prose-lg max-w-none font-serif prose-headings:font-sans prose-img:rounded-lg prose-img:w-full prose-a:text-primary">
          <MarkdownRenderer>{post.content}</MarkdownRenderer>
        </div>

        <div className="mt-20 pt-8 border-t flex justify-center">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-sans">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </article>
  )
}
