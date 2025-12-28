import { Node, mergeAttributes, CommandProps } from "@tiptap/core"
import { InputRule } from "@tiptap/core"
import { Plugin, PluginKey } from "@tiptap/pm/state"

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    details: {
      setDetails: (title?: string) => ReturnType
      unsetDetails: () => ReturnType
      toggleDetailsOpen: () => ReturnType
    }
  }
}

/**
 * Details 节点 - 使用原生 <details> 标签
 */
export const Details = Node.create({
  name: "details",
  group: "block",
  content: "detailsSummary block+",
  defining: true,
  isolating: true,

  addAttributes() {
    return {
      open: {
        default: true,
        parseHTML: (element) => element.hasAttribute("open"),
        renderHTML: (attributes) => (attributes.open ? { open: "" } : {}),
      },
    }
  },

  parseHTML() {
    return [{ tag: "details" }]
  },

  renderHTML({ HTMLAttributes }) {
    return ["details", mergeAttributes(HTMLAttributes, {
      class: "my-4 border border-border rounded-lg overflow-hidden"
    }), 0]
  },

  addCommands() {
    return {
      setDetails:
        (title?: string) =>
          ({ commands }: CommandProps) => {
            return commands.insertContent({
              type: this.name,
              attrs: { open: true },
              content: [
                {
                  type: "detailsSummary",
                  content: [{ type: "text", text: title || "点击展开详情" }],
                },
                { type: "paragraph", content: [{ type: "text", text: "在这里添加折叠内容..." }] },
              ],
            })
          },
      unsetDetails:
        () =>
          ({ state, tr, dispatch, editor }: CommandProps) => {
            const { $from } = state.selection
            for (let d = $from.depth; d > 0; d--) {
              if ($from.node(d).type.name === "details") {
                if (dispatch) {
                  const pos = $from.before(d)
                  const node = $from.node(d)
                  // 用空段落替换，避免 content gap 错误
                  const paragraph = state.schema.nodes.paragraph.create()
                  tr.replaceWith(pos, pos + node.nodeSize, paragraph)
                  dispatch(tr)
                }
                return true
              }
            }
            return false
          },
      toggleDetailsOpen:
        () =>
          ({ state, tr, dispatch }: CommandProps) => {
            const { $from } = state.selection
            for (let d = $from.depth; d > 0; d--) {
              if ($from.node(d).type.name === "details") {
                if (dispatch) {
                  const pos = $from.before(d)
                  const node = $from.node(d)
                  tr.setNodeMarkup(pos, undefined, {
                    ...node.attrs,
                    open: !node.attrs.open,
                  })
                  dispatch(tr)
                }
                return true
              }
            }
            return false
          },
    }
  },

  addKeyboardShortcuts() {
    return {
      Backspace: ({ editor }) => {
        const { state } = editor
        const { $from, empty } = state.selection
        if (!empty) return false

        // 在 summary 开头删除整个 details
        if ($from.parent.type.name === "detailsSummary" && $from.parentOffset === 0) {
          return editor.commands.unsetDetails()
        }

        // 在 details 内容区的第一个块的开头，阻止默认行为
        for (let d = $from.depth; d > 0; d--) {
          const node = $from.node(d)
          if (node.type.name === "details") {
            // 检查是否在 details 内容的第一个块的开头
            const detailsStart = $from.before(d)
            const $detailsStart = state.doc.resolve(detailsStart + 1)

            // 如果光标在段落开头且是 details 内第一个内容块之后
            if ($from.parentOffset === 0) {
              const parentPos = $from.before($from.depth)
              // 检查前一个节点是否是 summary
              const $parentPos = state.doc.resolve(parentPos)
              if ($parentPos.nodeBefore?.type.name === "detailsSummary") {
                // 阻止默认行为，不做任何操作
                return true
              }
            }
            break
          }
        }

        return false
      },
      "Mod-Shift-d": ({ editor }) => editor.commands.unsetDetails(),
    }
  },

  addInputRules() {
    return [
      // 统一处理所有 ::: 触发情况
      new InputRule({
        find: /\s$/,  // 任何空格都检查
        handler: ({ state, range, chain }) => {
          const $from = state.doc.resolve(range.from)
          const parent = $from.parent
          const fullText = parent.textContent

          // 检查是否以 ::: 开头
          if (!fullText.startsWith(":::")) {
            return null
          }

          // 解析标题
          let title = "详情"
          const textAfterTrigger = fullText.slice(3).trim() // 去掉 :::

          if (textAfterTrigger) {
            title = textAfterTrigger
          }

          // 删除整个段落
          const lineStart = $from.start()
          const lineEnd = $from.end()

          chain()
            .deleteRange({ from: lineStart, to: lineEnd })
            .setDetails(title)
            .run()
        },
      }),
    ]
  },

  // 处理点击 summary 切换折叠
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("detailsClick"),
        props: {
          handleClick: (view, pos, event) => {
            const target = event.target as HTMLElement

            // 检查是否点击了 summary 元素
            if (target.tagName === "SUMMARY" || target.closest("summary")) {
              const $pos = view.state.doc.resolve(pos)

              // 查找 details 节点
              for (let d = $pos.depth; d > 0; d--) {
                const node = $pos.node(d)
                if (node.type.name === "details") {
                  const detailsPos = $pos.before(d)
                  const tr = view.state.tr.setNodeMarkup(detailsPos, undefined, {
                    ...node.attrs,
                    open: !node.attrs.open,
                  })
                  view.dispatch(tr)
                  return true
                }
              }
            }
            return false
          },
        },
      }),
    ]
  },
})

/**
 * DetailsSummary 节点
 */
export const DetailsSummary = Node.create({
  name: "detailsSummary",
  group: "block",
  content: "inline*",
  defining: true,
  isolating: true,

  parseHTML() {
    return [{ tag: "summary" }]
  },

  renderHTML({ HTMLAttributes }) {
    return ["summary", mergeAttributes(HTMLAttributes), 0]
  },

  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        const { $from } = editor.state.selection
        if ($from.parent.type.name !== "detailsSummary") return false
        editor.commands.setTextSelection($from.after() + 1)
        return true
      },
    }
  },
})
