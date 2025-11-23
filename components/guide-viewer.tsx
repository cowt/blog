"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { PostArticle } from "@/components/post/article"
import { ThemeToggle } from "@/components/theme-toggle"
import { useIsMobile } from "@/hooks/use-mobile"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Post } from "@/types"
import { GUIDE_CONTENT } from "@/lib/guide-content"

export function GuideViewer() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [mobileTab, setMobileTab] = useState<"code" | "preview">("preview")

  const guidePost: Post = {
    slug: "markdown-guide",
    title: "Markdown 语法指南",
    content: GUIDE_CONTENT,
    createdAt: new Date().toISOString(),
    published: true,
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 border-b bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.back()} 
            className="text-muted-foreground hover:text-foreground px-2 sm:px-4"
          >
            <ArrowLeft className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">返回</span>
          </Button>
          <h1 className="text-sm font-medium hidden sm:block">Markdown 语法指南</h1>
        </div>
        <ThemeToggle />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {isMobile ? (
          <Tabs value={mobileTab} onValueChange={(v) => setMobileTab(v as "code" | "preview")} className="flex-1 flex flex-col">
            <div className="px-4 py-2 border-b bg-muted/30">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="code">源码</TabsTrigger>
                <TabsTrigger value="preview">预览</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="code" className="flex-1 mt-0 p-0">
              <div className="px-4 py-6 overflow-y-auto h-full">
                <pre className="font-mono text-sm whitespace-pre-wrap break-words">
                  {GUIDE_CONTENT}
                </pre>
              </div>
            </TabsContent>
            <TabsContent value="preview" className="flex-1 mt-0 p-0 bg-muted/10">
              <div className="px-4 py-6 overflow-y-auto h-full">
                <PostArticle 
                  post={guidePost} 
                  variant="embedded"
                  showHeader={false}
                  showFooter={false}
                />
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex gap-4 h-full">
            {/* Left: Code */}
            <div className="flex-1 px-4 py-12 overflow-y-auto">
              <div style={{ maxWidth: 'var(--container-3xl)' }} className="mx-auto">
                <pre className="font-mono text-sm whitespace-pre-wrap break-words p-4 rounded-lg bg-muted/30">
                  {GUIDE_CONTENT}
                </pre>
              </div>
            </div>
            
            {/* Divider */}
            <div className="w-px bg-border" />
            
            {/* Right: Preview */}
            <div className="flex-1 bg-muted/10 px-4 py-12 overflow-y-auto">
              <div style={{ maxWidth: 'var(--container-3xl)' }} className="mx-auto">
                <PostArticle 
                  post={guidePost} 
                  variant="embedded"
                  showHeader={false}
                  showFooter={false}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
