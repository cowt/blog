import { Node, mergeAttributes } from "@tiptap/core"

/**
 * 脚注引用节点 - 文中的上标数字
 */
export const FootnoteRef = Node.create({
  name: "footnoteRef",
  group: "inline",
  inline: true,
  atom: true,

  addAttributes() {
    return {
      id: {
        default: null,
      },
      label: {
        default: null,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'sup.footnote-ref',
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    const id = node.attrs.id
    const label = node.attrs.label || id
    return [
      "sup",
      mergeAttributes(HTMLAttributes, {
        class: "footnote-ref cursor-pointer text-primary hover:underline",
        id: `fnref-${id}`,
        "data-footnote-id": id,
      }),
      `[${label}]`,
    ]
  },
})

/**
 * 脚注列表容器
 */
export const FootnoteList = Node.create({
  name: "footnoteList",
  group: "block",
  content: "footnoteItem+",

  parseHTML() {
    return [
      {
        tag: 'section.footnotes',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "section",
      mergeAttributes(HTMLAttributes, {
        class: "footnotes",
      }),
      [
        "h2",
        { class: "footnotes-title" },
        "脚注",
      ],
      [
        "ol",
        { class: "footnotes-list" },
        0,
      ],
    ]
  },
})

/**
 * 单个脚注项
 */
export const FootnoteItem = Node.create({
  name: "footnoteItem",
  group: "block",
  content: "inline*",

  addAttributes() {
    return {
      id: {
        default: null,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'li.footnote-item',
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    const id = node.attrs.id
    return [
      "li",
      mergeAttributes(HTMLAttributes, {
        class: "footnote-item",
        id: `fn-${id}`,
      }),
      [
        "span",
        { class: "footnote-content" },
        0,
      ],
      [
        "span",
        {
          class: "footnote-backref cursor-pointer text-primary hover:underline ml-1",
          "data-footnote-backref": id,
        },
        "↩",
      ],
    ]
  },
})
