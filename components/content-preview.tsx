"use client"

import { ContentStyleConfig, getContentClassName } from "@/lib/content-styles"
import { markdownToHtml } from "@/lib/markdown-to-html"

interface ContentPreviewProps {
  content: string
  config?: ContentStyleConfig
  className?: string
}

export function ContentPreview({ content, config, className = "" }: ContentPreviewProps) {
  const htmlContent = markdownToHtml(content)
  const contentClassName = config ? getContentClassName(config) : "content-body"

  return (
    <div 
      className={`${contentClassName} ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  )
}