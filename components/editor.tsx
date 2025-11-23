"use client"

import { useState, useRef, useEffect, useMemo } from "react"
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
import { ArrowLeft, Loader2, Eye, EyeOff, Download, BookOpen } from "lucide-react"
import { PublishModal } from "./editor/publish-modal"
import { format } from "date-fns"
import { marked } from "marked"
import { PostArticle } from "@/components/post/article"
import type { Post } from "@/types"
import { ThemeToggle } from "@/components/theme-toggle"
import { useIsMobile } from "@/hooks/use-mobile"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

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
}

export function Editor({ initialPost, newSlug }: EditorProps) {
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
  const [showPreview, setShowPreview] = useState(true)
  const isMobile = useIsMobile()
  const [mobileTab, setMobileTab] = useState<"editor" | "preview">("editor")
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const textareaSingleRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()

  const fallbackCreatedAtRef = useRef(initialPost?.createdAt ?? new Date().toISOString())
  const initialTitle = initialPost?.title || ""
  const initialPublished = initialPost?.published ?? false

  const derivedTitle = useMemo(() => extractTitle(markdown) || initialTitle || "Untitled", [markdown, initialTitle])

  const previewPost = useMemo<Post>(
    () => ({
      slug: slug || newSlug || "preview",
      title: derivedTitle,
      content: markdown || "",
      createdAt: fallbackCreatedAtRef.current,
      published: initialPublished,
    }),
    [slug, newSlug, derivedTitle, markdown, initialPublished],
  )

  // Adjust textarea height
  const adjustTextareaHeight = (textarea: HTMLTextAreaElement | null) => {
    if (textarea) {
      textarea.style.height = 'auto'
      const newHeight = Math.max(textarea.scrollHeight, 500)
      textarea.style.height = `${newHeight}px`
    }
  }

  // Auto-resize textarea based on content
  useEffect(() => {
    adjustTextareaHeight(textareaRef.current)
    adjustTextareaHeight(textareaSingleRef.current)
  }, [markdown])
  
  // Initial height adjustment on mount
  useEffect(() => {
    adjustTextareaHeight(textareaRef.current)
    adjustTextareaHeight(textareaSingleRef.current)
  }, [])

  // Handle textarea input with auto-resize
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    adjustTextareaHeight(e.target)
    setMarkdown(e.target.value)
  }

  // Ref callback to set initial height when textarea mounts
  const textareaRefCallback = (element: HTMLTextAreaElement | null) => {
    textareaRef.current = element
    adjustTextareaHeight(element)
  }

  const textareaSingleRefCallback = (element: HTMLTextAreaElement | null) => {
    textareaSingleRef.current = element
    adjustTextareaHeight(element)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)

    const loadingToast = toast.loading("Uploading image...")

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()

      if (data.url) {
        const imageMarkdown = `![Image](${data.url})`
        setMarkdown((prev) => prev + "\n" + imageMarkdown)
        toast.success("Image uploaded")
      } else {
        toast.error("Upload failed")
      }
    } catch (error) {
      toast.error("Error uploading image")
    } finally {
      toast.dismiss(loadingToast)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
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

  const handleExportHTML = async () => {
    try {
      const htmlContent = await marked.parse(markdown)
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
      setIsPublishModalOpen(false)
      router.refresh()
      
      if (!initialPost) {
        router.push(`/admin/posts/${data.slug}`)
      }
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

          {!isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className={showPreview ? "bg-muted" : ""}
            >
              {showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showPreview ? "Hide Preview" : "Show Preview"}
            </Button>
          )}
          <Button onClick={() => setIsPublishModalOpen(true)} disabled={isSaving} size="sm">
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Publish
          </Button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col">
        {isMobile ? (
          <Tabs value={mobileTab} onValueChange={(v) => setMobileTab(v as "editor" | "preview")} className="flex-1 flex flex-col">
            <div className="px-4 py-2 border-b bg-muted/30">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="editor">Editor</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="editor" className="flex-1 mt-0 p-0">
              <div className="px-4 py-6">
                <textarea
                  ref={textareaRefCallback}
                  className="w-full p-0 font-mono text-sm bg-transparent border-none focus:outline-none resize-none"
                  value={markdown}
                  onChange={handleTextareaChange}
                  placeholder="# Your Title\n\nStart writing your markdown content here..."
                  style={{ minHeight: 'calc(100vh - 200px)' }}
                />
              </div>
            </TabsContent>
            <TabsContent value="preview" className="flex-1 mt-0 p-0 bg-muted/10">
              <div className="px-4 py-6 overflow-y-auto h-full">
                <PostArticle post={previewPost} variant="embedded" showHeader={false} showFooter={false} />
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          showPreview ? (
            <div className="flex gap-4 h-full">
              {/* Left: Editor */}
              <div className="flex-1 px-4 py-12 overflow-y-auto">
                <div style={{ maxWidth: 'var(--container-3xl)' }} className="mx-auto">
                  <textarea
                    ref={textareaRefCallback}
                    className="w-full p-4 font-mono text-sm bg-transparent border-none focus:outline-none resize-none"
                    value={markdown}
                    onChange={handleTextareaChange}
                    placeholder="# Your Title\n\nStart writing your markdown content here..."
                  />
                </div>
              </div>
              
              {/* Divider */}
              <div className="w-px bg-border" />
              
              {/* Right: Preview */}
              <div className="flex-1 bg-muted/10 px-4 py-12 overflow-y-auto">
                <div style={{ maxWidth: 'var(--container-3xl)' }} className="mx-auto">
                  <PostArticle post={previewPost} variant="embedded" showHeader={false} showFooter={false} />
                </div>
              </div>
            </div>
          ) : (
            <div className="px-4 py-12">
              <div className="max-w-3xl mx-auto">
                <textarea
                  ref={textareaSingleRefCallback}
                  className="w-full p-4 font-mono text-sm bg-transparent border-none focus:outline-none resize-none"
                  value={markdown}
                  onChange={handleTextareaChange}
                  placeholder="# Your Title\n\nStart writing your markdown content here..."
                />
              </div>
            </div>
          )
        )}
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleImageUpload}
      />

      {/* Publish Modal */}
      <PublishModal
        open={isPublishModalOpen}
        onOpenChange={setIsPublishModalOpen}
        onPublish={handlePublish}
        initialSlug={slug}
        initialTitle={extractedTitle || "Untitled"}
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
