import { Node, mergeAttributes } from "@tiptap/core"
import { InputRule } from "@tiptap/core"
import katex from "katex"

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    mathInline: {
      setMathInline: (latex: string) => ReturnType
    }
  }
}

/**
 * 行内公式节点 - $...$
 */
export const MathInline = Node.create({
  name: "mathInline",
  group: "inline",
  inline: true,
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
      { tag: 'span[data-type="math-inline"]' },
      { tag: "span.math-inline" },
    ]
  },

  renderHTML({ node }) {
    return ["span", mergeAttributes({
      "data-type": "math-inline",
      "data-latex": node.attrs.latex,
      class: "math-inline",
    })]
  },

  addNodeView() {
    return ({ node, editor }) => {
      const dom = document.createElement("span")
      dom.setAttribute("data-type", "math-inline")
      dom.setAttribute("data-latex", node.attrs.latex)
      dom.className = "math-inline cursor-pointer"
      dom.contentEditable = "false"

      try {
        dom.innerHTML = katex.renderToString(node.attrs.latex, {
          throwOnError: false,
          displayMode: false,
        })
      } catch {
        dom.textContent = node.attrs.latex
      }

      // 双击编辑
      dom.addEventListener("dblclick", () => {
        const newLatex = prompt("编辑 LaTeX 公式:", node.attrs.latex)
        if (newLatex !== null) {
          const pos = editor.view.posAtDOM(dom, 0)
          editor.chain().focus().deleteRange({ from: pos, to: pos + node.nodeSize }).insertContentAt(pos, {
            type: "mathInline",
            attrs: { latex: newLatex },
          }).run()
        }
      })

      return { dom }
    }
  },

  addCommands() {
    return {
      setMathInline: (latex: string) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: { latex },
        })
      },
    }
  },

  addInputRules() {
    return [
      // $...$ 行内公式 (输入结尾的 $ 触发，排除 $$)
      new InputRule({
        find: /(?<!\$)\$([^$\n]+)\$$/,
        handler: ({ state, range, match }) => {
          const latex = match[1]
          const { tr } = state
          tr.replaceWith(range.from, range.to, this.type.create({ latex }))
        },
      }),
    ]
  },
})
