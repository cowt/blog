"use client"

import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LogOut, FileText, Plus, Settings, Sparkles, Database, Menu } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { logout } from "@/lib/auth"
import { useState } from "react"

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <div className="flex items-center justify-between px-2">
        <div className="font-serif text-2xl font-bold">Admin</div>
        <ThemeToggle />
      </div>

      <nav className="flex flex-col gap-2 flex-1">
        <Button variant="ghost" className="justify-start gap-2" asChild onClick={onNavigate}>
          <Link href="/admin">
            <FileText className="w-4 h-4" />
            Posts
          </Link>
        </Button>
        <Button variant="ghost" className="justify-start gap-2" asChild onClick={onNavigate}>
          <Link href="/admin/theme-config">
            <Settings className="w-4 h-4" />
            网站主题配置
          </Link>
        </Button>
        <Button variant="ghost" className="justify-start gap-2" asChild onClick={onNavigate}>
          <Link href="/admin/ai-config">
            <Sparkles className="w-4 h-4" />
            AI 相关配置
          </Link>
        </Button>
        <Button variant="ghost" className="justify-start gap-2" asChild onClick={onNavigate}>
          <Link href="/admin/s3-config">
            <Database className="w-4 h-4" />
            S3 存储配置
          </Link>
        </Button>
        <Button className="justify-start gap-2 mt-4" asChild onClick={onNavigate}>
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
    </>
  )
}

export function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Mobile menu button */}
      <div className="md:hidden flex items-center justify-between p-4 border-b bg-card">
        <div className="font-serif text-xl font-bold">Admin</div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-6 flex flex-col gap-6">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <SheetDescription className="sr-only">
              Admin dashboard navigation menu
            </SheetDescription>
            <SidebarContent onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 bg-card border-r border-border p-6 flex-col gap-6">
        <SidebarContent />
      </aside>

      <main className="flex-1 p-4 md:p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto">{children}</div>
      </main>
    </div>
  )
}
