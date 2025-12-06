import { Node, mergeAttributes } from "@tiptap/core"

/**
 * 只读版本的 Details 节点
 * 默认折叠状态，点击 summary 可以展开/折叠
 */
export const DetailsReadonly = Node.create({
  name: "details",
  group: "block",
  content: "detailsSummary block+",
  defining: true,
  isolating: true,

  addAttributes() {
    return {
      open: {
        default: false, // 只读模式默认折叠
        parseHTML: () => false, // 解析时始终设为折叠
        renderHTML: (attributes) => (attributes.open ? { open: "" } : {}),
      },
    }
  },

  parseHTML() {
    return [{ tag: "details" }]
  },

  renderHTML({ HTMLAttributes }) {
    return ["details", mergeAttributes(HTMLAttributes), 0]
  },
})

/**
 * 只读版本的 DetailsSummary 节点
 */
export const DetailsSummaryReadonly = Node.create({
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
})
