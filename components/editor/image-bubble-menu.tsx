"use client"

import { useState, useCallback, useEffect } from "react"
import { BubbleMenu } from "@tiptap/react/menus"
import { Editor } from "@tiptap/react"
import { NodeSelection } from "@tiptap/pm/state"
import { 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Trash2, 
  Edit3, 
  Download,
  ZoomIn,
  ZoomOut
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface ImageBubbleMenuProps {
  editor: Editor
}

export function ImageBubbleMenu({ editor }: ImageBubbleMenuProps) {
  const [altText, setAltText] = useState("")
  const [isEditingAlt, setIsEditingAlt] = useState(false)

  const shouldShow = useCallback(({ editor }: { editor: Editor }) => {
    return editor.isActive("image")
  }, [])

  useEffect(() => {
    if (editor && editor.isActive("image")) {
      const currentAlt = editor.getAttributes("image").alt || ""
      setAltText(currentAlt)
    }
  }, [editor])

  const getCurrentAlignment = useCallback(() => {
    if (!editor.isActive("image")) return "center"
    const attrs = editor.getAttributes("image")
    return attrs["data-align"] || "center"
  }, [editor])

  const isAlignmentActive = useCallback((alignment: "left" | "center" | "right") => {
    return getCurrentAlignment() === alignment
  }, [getCurrentAlignment])

  const updateImageAlt = useCallback(() => {
    const currentAlt = editor.getAttributes("image").alt || ""
    setAltText(currentAlt)
    setIsEditingAlt(true)
  }, [editor])

  const saveAltText = useCallback(() => {
    editor.chain().focus().updateAttributes("image", { alt: altText }).run()
    setIsEditingAlt(false)
  }, [editor, altText])

  const deleteImage = useCallback(() => {
    editor.chain().focus().deleteSelection().run()
  }, [editor])

  const downloadImage = useCallback(() => {
    const { src } = editor.getAttributes("image")
    if (src) {
      const link = document.createElement("a")
      link.href = src
      link.download = "image"
      link.target = "_blank"
      link.rel = "noopener noreferrer"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }, [editor])

  const alignImage = useCallback((alignment: "left" | "center" | "right") => {
    return editor.chain().focus().command(({ tr, state }) => {
      const { selection } = state
      
      if (!(selection instanceof NodeSelection) || selection.node.type.name !== "image") {
        return false
      }
      
      const imagePos = selection.from
      const imageNode = selection.node
      
      // 使用 data-align 属性而不是 style，避免浮动导致的图文混排
      tr.setNodeMarkup(imagePos, undefined, {
        ...imageNode.attrs,
        "data-align": alignment,
        // 清除可能存在的浮动样式
        style: (imageNode.attrs.style as string || "")
          .replace(/float:\s*[^;]+;?/g, "")
          .replace(/margin:\s*[^;]+;?/g, "")
          .replace(/display:\s*[^;]+;?/g, "")
          .replace(/\s+/g, " ")
          .trim()
      })
      
      return true
    }).run()
  }, [editor])

  const resizeImage = useCallback((scale: number) => {
    const currentAttrs = editor.getAttributes("image")
    
    // Get current width from attributes or style
    let currentWidth = currentAttrs.width
    
    if (!currentWidth && currentAttrs.style) {
      const styleMatch = currentAttrs.style.match(/width:\s*(\d+)px/)
      if (styleMatch) {
        currentWidth = parseInt(styleMatch[1], 10)
      }
    }
    
    // Default width if none specified
    if (!currentWidth) {
      currentWidth = 400
    }
    
    // Ensure currentWidth is a number
    currentWidth = parseInt(currentWidth.toString(), 10)
    
    // Calculate new width with bounds
    const newWidth = Math.max(100, Math.min(800, Math.round(currentWidth * scale)))
    
    // Update image attributes
    return editor.chain().focus().updateAttributes("image", { 
      width: newWidth,
      style: `width: ${newWidth}px; height: auto;`
    }).run()
  }, [editor])

  if (!editor) {
    return null
  }

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={shouldShow}
      className="flex items-center gap-1 rounded-lg border bg-background p-1 shadow-md"
      updateDelay={100}
    >
      {/* Alignment options */}
      <Button
        variant={isAlignmentActive("left") ? "default" : "ghost"}
        size="sm"
        onClick={() => alignImage("left")}
        className="p-2 h-8 w-8"
        title="Align left"
      >
        <AlignLeft className="h-4 w-4" />
      </Button>
      
      <Button
        variant={isAlignmentActive("center") ? "default" : "ghost"}
        size="sm"
        onClick={() => alignImage("center")}
        className="p-2 h-8 w-8"
        title="Align center"
      >
        <AlignCenter className="h-4 w-4" />
      </Button>
      
      <Button
        variant={isAlignmentActive("right") ? "default" : "ghost"}
        size="sm"
        onClick={() => alignImage("right")}
        className="p-2 h-8 w-8"
        title="Align right"
      >
        <AlignRight className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Size adjustment */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => resizeImage(0.8)}
        className="p-2 h-8 w-8"
        title="Make smaller"
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => resizeImage(1.25)}
        className="p-2 h-8 w-8"
        title="Make larger"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Alt text editing */}
      <Popover open={isEditingAlt} onOpenChange={setIsEditingAlt}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={updateImageAlt}
            className="p-2 h-8 w-8"
            title="Edit alt text"
          >
            <Edit3 className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-2">
            <Label htmlFor="alt-text">Alt text</Label>
            <Input
              id="alt-text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Describe this image..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  saveAltText()
                } else if (e.key === "Escape") {
                  setIsEditingAlt(false)
                }
              }}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={saveAltText}>
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsEditingAlt(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Download image */}
      <Button
        variant="ghost"
        size="sm"
        onClick={downloadImage}
        className="p-2 h-8 w-8"
        title="Download image"
      >
        <Download className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Delete image */}
      <Button
        variant="ghost"
        size="sm"
        onClick={deleteImage}
        className="p-2 h-8 w-8 text-destructive hover:text-destructive"
        title="Delete image"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </BubbleMenu>
  )
}