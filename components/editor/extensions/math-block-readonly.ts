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
          dom.innerHTML = katex.renderToString(latex, {
            throwOnError: false,
            displayMode: true,
          })
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
