"use client"

import Link from "next/link"
import { format } from "date-fns"
import { Edit, Quote } from "lucide-react"
import type { Post } from "@/types"
import { MarkdownRenderer } from "@/components/markdown"

interface PostArticleProps {
  post: Post
  editLinkHref?: string
  backLinkHref?: string
  variant?: "page" | "embedded"
  showHeader?: boolean
  showFooter?: boolean
}

export function PostArticle({
  post,
  editLinkHref,
  backLinkHref,
  variant = "page",
  showHeader = true,
  showFooter = true,
}: PostArticleProps) {
  const publishedText = post.createdAt ? format(new Date(post.createdAt), "MMMM d, yyyy") : null
  const outerClass =
    variant === "embedded" ? "bg-background p-6 md:p-8" : "min-h-screen bg-background py-12 px-4 md:px-6"

  return (
    <article className={outerClass}>
      <div className="max-w-3xl mx-auto">
        {showHeader ? (
          <header className="mb-10 border-b pb-6">
            <div className="mb-4 overflow-hidden rounded-xl aspect-[2/1] border">
              <img
                src={post.coverImage || "/cover.svg"}
                alt={post.title}
                className="object-cover w-full h-full"
              />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold my-[10px] tracking-tight font-sans text-foreground">
              {post.title}
            </h1>
            {post.excerpt && (
              <div className="flex gap-2 items-start text-xs text-muted-foreground bg-muted/40 p-3 rounded-lg mb-6 leading-relaxed">
                <Quote className="w-3.5 h-3.5 shrink-0 mt-0.5 opacity-50" />
                <p>
                  {post.excerpt}
                </p>
              </div>
            )}
            <div className="flex items-center justify-between text-muted-foreground font-sans">
              <address className="not-italic">
                By <span className="text-foreground font-medium">Admin</span>
              </address>
              <div className="flex items-center gap-4">
                {publishedText ? (
                  <time dateTime={post.createdAt}>{publishedText}</time>
                ) : (
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">Draft preview</span>
                )}
                {editLinkHref ? (
                  <Link href={editLinkHref} className="opacity-0 hover:opacity-100 transition-opacity">
                    <Edit className="w-4 h-4" />
                    <span className="sr-only">Edit post</span>
                  </Link>
                ) : null}
              </div>
            </div>
          </header>
        ) : null}

        <div className="prose prose-lg max-w-none font-serif prose-headings:font-sans prose-img:rounded-lg prose-img:w-full prose-a:text-primary">
          <MarkdownRenderer>{post.content}</MarkdownRenderer>
        </div>

        {showFooter && backLinkHref ? (
          <div className="mt-20 pt-8 flex justify-center">
            <Link
              href={backLinkHref}
              className="text-muted-foreground hover:text-foreground transition-colors text-sm font-sans"
            >
              &larr; Back to Home
            </Link>
          </div>
        ) : null}
      </div>
    </article>
  )
}
