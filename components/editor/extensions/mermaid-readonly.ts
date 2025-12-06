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
    const mermaid = await initMermaid(true)
    const id = `mermaid-${Math.random().toString(36).slice(2, 11)}`
    const { svg } = await mermaid.render(id, code)
    container.innerHTML = svg
  } catch (error) {
    container.innerHTML = `<pre class="text-red-500 text-sm p-2">${error instanceof Error ? error.message : "渲染错误"}</pre>`
  }
}

/**
 * 只读版本的 Mermaid 扩展
 * 只显示渲染后的图表，不显示编辑界面
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
      dom.className = "mermaid-wrapper my-6 p-4 rounded-lg overflow-x-auto flex items-center justify-center"
      dom.style.background = "hsl(var(--muted) / 0.3)"

      // Show loading placeholder initially to match server render
      dom.innerHTML = '<span class="text-muted-foreground text-sm">Loading diagram...</span>'

      // Defer mermaid rendering to avoid hydration mismatch
      if (typeof window !== "undefined") {
        requestAnimationFrame(() => {
          renderMermaidChart(code, dom)
        })
      }

      return { dom }
    }
  },
})
