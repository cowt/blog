"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"
import { Table } from "@tiptap/extension-table"
import TableRow from "@tiptap/extension-table-row"
import TableCell from "@tiptap/extension-table-cell"
import TableHeader from "@tiptap/extension-table-header"
import TaskList from "@tiptap/extension-task-list"
import Superscript from "@tiptap/extension-superscript"
import Subscript from "@tiptap/extension-subscript"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import { common, createLowlight } from "lowlight"
import { CustomTaskItem } from "./extensions/task-item"
import { Details, DetailsSummary } from "./extensions/details"
import { TextIndent } from "./extensions/text-indent"
import { ImageUpload } from "./extensions/image-upload"
import { EnhancedImage } from "./extensions/enhanced-image"
import { MarkdownPaste } from "./extensions/markdown-paste"
import { FootnoteRef, FootnoteList, FootnoteItem } from "./extensions/footnote"
import { FootnoteSync } from "./extensions/footnote-sync"
import { MathInline } from "./extensions/math"
import { MathBlock } from "./extensions/math-block"
import { Mermaid } from "./extensions/mermaid"
import { CodeBlockView } from "./extensions/code-block-lowlight-view"
import { ReactNodeViewRenderer } from "@tiptap/react"
import { EditorBubbleMenu } from "./bubble-menu"
import { ImageBubbleMenu } from "./image-bubble-menu"
import { TableMenu } from "./table-menu"
import { Toolbar } from "./toolbar"
import { useEffect, useState, useCallback } from "react"
import { tiptapToMarkdown } from "@/lib/tiptap-markdown"
import { markdownToTiptap } from "@/lib/markdown-to-tiptap"
import { getEditorClassName, defaultContentConfig } from "@/lib/content-styles"

const lowlight = createLowlight(common)

interface TiptapEditorProps {
  content: string
  onChange: (content: string) => void
  onImageUpload: (file: File) => Promise<string | null>
  className?: string
}

export function TiptapEditor({ content, onChange, onImageUpload, className }: TiptapEditorProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [initialContent, setInitialContent] = useState<string | null>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: false, // 使用 CodeBlockLowlight 替代
        link: false,
      }),
      CodeBlockLowlight.extend({
        addNodeView() {
          return ReactNodeViewRenderer(CodeBlockView)
        },
        addKeyboardShortcuts() {
          return {
            "Mod-Alt-c": () => this.editor.commands.toggleCodeBlock(),
          }
        },
      }).configure({
        lowlight,
        defaultLanguage: "plaintext",
      }),
      EnhancedImage.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: "block mx-auto rounded-lg border border-border max-w-full h-auto my-4",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-primary underline underline-offset-4" },
      }),
      Placeholder.configure({ placeholder: "Start writing..." }),
      Table.extend({
        addKeyboardShortcuts() {
          return {
            "Mod-Alt-t": () => this.editor.commands.insertTable({ rows: 3, cols: 3, withHeaderRow: true }),
          }
        },
      }).configure({
        resizable: true,
        handleWidth: 4,
        cellMinWidth: 80,
        lastColumnResizable: true,
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: { class: "relative" },
      }),
      TableCell.configure({
        HTMLAttributes: { class: "relative" },
      }),
      TaskList.extend({
        addKeyboardShortcuts() {
          return {
            "Mod-Shift-l": () => this.editor.commands.toggleTaskList(),
            "Tab": () => {
              if (this.editor.isActive("taskItem")) {
                return this.editor.commands.sinkListItem("taskItem")
              }
              return false
            },
            "Shift-Tab": () => {
              if (this.editor.isActive("taskItem")) {
                return this.editor.commands.liftListItem("taskItem")
              }
              return false
            },
          }
        },
      }),
      CustomTaskItem.extend({
        addKeyboardShortcuts() {
          return {
            "Mod-Enter": () => {
              if (this.editor.isActive("taskItem")) {
                return this.editor.commands.toggleTask()
              }
              return false
            },
          }
        },
      }).configure({
        nested: true,
      }),
      Superscript,
      Subscript,
      Details,
      DetailsSummary,
      TextIndent,
      ImageUpload.configure({
        onImageUpload,
        accept: "image/*",
        maxSize: 5 * 1024 * 1024,
        multiple: false,
      }),
      MarkdownPaste,
      FootnoteRef,
      FootnoteList,
      FootnoteItem,
      FootnoteSync,
      MathInline,
      MathBlock,
      Mermaid,
    ],
    editorProps: {
      attributes: {
        class: `${className || getEditorClassName(defaultContentConfig)} px-4 py-4`,
      },
    },
    onUpdate: ({ editor }) => {
      const markdown = tiptapToMarkdown(editor.state.doc)
      onChange(markdown)
    },
    immediatelyRender: false,
  })

  useEffect(() => {
    if (!editor) return

    if (!isMounted && content && content !== initialContent) {
      const doc = markdownToTiptap(content)
      editor.commands.setContent(doc)
      setInitialContent(content)
      setIsMounted(true)
    } else if (!isMounted && !content) {
      setIsMounted(true)
    }
  }, [content, editor, isMounted, initialContent])

  const handleFootnoteClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement

    const footnoteRef = target.closest("[data-footnote-id]") as HTMLElement
    if (footnoteRef) {
      const id = footnoteRef.getAttribute("data-footnote-id")
      const footnoteItem = document.getElementById(`fn-${id}`)
      footnoteItem?.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }

    const backref = target.closest("[data-footnote-backref]") as HTMLElement
    if (backref) {
      const id = backref.getAttribute("data-footnote-backref")
      const refElement = document.getElementById(`fnref-${id}`)
      refElement?.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [])

  useEffect(() => {
    document.addEventListener("click", handleFootnoteClick)
    return () => document.removeEventListener("click", handleFootnoteClick)
  }, [handleFootnoteClick])

  if (!editor) return null

  return (
    <div className="flex flex-col w-full bg-background">
      <Toolbar editor={editor} />
      <div className="relative flex-1 w-full max-w-4xl mx-auto overflow-hidden">
        <EditorBubbleMenu editor={editor} />
        <ImageBubbleMenu editor={editor} />
        <TableMenu editor={editor} />
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
