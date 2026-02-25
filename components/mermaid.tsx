"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useTheme } from "next-themes"
import mermaid from "mermaid"

interface MermaidProps {
  chart: string
}

function openMermaidLightbox(svgHtml: string, isDark: boolean) {
  const overlay = document.createElement("div")
  overlay.style.cssText = "position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;cursor:zoom-out;padding:2rem;"
  overlay.setAttribute("role", "dialog")
  overlay.setAttribute("aria-modal", "true")
  overlay.setAttribute("aria-label", "放大查看图表")

  const wrapper = document.createElement("div")
  wrapper.style.cssText = `max-width:95vw;max-height:90vh;overflow:auto;background:${isDark ? "hsl(222 47% 11%)" : "hsl(0 0% 100%)"};border-radius:0.75rem;padding:2rem;cursor:default;`
  wrapper.innerHTML = svgHtml

  // 修复 SVG 尺寸：读取 viewBox 的原始尺寸，移除百分比宽高，设置合理大小
  const svg = wrapper.querySelector("svg")
  if (svg) {
    const viewBox = svg.getAttribute("viewBox")
    let intrinsicWidth = 0
    let intrinsicHeight = 0

    if (viewBox) {
      const parts = viewBox.split(/[\s,]+/)
      intrinsicWidth = parseFloat(parts[2]) || 0
      intrinsicHeight = parseFloat(parts[3]) || 0
    }

    // 移除可能导致尺寸塌缩的百分比属性
    svg.removeAttribute("width")
    svg.removeAttribute("height")
    svg.removeAttribute("style")

    if (intrinsicWidth > 0 && intrinsicHeight > 0) {
      const maxW = window.innerWidth * 0.9 - 64
      const maxH = window.innerHeight * 0.85 - 64
      const scale = Math.min(maxW / intrinsicWidth, maxH / intrinsicHeight, 1.5)
      const displayW = Math.round(intrinsicWidth * scale)
      const displayH = Math.round(intrinsicHeight * scale)

      svg.style.width = `${displayW}px`
      svg.style.height = `${displayH}px`
    } else {
      svg.style.width = "auto"
      svg.style.height = "auto"
      svg.style.minWidth = "300px"
      svg.style.maxWidth = "85vw"
      svg.style.maxHeight = "80vh"
    }

    svg.style.display = "block"
    svg.style.margin = "0 auto"
    svg.style.background = "transparent"
  }

  overlay.appendChild(wrapper)

  const close = () => {
    overlay.remove()
    document.removeEventListener("keydown", onKey)
  }
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close()
  })
  wrapper.addEventListener("click", close)
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") close()
  }
  document.addEventListener("keydown", onKey)

  document.body.appendChild(overlay)
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
        // 额外文字颜色覆盖
        labelTextColor: "#f8fafc",
        actorTextColor: "#f8fafc",
        signalTextColor: "#f8fafc",
        loopTextColor: "#f8fafc",
        noteBkgColor: "#334155",
        noteTextColor: "#f8fafc",
        noteBorderColor: "#475569",
        sectionBkgColor: "#334155",
        altSectionBkgColor: "#1e293b",
        taskTextColor: "#f8fafc",
        taskTextOutsideColor: "#f8fafc",
        // 增强文字对比度
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
        fontSize: "14px",
        fontWeight: "500",
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

  const handleClick = useCallback(() => {
    const svgEl = ref.current?.querySelector("svg")
    if (svgEl) {
      openMermaidLightbox(svgEl.outerHTML, resolvedTheme === "dark")
    }
  }, [resolvedTheme])

  if (!svg) {
    return null
  }

  return (
    <div
      ref={ref}
      className="mermaid my-4 flex justify-center bg-muted/20 p-4 rounded-lg overflow-x-auto overflow-y-visible cursor-pointer"
      style={{ WebkitOverflowScrolling: 'touch' }}
      dangerouslySetInnerHTML={{ __html: svg }}
      onClick={handleClick}
      title="点击放大查看"
      suppressHydrationWarning
    />
  )
}
