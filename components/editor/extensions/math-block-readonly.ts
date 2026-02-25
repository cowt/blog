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

      if (latex.trim()) {
        try {
          const rendered = katex.renderToString(latex, {
            throwOnError: false,
            displayMode: true,
          })
          dom.innerHTML = rendered

          // 根据当前宽度调整 tag 定位
          function updateTagLayout() {
            const isMobile = dom.offsetWidth <= 500 || window.innerWidth <= 768
            const tags = dom.querySelectorAll('.tag, .eqn-num')
            tags.forEach(el => {
              const element = el as HTMLElement
              if (isMobile) {
                element.style.position = "static"
                element.style.display = "inline-block"
                element.style.marginLeft = "0.5em"
                element.style.verticalAlign = "middle"
                element.style.float = "none"
                element.style.transform = "none"
                element.style.right = "auto"
                element.style.top = "auto"
              } else {
                // 桌面端：恢复为绝对定位（让 CSS 控制）
                element.style.position = ""
                element.style.display = ""
                element.style.marginLeft = ""
                element.style.verticalAlign = ""
                element.style.float = ""
                element.style.transform = ""
                element.style.right = ""
                element.style.top = ""
              }
            })
          }

          // 初始布局
          requestAnimationFrame(updateTagLayout)

          // 监听窗口大小变化，动态切换 tag 定位
          const resizeHandler = () => updateTagLayout()
          window.addEventListener("resize", resizeHandler)

          // 存储 cleanup 引用
          ;(dom as any).__mathCleanup = () => {
            window.removeEventListener("resize", resizeHandler)
          }
        } catch (error) {
          dom.innerHTML = `<span class="text-red-500 text-sm">${error instanceof Error ? error.message : "渲染错误"}</span>`
        }
      } else {
        dom.innerHTML = '<span class="text-muted-foreground text-sm italic">空公式</span>'
      }

      return {
        dom,
        destroy() {
          // 清理 resize 监听器
          const cleanup = (dom as any).__mathCleanup
          if (cleanup) cleanup()
        },
      }
    }
  },
})
