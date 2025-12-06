"use client"

import { useEffect, useRef, useState } from "react"
import { useTheme } from "next-themes"
import mermaid from "mermaid"

interface MermaidProps {
  chart: string
}

export function Mermaid({ chart }: MermaidProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [svg, setSvg] = useState<string | null>(null)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    let cancelled = false
    const id = `mermaid-${Math.random().toString(36).slice(2, 11)}`

    // 根据主题选择 mermaid 主题
    const mermaidTheme = resolvedTheme === "dark" ? "dark" : "default"

    mermaid.initialize({
      startOnLoad: false,
      theme: mermaidTheme,
      securityLevel: "loose",
      themeVariables: resolvedTheme === "dark" ? {
        primaryColor: "#3b82f6",
        primaryTextColor: "#f8fafc",
        primaryBorderColor: "#60a5fa",
        lineColor: "#94a3b8",
        secondaryColor: "#475569",
        tertiaryColor: "#334155",
        background: "#1e293b",
        mainBkg: "#1e293b",
        nodeBorder: "#60a5fa",
        clusterBkg: "#334155",
        clusterBorder: "#475569",
        titleColor: "#f8fafc",
        edgeLabelBackground: "#1e293b",
        textColor: "#f8fafc",
        nodeTextColor: "#f8fafc",
      } : undefined,
    })

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
  }, [chart, resolvedTheme])

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
