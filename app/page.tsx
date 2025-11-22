import { getPosts } from "@/lib/posts"
import Link from "next/link"
import { format } from "date-fns"


export default async function Home() {
  // Only show published posts
  const posts = (await getPosts()).filter((p) => p.published)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b py-4 mb-8">
        <div className="container max-w-3xl mx-auto px-4 flex justify-between items-center">
          <h1 className="text-xl font-bold tracking-tight font-serif">Blog</h1>
        </div>
      </header>

      <main className="flex-1 container max-w-3xl mx-auto px-4 pb-12">
        {posts.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p>No stories yet.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {posts.map((post) => (
              <article key={post.slug} className="group">
                <Link href={`/p/${post.slug}`} className="block space-y-3">
                  <h2 className="text-3xl font-bold group-hover:text-primary/80 transition-colors font-sans tracking-tight text-foreground">
                    {post.title}
                  </h2>
                  <div className="text-sm text-muted-foreground font-sans">
                    {format(new Date(post.createdAt), "MMMM d, yyyy")}
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>

      <footer className="py-6 border-t text-center text-sm text-muted-foreground mt-auto">
        &copy; {new Date().getFullYear()} Blog
      </footer>
    </div>
  )
}
