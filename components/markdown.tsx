import type { Components } from "react-markdown"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import rehypeRaw from "rehype-raw"
import { isValidElement, type ReactNode } from "react"
import { Mermaid } from "@/components/mermaid"
import { CodeBlock } from "@/components/code-block"

const MarkdownComponents: Components = {
  pre: ({ children }) => {
    const childArray = Array.isArray(children) ? children : [children]
    const codeElement = childArray.find(
      (child) => isValidElement(child) && (child.props as any)?.node?.tagName === "code"
    )

    if (codeElement) {
      const { children: codeContent, className = "" } = codeElement.props as {
        children: ReactNode
        className?: string
      }
      const match = /language-(\w+)/.exec(className)
      const language = match ? match[1] : ""
      const codeString = String(codeContent).replace(/\n$/, "")

      if (language === "mermaid") {
        return <Mermaid chart={codeString} />
      }

      return <CodeBlock className={className}>{codeString}</CodeBlock>
    }

    return <pre>{children}</pre>
  },
  code: ({ inline, className, children, ...props }) => {
    if (!inline) {
      return (
        <code className={className} {...props}>
          {children}
        </code>
      )
    }

    return (
      <code
        className={`bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-pink-600 dark:text-pink-400 ${
          className || ""
        }`.trim()}
        {...props}
      >
        {children}
      </code>
    )
  },
  p: ({ children, ...props }) => {
    return <p {...props}>{children}</p>
  },
  table: ({ children, ...props }) => {
    return (
      <div className="overflow-x-auto my-6">
        <table className="w-full border-collapse text-sm" {...props}>
          {children}
        </table>
      </div>
    )
  },
}

interface MarkdownRendererProps {
  children: string
  wrapperClassName?: string
}

export function MarkdownRenderer({ children, wrapperClassName }: MarkdownRendererProps) {
  const content = (
    <Markdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex, rehypeRaw]}
      components={MarkdownComponents}
    >
      {children}
    </Markdown>
  )

  if (!wrapperClassName) {
    return content
  }

  return <div className={wrapperClassName}>{content}</div>
}
