import { getPosts } from "@/lib/posts"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"
import { Edit, ExternalLink, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { DeletePostButton } from "@/components/post/delete-post-button"
import { UnpublishPostButton } from "@/components/post/unpublish-post-button"

export default async function AdminDashboard() {
  const posts = await getPosts()

  return (
    <div className="space-y-6 md:space-y-8 p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl md:text-3xl font-bold tracking-tight truncate">Posts</h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1 hidden sm:block">
            Manage your blog posts and articles.
          </p>
        </div>
        <Button asChild size="sm" className="shrink-0">
          <Link href="/admin/posts/new">
            <Plus className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">New Post</span>
          </Link>
        </Button>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block border rounded-lg bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[400px]">Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No posts found.
                </TableCell>
              </TableRow>
            ) : (
              posts.map((post) => (
                <TableRow key={post.slug}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col gap-2">
                      <span className="text-base">{post.title || "Untitled"}</span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {post.slug}
                      </span>
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {post.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={post.published ? "default" : "secondary"}
                      className={
                        post.published
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-yellow-600 hover:bg-yellow-700"
                      }
                    >
                      {post.published ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(post.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/p/${post.slug}`} target="_blank">
                          <ExternalLink className="w-4 h-4" />
                          <span className="sr-only">View</span>
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/posts/${post.slug}`}>
                          <Edit className="w-4 h-4" />
                          <span className="sr-only">Edit</span>
                        </Link>
                      </Button>
                      {post.published && (
                        <UnpublishPostButton slug={post.slug} title={post.title} />
                      )}
                      <DeletePostButton slug={post.slug} title={post.title} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {posts.length === 0 ? (
          <div className="border rounded-lg bg-card shadow-sm p-8 text-center text-muted-foreground">
            No posts found.
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.slug} className="border rounded-lg bg-card shadow-sm p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base line-clamp-2">
                    {post.title || "Untitled"}
                  </h3>
                  <p className="text-xs text-muted-foreground font-mono mt-1 truncate">
                    {post.slug}
                  </p>
                </div>
                <Badge
                  variant={post.published ? "default" : "secondary"}
                  className={
                    post.published
                      ? "bg-green-600 hover:bg-green-700 shrink-0"
                      : "bg-yellow-600 hover:bg-yellow-700 shrink-0"
                  }
                >
                  {post.published ? "Published" : "Draft"}
                </Badge>
              </div>

              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-xs text-muted-foreground">
                  {format(new Date(post.createdAt), "MMM d, yyyy")}
                </span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                    <Link href={`/p/${post.slug}`} target="_blank">
                      <ExternalLink className="w-4 h-4" />
                      <span className="sr-only">View</span>
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                    <Link href={`/admin/posts/${post.slug}`}>
                      <Edit className="w-4 h-4" />
                      <span className="sr-only">Edit</span>
                    </Link>
                  </Button>
                  {post.published && (
                    <UnpublishPostButton slug={post.slug} title={post.title} />
                  )}
                  <DeletePostButton slug={post.slug} title={post.title} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
