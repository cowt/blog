"use client"

import { NodeViewWrapper, NodeViewContent } from "@tiptap/react"
import { useState, useCallback } from "react"
import { Check, Copy } from "lucide-react"

const LANGUAGE_LABELS: Record<string, string> = {
  plaintext: "Plain Text",
  javascript: "JavaScript",
  typescript: "TypeScript",
  python: "Python",
  java: "Java",
  cpp: "C++",
  c: "C",
  csharp: "C#",
  go: "Go",
  rust: "Rust",
  ruby: "Ruby",
  php: "PHP",
  swift: "Swift",
  kotlin: "Kotlin",
  html: "HTML",
  css: "CSS",
  scss: "SCSS",
  json: "JSON",
  yaml: "YAML",
  xml: "XML",
  markdown: "Markdown",
  sql: "SQL",
  bash: "Bash",
  shell: "Shell",
  powershell: "PowerShell",
  dockerfile: "Dockerfile",
  graphql: "GraphQL",
}

interface CodeBlockReadonlyViewProps {
  node: { attrs: { language?: string }; textContent: string }
}

export function CodeBlockReadonlyView({ node }: CodeBlockReadonlyViewProps) {
  const [copied, setCopied] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const code = node.textContent
  const language = node.attrs.language || "plaintext"

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }, [code])

  const langLabel = LANGUAGE_LABELS[language] || language

  return (
    <NodeViewWrapper 
      className="code-block-wrapper relative my-6"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 悬浮工具栏 */}
      <div className={`absolute right-2 top-2 z-10 flex items-center gap-1 transition-opacity ${isHovered || copied ? "opacity-100" : "opacity-0"}`}>
        {language && language !== "plaintext" && (
          <span className="text-xs text-muted-foreground bg-background/80 backdrop-blur-sm border border-border rounded px-2 py-1">
            {langLabel}
          </span>
        )}
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
          <NodeViewContent />
        </code>
      </pre>
    </NodeViewWrapper>
  )
}
