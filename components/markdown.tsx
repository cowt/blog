import type { Components } from "react-markdown"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import rehypeRaw from "rehype-raw"
import remarkEmoji from "remark-emoji"
import remarkSupersub from "remark-supersub"
import remarkFootnotes from "remark-footnotes"
import { isValidElement, type ReactNode } from "react"
import { Mermaid } from "@/components/mermaid"
import { CodeBlock } from "@/components/code-block"
import { convertCollapsibleShortcodes } from "@/lib/markdown"

const getScrollableParent = (element: HTMLElement | null) => {
  if (typeof window === "undefined" || !element) {
    return null
  }

  let parent = element.parentElement
  while (parent) {
    const style = window.getComputedStyle(parent)
    if ((style.overflowY === "auto" || style.overflowY === "scroll") && parent.scrollHeight > parent.clientHeight + 1) {
      return parent
    }
    parent = parent.parentElement
  }

  return (document.scrollingElement || document.documentElement || document.body) as HTMLElement | null
}

const scrollElementToCenter = (element: HTMLElement) => {
  if (typeof window === "undefined") {
    return
  }

  const container = getScrollableParent(element)
  if (!container) {
    return
  }

  const elementRect = element.getBoundingClientRect()

  if (
    container === document.body ||
    container === document.documentElement ||
    container === document.scrollingElement
  ) {
    const centerOffset = Math.max(0, window.innerHeight / 2 - elementRect.height / 2)
    const targetTop = elementRect.top + window.scrollY - centerOffset
    window.scrollTo({
      top: Math.max(0, targetTop),
      behavior: "smooth",
    })
    return
  }

  const containerRect = container.getBoundingClientRect()
  const offsetWithinContainer = elementRect.top - containerRect.top + container.scrollTop
  const centerOffset = Math.max(0, container.clientHeight / 2 - elementRect.height / 2)
  const targetScrollTop = offsetWithinContainer - centerOffset

  container.scrollTo({
    top: Math.max(0, targetScrollTop),
    behavior: "smooth",
  })
}

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
  code: ({ inline, className, children, ...props }: any) => {
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
  // Collapsible details/summary
  details: ({ children, ...props }) => {
    return (
      <details className="my-4 rounded-lg border border-border bg-muted/30 overflow-hidden" {...props}>
        {children}
      </details>
    )
  },
  summary: ({ children, ...props }) => {
    return (
      <summary className="cursor-pointer px-4 py-3 font-medium hover:bg-muted/50 transition-colors select-none" {...props}>
        {children}
      </summary>
    )
  },
  // Task list checkboxes
  input: ({ type, checked, disabled, ...props }: any) => {
    if (type === 'checkbox') {
      return (
        <input
          type="checkbox"
          checked={checked}
          disabled
          className="mr-2 cursor-default accent-primary"
          {...props}
        />
      )
    }
    return <input type={type} {...props} />
  },
  // Definition lists
  dl: ({ children, ...props }) => (
    <dl className="my-6" {...props}>{children}</dl>
  ),
  dt: ({ children, ...props }) => (
    <dt className="font-bold mt-4 mb-1" {...props}>{children}</dt>
  ),
  dd: ({ children, ...props }) => (
    <dd className="ml-6 mb-2 text-muted-foreground" {...props}>{children}</dd>
  ),
  // Highlight text
  mark: ({ children, ...props }) => (
    <mark className="bg-yellow-200 dark:bg-yellow-900/50 px-1 rounded" {...props}>
      {children}
    </mark>
  ),
  // Superscript with footnote support and smooth scroll
  sup: ({ children, ...props }: any) => {
    const id = props.id
    if (id?.startsWith('fnref-')) {
      return (
        <sup className="footnote-ref" {...props}>
          <a 
            href={`#${id.replace('fnref-', 'fn-')}`} 
            className="text-primary text-xs font-bold px-1 hover:underline"
            onClick={(e) => {
            const target = document.getElementById(id.replace('fnref-', 'fn-'))
              if (target) {
                target.classList.add('highlight-target')
                setTimeout(() => target.classList.remove('highlight-target'), 2000)
              }
            }}
          >
            [{children}]
          </a>
        </sup>
      )
    }
    return <sup className="text-xs" {...props}>{children}</sup>
  },
  // Link component with footnote backref support
  a: ({ href, children, ...props }: any) => {
    if (href?.startsWith('#fnref-')) {
      return (
        <a 
          href={href} 
          className="footnote-backref ml-2 text-primary hover:underline"
          onClick={(e) => {
            e.preventDefault()
            const target = document.getElementById(href.substring(1))
            if (target) {
              target.scrollIntoView({ behavior: 'smooth', block: 'center' })
              target.classList.add('highlight-target')
              setTimeout(() => target.classList.remove('highlight-target'), 2000)
            }
          }}
          {...props}
        >
          ↩
        </a>
      )
    }
    const isAnchor = href?.startsWith('#') || href?.startsWith('/')
    // User requested "default new tab", but usually internal links (starting with /) should be same tab?
    // "guide page / new / edit 不是新标签页打开链接" -> They WANT new tab.
    // So I will only exclude anchors starting with #.
    const shouldOpenNewTab = !href?.startsWith('#')
    
    return (
      <a 
        href={href} 
        target={shouldOpenNewTab ? "_blank" : undefined}
        rel={shouldOpenNewTab ? "noopener noreferrer" : undefined}
        {...props}
      >
        {children}
      </a>
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
      remarkPlugins={[
        remarkGfm,
        remarkMath,
        remarkEmoji,
        [remarkSupersub, {}],
        [remarkFootnotes as any, { inlineNotes: true }],
      ]}
      rehypePlugins={[rehypeKatex, rehypeRaw]}
      components={MarkdownComponents}
    >
      {convertCollapsibleShortcodes(children)}
    </Markdown>
  )

  if (!wrapperClassName) {
    return content
  }

  return <div className={wrapperClassName}>{content}</div>
}
