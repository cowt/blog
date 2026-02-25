"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { EnhancedImage } from "./editor/extensions/enhanced-image"
import Link from "@tiptap/extension-link"
import { Table } from "@tiptap/extension-table"
import TableRow from "@tiptap/extension-table-row"
import TableCell from "@tiptap/extension-table-cell"
import TableHeader from "@tiptap/extension-table-header"
import TaskList from "@tiptap/extension-task-list"
import Superscript from "@tiptap/extension-superscript"
import Subscript from "@tiptap/extension-subscript"
import { CustomTaskItem } from "./editor/extensions/task-item"
import { DetailsReadonly, DetailsSummaryReadonly } from "./editor/extensions/details-readonly"
import { MathInline } from "./editor/extensions/math"
import { MathBlockReadonly } from "./editor/extensions/math-block-readonly"
import { MermaidReadonly } from "./editor/extensions/mermaid-readonly"
import { FootnoteRef, FootnoteList, FootnoteItem } from "./editor/extensions/footnote"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import { common, createLowlight } from "lowlight"
import { ReactNodeViewRenderer } from "@tiptap/react"
import { CodeBlockReadonlyView } from "./editor/extensions/code-block-readonly-view"
import "katex/dist/katex.min.css"

// 创建 lowlight 实例
const lowlight = createLowlight(common)
import { useEffect, useCallback, useMemo, useState } from "react"
import { markdownToTiptap } from "@/lib/markdown-to-tiptap"
import { getArticleClassName, defaultContentConfig } from "@/lib/content-styles"

interface ContentRendererProps {
  content: string
  className?: string
  compact?: boolean
}

/**
 * 紧凑模式：直接渲染纯文本，用于摘要等场景
 */
function CompactRenderer({ content }: { content: string }) {
  const plainText = content
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/~~([^~]+)~~/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/^>\s*/gm, '')
    .replace(/\n+/g, ' ')
    .trim()
  return <>{plainText}</>
}

// 静态扩展配置，避免每次渲染重新创建
const createExtensions = () => [
  StarterKit.configure({
    heading: { levels: [1, 2, 3] },
    codeBlock: false,
    // 禁用 StarterKit 自带的 link，使用自定义配置
    link: false,
  }),
  CodeBlockLowlight.extend({
    addNodeView() {
      return ReactNodeViewRenderer(CodeBlockReadonlyView)
    },
  }).configure({
    lowlight,
    defaultLanguage: "plaintext",
  }),
  EnhancedImage.configure({
    inline: false,
    allowBase64: true,
    HTMLAttributes: { class: "rounded-lg border border-border" },
  }),
  Link.configure({
    openOnClick: true,
    HTMLAttributes: {
      class: "text-primary underline underline-offset-4",
      target: "_blank",
      rel: "noopener noreferrer",
    },
  }),
  Table.configure({
    resizable: false,
  }),
  TableRow,
  TableHeader,
  TableCell,
  TaskList,
  CustomTaskItem.configure({ nested: true }),
  Superscript,
  Subscript,
  DetailsReadonly,
  DetailsSummaryReadonly,
  MathInline,
  MathBlockReadonly,
  MermaidReadonly,
  FootnoteRef,
  FootnoteList,
  FootnoteItem,
]

/**
 * 完整内容渲染组件
 */
function FullRenderer({ content, className }: { content: string; className?: string }) {
  // 确保只在客户端渲染，避免 hydration mismatch
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // 预先解析内容，避免重复解析
  const parsedContent = useMemo(() => {
    if (!content) return null
    return markdownToTiptap(content)
  }, [content])

  // 缓存扩展配置
  const extensions = useMemo(() => createExtensions(), [])

  // 缓存 className
  const editorClassName = useMemo(
    () => className || getArticleClassName(defaultContentConfig),
    [className]
  )

  const editor = useEditor({
    extensions,
    editorProps: {
      attributes: {
        class: editorClassName,
      },
    },
    content: parsedContent || undefined,
    editable: false,
    immediatelyRender: false,
  })

  // 处理脚注点击导航
  const handleFootnoteClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement

    // 点击脚注引用 -> 跳转到脚注
    const footnoteRef = target.closest("[data-footnote-id]") as HTMLElement
    if (footnoteRef) {
      e.preventDefault()
      const id = footnoteRef.getAttribute("data-footnote-id")
      const footnoteItem = document.getElementById(`fn-${id}`)
      if (footnoteItem) {
        footnoteItem.scrollIntoView({ behavior: "smooth", block: "center" })
        // 添加高亮动画
        footnoteItem.classList.add("footnote-highlight")
        setTimeout(() => footnoteItem.classList.remove("footnote-highlight"), 2000)
      }
      return
    }

    // 点击返回按钮 -> 跳转回引用位置
    const backref = target.closest("[data-footnote-backref]") as HTMLElement
    if (backref) {
      e.preventDefault()
      const id = backref.getAttribute("data-footnote-backref")
      const refElement = document.getElementById(`fnref-${id}`)
      if (refElement) {
        refElement.scrollIntoView({ behavior: "smooth", block: "center" })
        refElement.classList.add("footnote-highlight")
        setTimeout(() => refElement.classList.remove("footnote-highlight"), 2000)
      }
    }
  }, [])

  useEffect(() => {
    document.addEventListener("click", handleFootnoteClick)
    return () => document.removeEventListener("click", handleFootnoteClick)
  }, [handleFootnoteClick])

  // 服务端和客户端首次渲染都显示 loading 状态，避免 hydration mismatch
  if (!isMounted || !editor) {
    return <div className="animate-pulse h-32 bg-muted rounded" />
  }

  return <EditorContent editor={editor} />
}

/**
 * 只读内容渲染组件
 */
export function ContentRenderer({ content, className, compact }: ContentRendererProps) {
  if (compact) {
    return <CompactRenderer content={content} />
  }
  return <FullRenderer content={content} className={className} />
}
