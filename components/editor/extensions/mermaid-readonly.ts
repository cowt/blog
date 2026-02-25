import { Node, mergeAttributes } from "@tiptap/core"

let mermaidInstance: typeof import("mermaid").default | null = null
let lastTheme: string | null = null

function isDarkMode(): boolean {
  if (typeof document === "undefined") return false
  return document.documentElement.classList.contains("dark")
}

async function initMermaid(forceReinit = false) {
  const currentTheme = isDarkMode() ? "dark" : "light"

  if (mermaidInstance && lastTheme === currentTheme && !forceReinit) {
    return mermaidInstance
  }

  const mermaid = mermaidInstance || (await import("mermaid")).default

  const darkThemeVariables = {
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
    fontFamily: "ui-sans-serif, system-ui, sans-serif",
    fontSize: "14px",
  }

  mermaid.initialize({
    startOnLoad: false,
    theme: isDarkMode() ? "dark" : "default",
    securityLevel: "loose",
    themeVariables: isDarkMode() ? darkThemeVariables : undefined,
  })

  lastTheme = currentTheme
  mermaidInstance = mermaid
  return mermaid
}

async function renderMermaidChart(code: string, container: HTMLElement) {
  if (!code.trim()) {
    container.innerHTML = '<span class="text-muted-foreground text-sm italic">空图表</span>'
    return
  }
  try {
    // 强制重新初始化以适应当前主题
    const mermaid = await initMermaid(true)
    const id = `mermaid-${Math.random().toString(36).slice(2, 11)}`
    const { svg } = await mermaid.render(id, code)
    container.innerHTML = svg
  } catch (error) {
    container.innerHTML = `<pre class="text-red-500 text-sm p-2">${error instanceof Error ? error.message : "渲染错误"}</pre>`
  }
}

function openMermaidLightbox(svgHtml: string) {
  const overlay = document.createElement("div")
  overlay.style.cssText = "position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;cursor:zoom-out;padding:2rem;"
  overlay.setAttribute("role", "dialog")
  overlay.setAttribute("aria-modal", "true")
  overlay.setAttribute("aria-label", "放大查看图表")

  const wrapper = document.createElement("div")
  wrapper.style.cssText = `max-width:95vw;max-height:90vh;overflow:auto;background:${isDarkMode() ? "hsl(222 47% 11%)" : "hsl(0 0% 100%)"};border-radius:0.75rem;padding:2rem;cursor:default;`
  wrapper.innerHTML = svgHtml

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

/**
 * 只读版本的 Mermaid 扩展
 * 只显示渲染后的图表，不显示编辑界面
 * 支持主题切换时自动重新渲染
 */
export const MermaidReadonly = Node.create({
  name: "mermaid",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      code: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-code") || element.textContent,
      },
    }
  },

  parseHTML() {
    return [
      { tag: 'div[data-type="mermaid"]' },
      { tag: "div.mermaid" },
      {
        tag: "pre",
        getAttrs: (node) => {
          const element = node as HTMLElement
          const code = element.querySelector("code")
          if (code?.classList.contains("language-mermaid")) {
            return { code: code.textContent }
          }
          return false
        },
      },
    ]
  },

  renderHTML({ node }) {
    return [
      "div",
      mergeAttributes({
        "data-type": "mermaid",
        "data-code": node.attrs.code,
        class: "mermaid",
      }),
      node.attrs.code,
    ]
  },

  addNodeView() {
    return ({ node }) => {
      const code = node.attrs.code

      const dom = document.createElement("div")
      dom.setAttribute("data-type", "mermaid")
      dom.setAttribute("data-code", code)
      dom.className = "mermaid-wrapper my-6 p-4 rounded-lg overflow-x-auto flex items-center justify-center cursor-pointer"
      dom.style.background = "hsl(var(--muted) / 0.3)"
      dom.title = "点击放大查看"

      // Show loading placeholder initially
      dom.innerHTML = '<span class="text-muted-foreground text-sm">Loading diagram...</span>'

      // 记录当前主题，用于检测变化
      let currentThemeAtRender = isDarkMode() ? "dark" : "light"

      // Defer mermaid rendering to avoid hydration mismatch
      if (typeof window !== "undefined") {
        requestAnimationFrame(() => {
          renderMermaidChart(code, dom)
          currentThemeAtRender = isDarkMode() ? "dark" : "light"
        })
      }

      dom.addEventListener("click", () => {
        const svgEl = dom.querySelector("svg")
        if (svgEl) {
          openMermaidLightbox(svgEl.outerHTML)
        }
      })

      // 监听主题变化（dark class 切换）,自动重新渲染
      let observer: MutationObserver | null = null
      if (typeof window !== "undefined" && typeof MutationObserver !== "undefined") {
        observer = new MutationObserver(() => {
          const newTheme = isDarkMode() ? "dark" : "light"
          if (newTheme !== currentThemeAtRender) {
            currentThemeAtRender = newTheme
            renderMermaidChart(code, dom)
          }
        })
        observer.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ["class"],
        })
      }

      return {
        dom,
        destroy() {
          if (observer) {
            observer.disconnect()
            observer = null
          }
        },
      }
    }
  },
})
