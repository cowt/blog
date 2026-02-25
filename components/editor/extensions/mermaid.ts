import { Node, mergeAttributes } from "@tiptap/core"
import { InputRule } from "@tiptap/core"

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
    container.innerHTML = '<span class="text-muted-foreground text-sm italic">预览区域</span>'
    return
  }
  try {
    // 每次渲染前检查主题是否变化
    const mermaid = await initMermaid(true)
    const id = `mermaid-${Math.random().toString(36).slice(2, 11)}`
    const { svg } = await mermaid.render(id, code)
    container.innerHTML = svg
  } catch (error) {
    container.innerHTML = `<pre class="text-red-500 text-sm p-2">${error instanceof Error ? error.message : "渲染错误"}</pre>`
  }
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    mermaid: {
      setMermaid: (code: string) => ReturnType
    }
  }
}

export const Mermaid = Node.create({
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
    return ["div", mergeAttributes({
      "data-type": "mermaid",
      "data-code": node.attrs.code,
      class: "mermaid",
    }), node.attrs.code]
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      type ViewMode = "split" | "code" | "preview"
      let currentMode: ViewMode = "split"
      let currentCode = node.attrs.code

      // 主容器
      const dom = document.createElement("div")
      dom.setAttribute("data-type", "mermaid")
      dom.setAttribute("data-code", currentCode)
      dom.className = "mermaid-wrapper group relative my-4 rounded-lg border border-border overflow-hidden bg-muted/20"
      dom.contentEditable = "false"

      // 悬浮工具栏
      const toolbar = document.createElement("div")
      toolbar.className = "mermaid-toolbar absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-md bg-background/90 border border-border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"

      const label = document.createElement("span")
      label.className = "text-xs font-medium text-muted-foreground mr-2"
      label.textContent = "Mermaid"

      const createBtn = (text: string, mode: ViewMode) => {
        const btn = document.createElement("button")
        btn.type = "button"
        btn.className = "px-2 py-0.5 text-xs rounded transition-colors"
        btn.textContent = text
        btn.addEventListener("click", (e) => {
          e.preventDefault()
          e.stopPropagation()
          switchMode(mode)
        })
        return btn
      }

      const splitBtn = createBtn("Split", "split")
      const codeBtn = createBtn("Code", "code")
      const previewBtn = createBtn("Preview", "preview")

      toolbar.appendChild(label)
      toolbar.appendChild(splitBtn)
      toolbar.appendChild(codeBtn)
      toolbar.appendChild(previewBtn)

      // 内容区域
      const contentArea = document.createElement("div")
      contentArea.className = "mermaid-content flex"

      // 代码区域 - 直接使用 textarea 作为容器
      const textarea = document.createElement("textarea")
      textarea.className = "mermaid-code flex-1 p-4 border-r border-border min-h-[150px] font-mono text-sm bg-background resize-y focus:outline-none focus:ring-2 focus:ring-primary/50"
      textarea.value = currentCode
      textarea.spellcheck = false
      textarea.placeholder = "输入 Mermaid 代码..."

      // 阻止事件冒泡
      textarea.addEventListener("keydown", (e) => e.stopPropagation())
      textarea.addEventListener("keyup", (e) => e.stopPropagation())
      textarea.addEventListener("keypress", (e) => e.stopPropagation())
      textarea.addEventListener("input", (e) => {
        e.stopPropagation()
        currentCode = textarea.value
        renderPreview()
        updateNode()
      })
      textarea.addEventListener("paste", (e) => e.stopPropagation())
      textarea.addEventListener("cut", (e) => e.stopPropagation())

      // 预览区域
      const previewContainer = document.createElement("div")
      previewContainer.className = "mermaid-preview flex-1 p-4 flex items-center justify-center overflow-x-auto"

      contentArea.appendChild(textarea)
      contentArea.appendChild(previewContainer)

      dom.appendChild(toolbar)
      dom.appendChild(contentArea)

      // 渲染预览
      function renderPreview() {
        renderMermaidChart(currentCode, previewContainer)
      }

      // 更新按钮状态
      function updateButtonStyles() {
        const baseClass = "px-2 py-0.5 text-xs rounded transition-colors"
        const activeClass = baseClass + " bg-primary text-primary-foreground"
        const inactiveClass = baseClass + " hover:bg-muted text-muted-foreground"

        splitBtn.className = currentMode === "split" ? activeClass : inactiveClass
        codeBtn.className = currentMode === "code" ? activeClass : inactiveClass
        previewBtn.className = currentMode === "preview" ? activeClass : inactiveClass
      }

      // 切换模式
      function switchMode(mode: ViewMode) {
        currentMode = mode
        updateButtonStyles()

        if (mode === "split") {
          textarea.classList.remove("hidden")
          textarea.classList.add("flex-1", "border-r")
          previewContainer.classList.remove("hidden")
          previewContainer.classList.add("flex-1")
        } else if (mode === "code") {
          textarea.classList.remove("hidden", "border-r")
          textarea.classList.add("flex-1")
          previewContainer.classList.add("hidden")
          previewContainer.classList.remove("flex-1")
        } else {
          textarea.classList.add("hidden")
          textarea.classList.remove("flex-1", "border-r")
          previewContainer.classList.remove("hidden")
          previewContainer.classList.add("flex-1")
        }
      }

      // 更新节点数据
      function updateNode() {
        const pos = getPos()
        if (typeof pos === "number") {
          editor.view.dispatch(
            editor.view.state.tr.setNodeMarkup(pos, undefined, { code: currentCode })
          )
          dom.setAttribute("data-code", currentCode)
        }
      }

      // 初始化
      updateButtonStyles()
      renderPreview()

      // 监听主题变化，自动重新渲染预览
      let themeAtRender = isDarkMode() ? "dark" : "light"
      let observer: MutationObserver | null = null
      if (typeof MutationObserver !== "undefined") {
        observer = new MutationObserver(() => {
          const newTheme = isDarkMode() ? "dark" : "light"
          if (newTheme !== themeAtRender) {
            themeAtRender = newTheme
            renderPreview()
          }
        })
        observer.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ["class"],
        })
      }

      return {
        dom,
        update: (updatedNode) => {
          if (updatedNode.type.name !== "mermaid") return false
          if (updatedNode.attrs.code !== currentCode) {
            currentCode = updatedNode.attrs.code
            textarea.value = currentCode
            dom.setAttribute("data-code", currentCode)
            renderPreview()
          }
          return true
        },
        stopEvent: (event) => {
          if (event.target === textarea) return true
          return false
        },
        destroy() {
          if (observer) {
            observer.disconnect()
            observer = null
          }
        },
      }
    }
  },

  addCommands() {
    return {
      setMermaid: (code: string) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: { code },
        })
      },
    }
  },

  addInputRules() {
    return [
      new InputRule({
        find: /^```mermaid\s$/,
        handler: ({ range, chain }) => {
          chain()
            .deleteRange(range)
            .setMermaid("graph TD\n  A[开始] --> B[结束]")
            .run()
        },
      }),
    ]
  },

  addKeyboardShortcuts() {
    return {
      Backspace: ({ editor }) => {
        const { $from, empty } = editor.state.selection
        if (!empty) return false
        const nodeBefore = $from.nodeBefore
        if (nodeBefore?.type.name === "mermaid") {
          editor.commands.deleteRange({
            from: $from.pos - nodeBefore.nodeSize,
            to: $from.pos,
          })
          return true
        }
        return false
      },
    }
  },
})
