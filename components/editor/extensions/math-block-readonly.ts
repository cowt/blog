import { Node, mergeAttributes } from "@tiptap/core"
import katex from "katex"

/**
 * 只读版本的 MathBlock 扩展
 * 只显示渲染后的公式，不显示编辑界面
 */
export const MathBlockReadonly = Node.create({
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
    return [
      "div",
      mergeAttributes({
        "data-type": "math-block",
        "data-latex": node.attrs.latex,
        class: "math-block",
      }),
    ]
  },

  addNodeView() {
    return ({ node }) => {
      const latex = node.attrs.latex

      const dom = document.createElement("div")
      dom.setAttribute("data-type", "math-block")
      dom.setAttribute("data-latex", latex)
      dom.className = "math-block my-6 py-4 px-2 text-center overflow-x-auto rounded-lg"
      dom.style.background = "hsl(var(--muted) / 0.3)"

      // 移动端检测
      const isMobile = window.innerWidth <= 768

      if (latex.trim()) {
        try {
          const rendered = katex.renderToString(latex, {
            throwOnError: false,
            displayMode: true,
            // 移动端优化选项
            ...(isMobile && {
              macros: {
                "\\arraystretch": "0.8"
              }
            })
          })
          dom.innerHTML = rendered
          
          // 移动端额外样式 - 更激进的缩放确保无滚动条
          if (isMobile) {
            dom.style.overflow = "hidden"
            dom.style.maxWidth = "100%"
            dom.style.boxSizing = "border-box"
            dom.style.transformOrigin = "center"
            dom.style.transform = "scale(0.6)"
            // 强制移除任何可能的滚动
            dom.style.overflowX = "hidden"
            dom.style.overflowY = "hidden"
            const katexDisplay = dom.querySelector('.katex-display') as HTMLElement
            if (katexDisplay) {
              katexDisplay.style.whiteSpace = "nowrap"
              katexDisplay.style.overflow = "hidden"
              katexDisplay.style.overflowX = "hidden"
              katexDisplay.style.overflowY = "hidden"
              katexDisplay.style.maxWidth = "100%"
            }
            // 移除所有子元素的滚动
            const allElements = dom.querySelectorAll('*')
            allElements.forEach(el => {
              const element = el as HTMLElement
              element.style.overflow = "hidden"
              element.style.overflowX = "hidden"
              element.style.overflowY = "hidden"
              
              // 特别处理KaTeX标签元素
              if (element.classList.contains('tag') || 
                  element.classList.contains('eqn-num') ||
                  element.className.includes('tag')) {
                element.style.position = "static"
                element.style.right = "auto"
                element.style.top = "auto"
                element.style.transform = "none"
                element.style.display = "inline-block"
                element.style.marginLeft = "0.5em"
                element.style.verticalAlign = "middle"
                element.style.float = "none"
              }
            })
          }
        } catch (error) {
          dom.innerHTML = `<span class="text-red-500 text-sm">${error instanceof Error ? error.message : "渲染错误"}</span>`
        }
      } else {
        dom.innerHTML = '<span class="text-muted-foreground text-sm italic">空公式</span>'
      }

      return { dom }
    }
  },
})
