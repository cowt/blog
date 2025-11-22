import type React from "react"
import { requireAuth, logout } from "@/lib/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LogOut, FileText, Plus, Settings, Sparkles, Database } from "lucide-react"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAuth()

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-card border-r border-border p-6 flex flex-col gap-6">
        <div className="font-serif text-2xl font-bold px-2">Admin</div>

        <nav className="flex flex-col gap-2 flex-1">
          <Button variant="ghost" className="justify-start gap-2" asChild>
            <Link href="/admin">
              <FileText className="w-4 h-4" />
              Posts
            </Link>
          </Button>
          <Button variant="ghost" className="justify-start gap-2" asChild>
            <Link href="/admin/theme-config">
              <Settings className="w-4 h-4" />
              网站主题配置
            </Link>
          </Button>
          <Button variant="ghost" className="justify-start gap-2" asChild>
            <Link href="/admin/ai-config">
              <Sparkles className="w-4 h-4" />
              AI 相关配置
            </Link>
          </Button>
          <Button variant="ghost" className="justify-start gap-2" asChild>
            <Link href="/admin/s3-config">
              <Database className="w-4 h-4" />
              S3 存储配置
            </Link>
          </Button>
          <Button className="justify-start gap-2 mt-4" asChild>
            <Link href="/admin/posts/new">
              <Plus className="w-4 h-4" />
              New Post
            </Link>
          </Button>
        </nav>

        <form action={logout}>
          <Button variant="outline" className="w-full gap-2 bg-transparent" type="submit">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </form>
      </aside>

      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto">{children}</div>
      </main>
    </div>
  )
}
