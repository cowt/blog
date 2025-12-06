"use client"

import { Node, mergeAttributes } from "@tiptap/core"
import { NodeViewWrapper, NodeViewContent, ReactNodeViewRenderer } from "@tiptap/react"
import { useState, useEffect, useCallback, useRef } from "react"
import { Check, Copy, ChevronDown } from "lucide-react"

// 常用语言列表
const POPULAR_LANGUAGES: { value: string; label: string }[] = [
  { value: "", label: "Plain Text" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "jsx", label: "JSX" },
  { value: "tsx", label: "TSX" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "json", label: "JSON" },
  { value: "yaml", label: "YAML" },
  { value: "sql", label: "SQL" },
  { value: "bash", label: "Bash" },
  { value: "shell", label: "Shell" },
  { value: "markdown", label: "Markdown" },
]

const LANGUAGE_ALIASES: Record<string, string> = {
  js: "javascript", ts: "typescript", py: "python", sh: "bash", yml: "yaml",
}

function normalizeLanguage(lang: string): string {
  const normalized = lang.toLowerCase().trim()
  return LANGUAGE_ALIASES[normalized] || normalized
}

interface CodeBlockViewProps {
  node: { attrs: { language?: string }; textContent: string }
  updateAttributes: (attrs: { language: string }) => void
  editor: { isEditable: boolean; isDestroyed: boolean }
}

function CodeBlockView({ node, updateAttributes, editor }: CodeBlockViewProps) {
  const [copied, setCopied] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const code = node.textContent
  const language = normalizeLanguage(node.attrs.language || "")

  // Prevent domFromPos errors by waiting for mount
  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }, [code])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as HTMLElement)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const currentLangLabel = POPULAR_LANGUAGES.find(l => l.value === language)?.label || language || "Plain Text"

  return (
    <NodeViewWrapper
      className="code-block-wrapper relative my-6 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 悬浮工具栏 */}
      <div className={`absolute right-2 top-2 z-10 flex items-center gap-1 transition-opacity ${isHovered || showDropdown ? "opacity-100" : "opacity-0"}`}>
        <div className="relative" ref={dropdownRef}>
          {editor.isEditable ? (
            <>
              <button
                type="button"
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground bg-background/80 backdrop-blur-sm border border-border rounded px-2 py-1 shadow-sm"
              >
                <span>{currentLangLabel}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              {showDropdown && (
                <div className="absolute top-full right-0 mt-1 z-50 bg-popover border border-border rounded-md shadow-lg max-h-64 overflow-y-auto min-w-[140px]">
                  {POPULAR_LANGUAGES.map((lang) => (
                    <button
                      key={lang.value}
                      type="button"
                      onClick={() => { updateAttributes({ language: lang.value }); setShowDropdown(false) }}
                      className={`w-full text-left px-3 py-1.5 text-xs hover:bg-muted transition-colors ${language === lang.value ? "bg-muted text-foreground" : "text-muted-foreground"}`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <span className="text-xs text-muted-foreground bg-background/80 backdrop-blur-sm border border-border rounded px-2 py-1">{currentLangLabel}</span>
          )}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="p-1.5 rounded bg-background/80 backdrop-blur-sm border border-border shadow-sm text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Copy code"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* 代码区域 - 无高亮，保持简单可编辑 */}
      <pre className="rounded-lg border border-border overflow-x-auto p-4 text-sm font-mono bg-[#f6f8fa] dark:bg-[#0d1117]">
        <code>
          {isMounted && !editor.isDestroyed ? (
            <NodeViewContent />
          ) : (
            <span className="text-muted-foreground">{code}</span>
          )}
        </code>
      </pre>
    </NodeViewWrapper>
  )
}


export const CodeBlockHighlight = Node.create({
  name: "codeBlock",
  group: "block",
  content: "text*",
  marks: "",
  code: true,
  defining: true,

  addAttributes() {
    return {
      language: {
        default: "",
        parseHTML: (element) => {
          const classAttr = element.querySelector("code")?.getAttribute("class") || element.getAttribute("class") || ""
          const match = classAttr.match(/language-(\w+)/)
          return match ? match[1] : ""
        },
        renderHTML: (attributes) => {
          if (!attributes.language) return {}
          return { class: `language-${attributes.language}` }
        },
      },
    }
  },

  parseHTML() {
    return [{ tag: "pre" }]
  },

  renderHTML({ HTMLAttributes }) {
    return ["pre", mergeAttributes(HTMLAttributes), ["code", {}, 0]]
  },

  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockView)
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Alt-c": () => this.editor.commands.toggleCodeBlock(),
      Tab: ({ editor }) => {
        if (editor.isActive("codeBlock")) {
          editor.commands.insertContent("\t")
          return true
        }
        return false
      },
    }
  },

  addCommands() {
    return {
      setCodeBlock: (attributes) => ({ commands }) => commands.setNode(this.name, attributes),
      toggleCodeBlock: (attributes) => ({ commands }) => commands.toggleNode(this.name, "paragraph", attributes),
    }
  },
})
