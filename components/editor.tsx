"use client"

import { useState, useEffect, useMemo, lazy, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { savePostAction } from "@/app/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ArrowLeft, Loader2, Download, BookOpen, Save } from "lucide-react"
import { PublishModal } from "./editor/publish-modal"
import { markdownToHtml } from "@/lib/markdown-to-html"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"
import { getEditorClassName, defaultContentConfig, ContentStyleConfig } from "@/lib/content-styles"

// 动态导入 TiptapEditor，实现代码分割和延迟加载
const TiptapEditor = lazy(() =>
  import("./editor/tiptap-editor").then((mod) => ({ default: mod.TiptapEditor }))
)

// 编辑器加载骨架屏
function EditorSkeleton() {
  return (
    <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full p-4 sm:p-6 lg:p-8 animate-pulse">
      <div className="space-y-4">
        <div className="h-10 bg-muted rounded w-3/4"></div>
        <div className="h-4 bg-muted rounded w-full"></div>
        <div className="h-4 bg-muted rounded w-5/6"></div>
        <div className="h-4 bg-muted rounded w-4/6"></div>
      </div>
    </div>
  )
}

interface EditorProps {
  initialPost?: {
    slug: string
    title: string
    content: string
    published: boolean
    createdAt: string
    excerpt?: string
    coverImage?: string
    showInList?: boolean
    tags?: string[]
  } | null
  newSlug?: string
  contentConfig?: ContentStyleConfig
}

export function Editor({ initialPost, newSlug, contentConfig = defaultContentConfig }: EditorProps) {
  // Extract title from markdown content if exists
  const extractTitle = (content: string) => {
    const match = content.match(/^#\s+(.+)$/m)
    return match ? match[1] : ""
  }

  const initialContent = initialPost?.content || ""
  const extractedTitle = extractTitle(initialContent)
  
  const [markdown, setMarkdown] = useState(initialContent)
  const [slug, setSlug] = useState(initialPost?.slug || newSlug || "")
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt || "")
  const [coverImage, setCoverImage] = useState(initialPost?.coverImage || "")
  const [showInList, setShowInList] = useState(initialPost?.showInList ?? true)
  const [tags, setTags] = useState<string[]>(initialPost?.tags || [])
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false)
  
  // Local Storage Logic
  const storageKey = useMemo(() => {
    if (initialPost?.slug) return `draft_post_${initialPost.slug}`
    return "draft_post_new"
  }, [initialPost?.slug])

  // Load from local storage on mount
  useEffect(() => {
    // Only restore draft for new posts
    if (initialPost) return

    const saved = localStorage.getItem(storageKey)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.content !== initialContent) {
            setMarkdown(parsed.content || "")
            if (parsed.excerpt) setExcerpt(parsed.excerpt)
            if (parsed.coverImage) setCoverImage(parsed.coverImage)
            if (parsed.tags) setTags(parsed.tags)
            if (parsed.showInList !== undefined) setShowInList(parsed.showInList)
            
            toast.info("Restored draft from local storage")
        }
      } catch (e) {
        console.error("Failed to parse draft", e)
      }
    }
  }, [storageKey, initialContent, initialPost]) // Run once on mount (and when key changes)

  // Save to local storage on change
  useEffect(() => {
    const data = {
      content: markdown,
      excerpt,
      coverImage,
      tags,
      showInList,
      lastSaved: new Date().toISOString()
    }
    localStorage.setItem(storageKey, JSON.stringify(data))
  }, [markdown, excerpt, coverImage, tags, showInList, storageKey])

  // Clear local storage on successful publish
  const clearDraft = () => {
    localStorage.removeItem(storageKey)
  }
  
  const router = useRouter()

  const initialTitle = initialPost?.title || ""

  const uploadImage = async (file: File): Promise<string | null> => {
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      toast.error("请选择图片文件")
      return null
    }

    // 验证文件大小 (5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error("图片大小不能超过 5MB")
      return null
    }

    const formData = new FormData()
    formData.append("file", file)

    const loadingToast = toast.loading(`正在上传 ${file.name}...`, {
      description: `文件大小: ${(file.size / 1024 / 1024).toFixed(2)}MB`
    })

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
      
      if (!res.ok) {
        throw new Error(`上传失败: ${res.status}`)
      }
      
      const data = await res.json()

      if (data.url) {
        toast.success("图片上传成功", {
          description: file.name
        })
        return data.url
      } else {
        throw new Error(data.error || "上传失败")
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("图片上传失败", {
        description: error instanceof Error ? error.message : "请检查网络连接"
      })
      return null
    } finally {
      toast.dismiss(loadingToast)
    }
  }

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleExportMarkdown = () => {
    const filename = `${slug || "untitled"}.md`
    downloadFile(markdown, filename, "text/markdown")
    toast.success("Exported to Markdown")
  }

  const handleExportHTML = () => {
    try {
      const htmlContent = markdownToHtml(markdown)
      const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${extractedTitle || "Untitled"}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.6; color: #333; }
    img { max-width: 100%; height: auto; }
    pre { background: #f4f4f4; padding: 1rem; border-radius: 4px; overflow-x: auto; }
    code { font-family: monospace; background: #f4f4f4; padding: 0.2rem 0.4rem; border-radius: 3px; font-size: 0.9em; }
    blockquote { border-left: 4px solid #ccc; margin: 0; padding-left: 1rem; color: #666; }
    table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
    h1, h2, h3, h4, h5, h6 { margin-top: 2rem; margin-bottom: 1rem; }
    a { color: #0066cc; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>`
      const filename = `${slug || "untitled"}.html`
      downloadFile(fullHtml, filename, "text/html")
      toast.success("Exported to HTML")
    } catch (error) {
      console.error("Export HTML error:", error)
      toast.error("Failed to export HTML")
    }
  }

  const handleSaveDraft = async () => {
    const title = extractedTitle || initialTitle || "Untitled"
    // Generate slug if missing
    let currentSlug = slug
    if (!currentSlug) {
      // If title is "Untitled" or empty, always use timestamp to avoid conflicts
      if (!title || title === "Untitled") {
        currentSlug = `untitled-${Date.now()}`
      } else {
        currentSlug = title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "")
        
        if (!currentSlug) {
          currentSlug = `draft-${Date.now()}`
        }
      }
      setSlug(currentSlug)
    }

    setIsSaving(true)

    try {
      await savePostAction({
        slug: currentSlug,
        title: title,
        content: markdown,
        excerpt: excerpt,
        coverImage: coverImage,
        showInList: showInList,
        tags: tags,
        published: false,
        createdAt: initialPost?.createdAt || new Date().toISOString(),
      })

      toast.success("Saved to draft")
      
      // If it's a new post, update the URL
      if (!initialPost) {
        router.replace(`/admin/posts/${currentSlug}`)
      }
      router.refresh()
    } catch (e) {
      toast.error("Failed to save draft")
      console.error(e)
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublish = async (data: { slug: string; title: string }) => {
    setIsSaving(true)

    try {
      await savePostAction({
        slug: data.slug,
        title: data.title,
        content: markdown,
        excerpt: excerpt,
        coverImage: coverImage,
        showInList: showInList,
        tags: tags,
        published: true,
        createdAt: initialPost?.createdAt || new Date().toISOString(),
      })

      toast.success("Post published!")
      clearDraft() // Clear local storage
      setIsPublishModalOpen(false)
      router.refresh()
      
      // Redirect to post list
      router.push("/admin")
    } catch (e) {
      toast.error("Failed to save post")
      console.error(e)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 border-b bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-muted-foreground hover:text-foreground px-2 sm:px-4">
            <ArrowLeft className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <Link href="/guide" target="_blank">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground px-2 sm:px-4">
              <BookOpen className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Guide</span>
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <span className="text-sm text-muted-foreground hidden md:inline-block">
            {isSaving ? "Saving..." : "Saved locally"}
          </span>
          
          <Button variant="ghost" size="sm" onClick={handleSaveDraft} disabled={isSaving} className="px-2 sm:px-4">
            <Save className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Save Draft</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="px-2 sm:px-4">
                <Download className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportMarkdown}>
                Export Markdown
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportHTML}>
                Export HTML
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={() => setIsPublishModalOpen(true)} disabled={isSaving} size="sm">
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Publish
          </Button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        <Suspense fallback={<EditorSkeleton />}>
          <TiptapEditor
            content={markdown}
            onChange={setMarkdown}
            onImageUpload={uploadImage}
            className={getEditorClassName(contentConfig)}
          />
        </Suspense>
      </div>

      {/* Publish Modal */}
      <PublishModal
        open={isPublishModalOpen}
        onOpenChange={setIsPublishModalOpen}
        onPublish={handlePublish}
        initialSlug={slug}
        initialTitle={extractedTitle || initialTitle || "Untitled"}
        isSaving={isSaving}
        excerpt={excerpt}
        setExcerpt={setExcerpt}
        coverImage={coverImage}
        setCoverImage={setCoverImage}
        showInList={showInList}
        setShowInList={setShowInList}
        tags={tags}
        setTags={setTags}
        content={markdown}
      />
    </div>
  )
}
