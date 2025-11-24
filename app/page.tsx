import { getPosts } from "@/lib/posts"
import { ThemeToggle } from "@/components/theme-toggle"
import { PostList } from "@/components/post/post-list"


import { getThemeConfig } from "@/lib/config"
import Image from "next/image"

export default async function Home() {
  const themeConfig = await getThemeConfig()
  // Only show published posts that are set to show in list (default true)
  const posts = (await getPosts()).filter((p) => p.published && p.showInList !== false)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="py-4 mb-0">
        <div className="container max-w-3xl mx-auto px-4 flex justify-between items-center">
            <h1 className="text-xl font-bold tracking-tight font-serif flex items-center gap-2">
              {themeConfig.logo && (
                <Image
                  src={themeConfig.logo}
                  alt="Logo"
                  width={32}
                  height={32}
                  className="w-8 h-8"
                />
              )}
              {themeConfig.siteName}
            </h1>

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
