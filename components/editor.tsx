"use client"

import { useState, useRef, useEffect } from "react"
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
import { ArrowLeft, Loader2, Eye, EyeOff, Download } from "lucide-react"
import { PublishModal } from "./editor/publish-modal"
import { format } from "date-fns"
import { marked } from "marked"
import { MarkdownRenderer } from "@/components/markdown"

interface EditorProps {
  initialPost?: {
    slug: string
    title: string
    content: string
    published: boolean
    createdAt: string
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
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false)
  const [showPreview, setShowPreview] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const textareaSingleRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()

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
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground hidden sm:inline-block">
            {isSaving ? "Saving..." : "Saved locally"}
          </span>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
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

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className={showPreview ? "bg-muted" : ""}
          >
            {showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {showPreview ? "Hide Preview" : "Show Preview"}
          </Button>
          <Button onClick={() => setIsPublishModalOpen(true)} disabled={isSaving}>
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Publish
          </Button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1">
        {showPreview ? (
          <div className="flex gap-4">
            {/* Left: Editor */}
            <div className="flex-1 px-4 py-12">
              <div style={{ maxWidth: 'var(--container-3xl)' }} className="mx-auto">
                <textarea
                  ref={textareaRefCallback}
                  className="w-full p-4 font-mono text-sm bg-transparent border-none focus:outline-none resize-none"
                  value={markdown}
                  onChange={handleTextareaChange}
                  placeholder="# Your Title

Start writing your markdown content here..."
                />
              </div>
            </div>
            
            {/* Divider */}
            <div className="w-px bg-border" />
            
            {/* Right: Preview */}
            <div className="flex-1 bg-muted/10 px-4 py-12">
              <article style={{ maxWidth: 'var(--container-3xl)' }} className="mx-auto">
                <MarkdownRenderer>{markdown}</MarkdownRenderer>
              </article>
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
                placeholder="# Your Title

Start writing your markdown content here..."
              />
            </div>
          </div>
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
      />
    </div>
  )
}
