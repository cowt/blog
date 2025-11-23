"use client"

import { useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { LayoutGrid, List, Quote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { MarkdownRenderer } from "@/components/markdown"
import type { PostMeta } from "@/types"

interface PostListProps {
  posts: PostMeta[]
}

type ViewMode = "list" | "card"

export function PostList({ posts }: PostListProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("card")

  if (posts.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p>No stories yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end border-b pb-4">
        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0 hover:bg-background",
              viewMode === "card" && "bg-background shadow-sm"
            )}
            onClick={() => setViewMode("card")}
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="sr-only">Card view</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0 hover:bg-background",
              viewMode === "list" && "bg-background shadow-sm"
            )}
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
            <span className="sr-only">List view</span>
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "grid gap-6",
          viewMode === "card"
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            : "grid-cols-1"
        )}
      >
        {posts.map((post) => (
          <article
            key={post.slug}
            className={cn(
              "group relative flex flex-col bg-card",
              viewMode === "list" && "flex-row gap-4 sm:gap-6 items-center"
            )}
          >
            {/* Cover Image */}
            <Link
              href={`/p/${post.slug}`}
              className={cn(
                "block shrink-0 !border-b-0",
                viewMode === "card" ? "w-full mb-2" : "w-28 sm:w-48 order-last"
              )}
            >
              <div className={cn(
                "overflow-hidden rounded-xl border",
                viewMode === "card" ? "aspect-[2/1] w-full" : "aspect-[4/3] w-full"
              )}>
                <img
                  src={post.coverImage || "/cover.svg"}
                  alt={post.title}
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </Link>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-2">
              <Link href={`/p/${post.slug}`} className="block space-y-2">
                <h2 className={cn(
                  "font-bold group-hover:text-primary transition-colors font-sans tracking-tight text-foreground my-[10px]",
                  viewMode === "card" ? "text-lg" : "text-lg"
                )}>
                  {post.title}
                </h2>
                {post.excerpt && (
                  <div className="flex gap-1.5 items-start text-[10px] text-muted-foreground bg-muted/40 p-2 rounded leading-relaxed">
                    <Quote className="w-3 h-3 shrink-0 mt-0.5 opacity-50" />
                    <div className="line-clamp-3 text-sm [&>p]:m-0 [&>p]:inline">
                      <MarkdownRenderer>{post.excerpt}</MarkdownRenderer>
                    </div>
                  </div>
                )}
              </Link>
              <div className="text-xs text-muted-foreground font-sans pt-1">
                {format(new Date(post.createdAt), "MMMM d, yyyy")}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
