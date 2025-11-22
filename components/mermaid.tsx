"use client"

import { useEffect, useRef, useState } from "react"
import mermaid from "mermaid"

mermaid.initialize({
  startOnLoad: false,
  theme: "default",
  securityLevel: "loose",
})

interface MermaidProps {
  chart: string
}

export function Mermaid({ chart }: MermaidProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [svg, setSvg] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const id = `mermaid-${Math.random().toString(36).slice(2, 11)}`

    mermaid
      .render(id, chart)
      .then(({ svg }) => {
        if (!cancelled) {
          setSvg(svg)
        }
      })
      .catch((error) => {
        console.error("Failed to render mermaid diagram:", error)
      })

    return () => {
      cancelled = true
    }
  }, [chart])

  if (!svg) {
    return null
  }

  return (
    <div
      ref={ref}
      className="mermaid my-4 flex justify-center bg-muted/20 p-4 rounded-lg overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: svg }}
      suppressHydrationWarning
    />
  )
}
