"use client"

import { BubbleMenu } from "@tiptap/react/menus"
import { Editor } from "@tiptap/react"
import { Bold, Italic, Strikethrough, Code, Link as LinkIcon, Superscript, Subscript } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useCallback } from "react"

interface MenuBarProps {
  editor: Editor
}

export function EditorBubbleMenu({ editor }: MenuBarProps) {
  const [isLinkOpen, setIsLinkOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes("link").href
    const url = window.prompt("URL", previousUrl)

    // cancelled
    if (url === null) {
      return
    }

    // empty
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }

    // update
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }, [editor])

  if (!editor) {
    return null
  }

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={({ editor, state, from, to }) => {
        const { selection } = state
        const { empty } = selection
        
        // 不显示如果：
        // 1. 没有选中文本（空选择）
        // 2. 在图片上
        // 3. 在代码块中
        // 4. 选择范围无效
        if (empty || from === to || editor.isActive("image") || editor.isActive("codeBlock")) {
          return false
        }
        
        // 只在有有效文本选择时显示
        return true
      }}
      className="flex items-center gap-1 rounded-lg border bg-background p-1 shadow-md"
    >
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={cn(
          "p-2 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors",
          editor.isActive("bold") && "bg-muted text-foreground",
        )}
      >
        <Bold className="h-4 w-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={cn(
          "p-2 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors",
          editor.isActive("italic") && "bg-muted text-foreground",
        )}
      >
        <Italic className="h-4 w-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={cn(
          "p-2 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors",
          editor.isActive("strike") && "bg-muted text-foreground",
        )}
      >
        <Strikethrough className="h-4 w-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={cn(
          "p-2 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors",
          editor.isActive("code") && "bg-muted text-foreground",
        )}
      >
        <Code className="h-4 w-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleSuperscript().run()}
        className={cn(
          "p-2 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors",
          editor.isActive("superscript") && "bg-muted text-foreground",
        )}
        title="上标"
      >
        <Superscript className="h-4 w-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleSubscript().run()}
        className={cn(
          "p-2 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors",
          editor.isActive("subscript") && "bg-muted text-foreground",
        )}
        title="下标"
      >
        <Subscript className="h-4 w-4" />
      </button>
      <button
        onClick={setLink}
        className={cn(
          "p-2 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors",
          editor.isActive("link") && "bg-muted text-foreground",
        )}
      >
        <LinkIcon className="h-4 w-4" />
      </button>
    </BubbleMenu>
  )
}
