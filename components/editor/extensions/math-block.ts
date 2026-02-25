import { Node, mergeAttributes } from "@tiptap/core"
import { InputRule } from "@tiptap/core"
import katex from "katex"

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    mathBlock: {
      setMathBlock: (latex: string) => ReturnType
    }
  }
}

export const MathBlock = Node.create({
  name: "mathBlock",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      latex: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-latex") || element.textContent,
      },
    }
  },

  parseHTML() {
    return [
      { tag: 'div[data-type="math-block"]' },
      { tag: "div.math-block" },
    ]
  },

  renderHTML({ node }) {
    return ["div", mergeAttributes({
      "data-type": "math-block",
      "data-latex": node.attrs.latex,
      class: "math-block",
    })]
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      type ViewMode = "split" | "code" | "preview"
      let currentMode: ViewMode = "split"
      let currentLatex = node.attrs.latex

      // 主容器
      const dom = document.createElement("div")
      dom.setAttribute("data-type", "math-block")
      dom.setAttribute("data-latex", currentLatex)
      dom.className = "math-block-wrapper group relative my-4 rounded-lg border border-border overflow-hidden bg-muted/20 clear-both"
      dom.contentEditable = "false"

      // 悬浮工具栏
      const toolbar = document.createElement("div")
      toolbar.className = "math-toolbar absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-md bg-background/90 border border-border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"

      const label = document.createElement("span")
      label.className = "text-xs font-medium text-muted-foreground mr-2"
      label.textContent = "LaTeX"

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
      contentArea.className = "math-content flex"

      // 代码区域 - 直接使用 textarea 作为容器
      const textarea = document.createElement("textarea")
      textarea.className = "math-code flex-1 p-4 border-r border-border min-h-[100px] font-mono text-sm bg-background resize-y focus:outline-none focus:ring-2 focus:ring-primary/50"
      textarea.value = currentLatex
      textarea.spellcheck = false
      textarea.placeholder = "输入 LaTeX 公式..."

      // 阻止事件冒泡
      textarea.addEventListener("keydown", (e) => e.stopPropagation())
      textarea.addEventListener("keyup", (e) => e.stopPropagation())
      textarea.addEventListener("keypress", (e) => e.stopPropagation())
      textarea.addEventListener("input", (e) => {
        e.stopPropagation()
        currentLatex = textarea.value
        renderLatex()
        updateNode()
      })
      textarea.addEventListener("paste", (e) => e.stopPropagation())
      textarea.addEventListener("cut", (e) => e.stopPropagation())

      // 预览区域
      const previewContainer = document.createElement("div")
      previewContainer.className = "math-preview flex-1 p-4 flex items-center justify-center overflow-x-auto"

      contentArea.appendChild(textarea)
      contentArea.appendChild(previewContainer)

      dom.appendChild(toolbar)
      dom.appendChild(contentArea)

      // 渲染公式
      function renderLatex() {
        if (!currentLatex.trim()) {
          previewContainer.innerHTML = '<span class="text-muted-foreground text-sm italic">预览区域</span>'
          return
        }
        
        // 移动端检测
        const isMobile = window.innerWidth <= 768
        
        try {
          const rendered = katex.renderToString(currentLatex, {
            throwOnError: false,
            displayMode: true,
            // 移动端优化选项
            ...(isMobile && {
              macros: {
                "\\arraystretch": "0.8"
              }
            })
          })
          previewContainer.innerHTML = rendered
          
          // 移动端：仅修正公式编号定位，让 CSS 处理其余布局
          if (isMobile) {
            const tags = previewContainer.querySelectorAll('.tag, .eqn-num')
            tags.forEach(el => {
              const element = el as HTMLElement
              element.style.position = "static"
              element.style.display = "inline-block"
              element.style.marginLeft = "0.5em"
              element.style.verticalAlign = "middle"
              element.style.float = "none"
            })
          }
        } catch (error) {
          previewContainer.innerHTML = `<pre class="text-red-500 text-sm">${error instanceof Error ? error.message : "渲染错误"}</pre>`
        }
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
            editor.view.state.tr.setNodeMarkup(pos, undefined, { latex: currentLatex })
          )
          dom.setAttribute("data-latex", currentLatex)
        }
      }

      // 初始化
      // 移动端默认使用预览模式
      const isMobile = window.innerWidth <= 768
      if (isMobile) {
        currentMode = "preview"
        switchMode("preview")
      }
      
      updateButtonStyles()
      renderLatex()

      return {
        dom,
        update: (updatedNode) => {
          if (updatedNode.type.name !== "mathBlock") return false
          if (updatedNode.attrs.latex !== currentLatex) {
            currentLatex = updatedNode.attrs.latex
            textarea.value = currentLatex
            dom.setAttribute("data-latex", currentLatex)
            renderLatex()
          }
          return true
        },
        stopEvent: (event) => {
          // 允许 textarea 内的所有事件
          if (event.target === textarea) return true
          return false
        },
      }
    }
  },

  addCommands() {
    return {
      setMathBlock: (latex: string) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: { latex },
        })
      },
    }
  },

  addInputRules() {
    return [
      new InputRule({
        find: /\s$/,
        handler: ({ state, range, chain }) => {
          const $from = state.doc.resolve(range.from)
          const fullText = $from.parent.textContent
          if (fullText.trim() !== "$$") return null

          chain()
            .deleteRange({ from: $from.start(), to: $from.end() })
            .setMathBlock("")
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
        if (nodeBefore?.type.name === "mathBlock") {
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
