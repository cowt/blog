"use client"

import { NodeViewWrapper, NodeViewContent, NodeViewProps } from "@tiptap/react"
import { useState, useEffect, useCallback, useRef } from "react"
import { Check, Copy, ChevronDown } from "lucide-react"

// 常用语言列表
const POPULAR_LANGUAGES: { value: string; label: string }[] = [
  { value: "plaintext", label: "Plain Text" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "c", label: "C" },
  { value: "csharp", label: "C#" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "ruby", label: "Ruby" },
  { value: "php", label: "PHP" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "scss", label: "SCSS" },
  { value: "json", label: "JSON" },
  { value: "yaml", label: "YAML" },
  { value: "xml", label: "XML" },
  { value: "markdown", label: "Markdown" },
  { value: "sql", label: "SQL" },
  { value: "bash", label: "Bash" },
  { value: "shell", label: "Shell" },
  { value: "powershell", label: "PowerShell" },
  { value: "dockerfile", label: "Dockerfile" },
  { value: "graphql", label: "GraphQL" },
]

type CodeBlockViewProps = NodeViewProps & {
  extension: { options: { lowlight: { listLanguages: () => string[] } } }
}

export function CodeBlockView({ node, updateAttributes, extension, editor }: CodeBlockViewProps) {
  const [copied, setCopied] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const code = node.textContent
  const language = node.attrs.language || "plaintext"

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

  // 获取支持的语言列表
  const supportedLanguages = extension.options.lowlight.listLanguages()
  const availableLanguages = POPULAR_LANGUAGES.filter(
    lang => lang.value === "plaintext" || supportedLanguages.includes(lang.value)
  )

  const currentLangLabel = availableLanguages.find(l => l.value === language)?.label || language

  return (
    <NodeViewWrapper 
      className="code-block-wrapper relative my-6 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 悬浮工具栏 */}
      <div className={`absolute right-2 top-2 z-10 flex items-center gap-1 transition-opacity ${isHovered || showDropdown ? "opacity-100" : "opacity-0"}`}>
        {/* 语言选择器 */}
        <div className="relative" ref={dropdownRef}>
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
              {availableLanguages.map((lang) => (
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
        </div>

        {/* 复制按钮 */}
        <button
          type="button"
          onClick={handleCopy}
          className="p-1.5 rounded bg-background/80 backdrop-blur-sm border border-border shadow-sm text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Copy code"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* 代码区域 */}
      <pre className="rounded-lg border border-border overflow-x-auto p-4 text-sm font-mono bg-[#f6f8fa] dark:bg-[#0d1117]">
        <code>
          {isMounted && editor && !editor.isDestroyed ? (
            <NodeViewContent />
          ) : (
            <span className="text-muted-foreground">{code}</span>
          )}
        </code>
      </pre>
    </NodeViewWrapper>
  )
}
