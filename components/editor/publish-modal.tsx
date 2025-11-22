"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

interface PublishModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPublish: (data: { slug: string; title: string }) => Promise<void>
  initialSlug: string
  initialTitle: string
  isSaving: boolean
}

// 将标题转换为 URL 友好的 slug
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // 替换空格为连字符
    .replace(/\s+/g, '-')
    // 移除特殊字符
    .replace(/[^\w\u4e00-\u9fa5-]+/g, '-')
    // 移除多余的连字符
    .replace(/-+/g, '-')
    // 移除首尾的连字符
    .replace(/^-+|-+$/g, '')
}

export function PublishModal({
  open,
  onOpenChange,
  onPublish,
  initialSlug,
  initialTitle,
  isSaving,
}: PublishModalProps) {
  const [slug, setSlug] = useState(initialSlug)
  const [title, setTitle] = useState(initialTitle)

  // 当标题改变时，自动更新 slug（仅在 slug 为空或与之前的标题匹配时）
  useEffect(() => {
    if (title && !initialSlug) {
      setSlug(slugify(title))
    }
  }, [title, initialSlug])

  const handlePublish = async () => {
    // 规范化 slug
    const normalizedSlug = slugify(slug || title)
    await onPublish({ slug: normalizedSlug, title })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Publish Article</DialogTitle>
          <DialogDescription>
            Review your article settings before publishing.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="slug" className="text-right">
              Slug
            </Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="col-span-3 font-mono text-xs"
            />
            <div className="col-start-2 col-span-3 text-[10px] text-muted-foreground">
              URL 路径标识，只能包含字母、数字和连字符（例如：my-first-post）
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handlePublish} disabled={isSaving}>
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Publish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
