"use client"

import { FloatingMenu } from "@tiptap/react/menus"
import { Editor } from "@tiptap/react"
import { Heading1, Heading2, List, Image as ImageIcon, Quote } from "lucide-react"
import { cn } from "@/lib/utils"

interface FloatingMenuProps {
  editor: Editor
  onImageUpload: () => void
}

export function EditorFloatingMenu({ editor, onImageUpload }: FloatingMenuProps) {
  if (!editor) {
    return null
  }

  return (
    <FloatingMenu
      editor={editor}
      className="flex items-center gap-1 rounded-lg border bg-background p-1 shadow-md"
    >
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={cn(
          "p-2 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors",
          editor.isActive("heading", { level: 1 }) && "bg-muted text-foreground",
        )}
      >
        <Heading1 className="h-4 w-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={cn(
          "p-2 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors",
          editor.isActive("heading", { level: 2 }) && "bg-muted text-foreground",
        )}
      >
        <Heading2 className="h-4 w-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn(
          "p-2 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors",
          editor.isActive("bulletList") && "bg-muted text-foreground",
        )}
      >
        <List className="h-4 w-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={cn(
          "p-2 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors",
          editor.isActive("blockquote") && "bg-muted text-foreground",
        )}
      >
        <Quote className="h-4 w-4" />
      </button>
      <button
        onClick={onImageUpload}
        className="p-2 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
      >
        <ImageIcon className="h-4 w-4" />
      </button>
    </FloatingMenu>
  )
}
