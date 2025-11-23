import { getPosts } from "@/lib/posts"
import { ThemeToggle } from "@/components/theme-toggle"
import { PostList } from "@/components/post/post-list"


export default async function Home() {
  // Only show published posts
  const posts = (await getPosts()).filter((p) => p.published)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="py-4 mb-8">
        <div className="container max-w-3xl mx-auto px-4 flex justify-between items-center">
          <h1 className="text-xl font-bold tracking-tight font-serif">Blog</h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 container max-w-3xl mx-auto px-4 pb-12">
        <PostList posts={posts} />
      </main>

      <footer className="py-6 text-center text-sm text-muted-foreground mt-auto">
        &copy; {new Date().getFullYear()} Blog
      </footer>
    </div>
  )
}
