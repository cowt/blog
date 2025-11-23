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
import { Textarea } from "@/components/ui/textarea"
import { useState, useEffect } from "react"
import { Loader2, Sparkles, Image as ImageIcon, X, Tag as TagIcon } from "lucide-react"
import { generateExcerptAction, generateCoverImageAction, generateTagsAction } from "@/app/actions"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"

interface PublishModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPublish: (data: { slug: string; title: string }) => Promise<void>
  initialSlug: string
  initialTitle: string
  isSaving: boolean
  excerpt: string
  setExcerpt: (excerpt: string) => void
  coverImage: string
  setCoverImage: (coverImage: string) => void
  showInList: boolean
  setShowInList: (showInList: boolean) => void
  tags: string[]
  setTags: (tags: string[]) => void
  content: string
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
  excerpt,
  setExcerpt,
  coverImage,
  setCoverImage,
  showInList,
  setShowInList,
  tags,
  setTags,
  content,
}: PublishModalProps) {
  const [slug, setSlug] = useState(initialSlug)
  const [title, setTitle] = useState(initialTitle)
  const [isGeneratingExcerpt, setIsGeneratingExcerpt] = useState(false)
  const [isGeneratingCover, setIsGeneratingCover] = useState(false)
  const [isGeneratingTags, setIsGeneratingTags] = useState(false)
  const [suggestedTags, setSuggestedTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")

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

  const handleGenerateExcerpt = async () => {
    if (!content) {
      toast.error("Please write some content first")
      return
    }
    setIsGeneratingExcerpt(true)
    try {
      const result = await generateExcerptAction(content)
      if (result.excerpt) {
        setExcerpt(result.excerpt)
        toast.success("Excerpt generated!")
      } else {
        toast.error("Failed to generate excerpt")
      }
    } catch (error) {
      toast.error("Error generating excerpt")
      console.error(error)
    } finally {
      setIsGeneratingExcerpt(false)
    }
  }

  const handleGenerateCover = async () => {
    if (!title) {
      toast.error("Please enter a title first")
      return
    }
    setIsGeneratingCover(true)
    try {
      const result = await generateCoverImageAction(title)
      if (result.url) {
        setCoverImage(result.url)
        toast.success("Cover image generated!")
      } else {
        toast.error("Failed to generate cover image")
      }
    } catch (error) {
      toast.error("Error generating cover image")
      console.error(error)
    } finally {
      setIsGeneratingCover(false)
    }
  }

  const handleGenerateTags = async () => {
    if (!content) {
      toast.error("Please write some content first")
      return
    }
    setIsGeneratingTags(true)
    try {
      const result = await generateTagsAction(content)
      if (result.tags && result.tags.length > 0) {
        setSuggestedTags(result.tags)
        toast.success("Tags generated!")
      } else {
        toast.error("Failed to generate tags")
      }
    } catch (error) {
      toast.error("Error generating tags")
      console.error(error)
    } finally {
      setIsGeneratingTags(false)
    }
  }

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim()
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag])
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault()
      addTag(tagInput)
      setTagInput("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Publish Article</DialogTitle>
          <DialogDescription>
            Review your article settings before publishing.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          {/* Title & Slug */}
          <div className="grid gap-4">
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
              <div className="col-span-3 space-y-1">
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="font-mono text-xs"
                />
                <div className="text-[10px] text-muted-foreground">
                  URL-friendly identifier (e.g., my-first-post)
                </div>
              </div>
            </div>
          </div>

          <div className="border-t" />

          {/* Excerpt */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateExcerpt}
                disabled={isGeneratingExcerpt || !content}
                className="h-7 text-xs"
              >
                {isGeneratingExcerpt ? (
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3 mr-1" />
                )}
                Generate Summary
              </Button>
            </div>
            <Textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Article summary for SEO and previews..."
              className="h-24 resize-none"
            />
          </div>

          {/* Cover Image */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="coverImage">Cover Image URL</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateCover}
                disabled={isGeneratingCover || !title}
                className="h-7 text-xs"
              >
                {isGeneratingCover ? (
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  <ImageIcon className="w-3 h-3 mr-1" />
                )}
                Generate Cover
              </Button>
            </div>
            <Input
              id="coverImage"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://..."
            />
            {coverImage && (
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted mt-2">
                <img
                  src={coverImage}
                  alt="Cover preview"
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              </div>
            )}
          </div>

          <div className="border-t" />

          {/* Show in List Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="showInList">Show in List</Label>
              <div className="text-xs text-muted-foreground">
                Display this article in the home page list
              </div>
            </div>
            <Switch
              id="showInList"
              checked={showInList}
              onCheckedChange={setShowInList}
            />
          </div>

          {/* Tags */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label>Tags</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateTags}
                disabled={isGeneratingTags || !content}
                className="h-7 text-xs"
              >
                {isGeneratingTags ? (
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  <TagIcon className="w-3 h-3 mr-1" />
                )}
                Generate Tags
              </Button>
            </div>
            
            {/* Selected Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Suggested Tags */}
            {suggestedTags.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Suggested tags (click to add):</div>
                <div className="flex flex-wrap gap-2">
                  {suggestedTags
                    .filter((tag) => !tags.includes(tag))
                    .map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="cursor-pointer hover:bg-accent"
                        onClick={() => addTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                </div>
              </div>
            )}

            {/* Manual Tag Input */}
            <Input
              placeholder="Type a tag and press Enter"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagInputKeyDown}
              className="text-sm"
            />
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
