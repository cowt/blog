import { Extension } from "@tiptap/core"

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    textIndent: {
      setTextIndent: (level: number) => ReturnType
      increaseIndent: () => ReturnType
      decreaseIndent: () => ReturnType
    }
  }
}

/**
 * 文本缩进扩展 - 使用 margin-left 而不是 blockquote
 */
export const TextIndent = Extension.create({
  name: "textIndent",

  addGlobalAttributes() {
    return [
      {
        types: ["paragraph", "heading"],
        attributes: {
          textIndent: {
            default: 0,
            parseHTML: (element) => {
              const style = element.getAttribute("style") || ""
              const match = style.match(/margin-left:\s*(\d+)px/)
              return match ? parseInt(match[1]) / 24 : 0 // 24px = 1 level
            },
            renderHTML: (attributes) => {
              if (!attributes.textIndent || attributes.textIndent === 0) {
                return {}
              }
              return {
                style: `margin-left: ${attributes.textIndent * 24}px`,
              }
            },
          },
          style: {
            default: null,
            parseHTML: (element) => element.getAttribute("style"),
            renderHTML: (attributes) => {
              if (!attributes.style) {
                return {}
              }
              return {
                style: attributes.style,
              }
            },
          },
          class: {
            default: null,
            parseHTML: (element) => element.getAttribute("class"),
            renderHTML: (attributes) => {
              if (!attributes.class) {
                return {}
              }
              return {
                class: attributes.class,
              }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setTextIndent:
        (level: number) =>
        ({ tr, state, dispatch }) => {
          const { selection } = state
          const { from, to } = selection

          let hasChanges = false
          const newLevel = Math.max(0, Math.min(level, 6)) // 最大6级缩进

          tr.doc.nodesBetween(from, to, (node, pos) => {
            if (node.type.name === "paragraph" || node.type.name === "heading") {
              if (node.attrs.textIndent !== newLevel) {
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  textIndent: newLevel,
                })
                hasChanges = true
              }
            }
          })

          if (hasChanges && dispatch) {
            dispatch(tr)
          }
          
          return hasChanges
        },

      increaseIndent:
        () =>
        ({ editor, state }) => {
          const { selection } = state
          const { $from } = selection

          // 如果在列表中，使用列表缩进
          if (editor.isActive("listItem")) {
            return editor.commands.sinkListItem("listItem")
          }
          if (editor.isActive("taskItem")) {
            return editor.commands.sinkListItem("taskItem")
          }

          // 检查当前节点是否支持缩进
          const node = $from.parent
          if (node.type.name !== "paragraph" && node.type.name !== "heading") {
            return false
          }

          // 普通文本使用边距缩进
          const currentIndent = node.attrs.textIndent || 0
          if (currentIndent < 6) {
            return editor.commands.setTextIndent(currentIndent + 1)
          }
          return false
        },

      decreaseIndent:
        () =>
        ({ editor, state }) => {
          const { selection } = state
          const { $from } = selection

          // 如果在列表中，使用列表缩进
          if (editor.isActive("listItem")) {
            return editor.commands.liftListItem("listItem")
          }
          if (editor.isActive("taskItem")) {
            return editor.commands.liftListItem("taskItem")
          }

          // 检查当前节点是否支持缩进
          const node = $from.parent
          if (node.type.name !== "paragraph" && node.type.name !== "heading") {
            return false
          }

          // 普通文本减少边距缩进
          const currentIndent = node.attrs.textIndent || 0
          if (currentIndent > 0) {
            return editor.commands.setTextIndent(currentIndent - 1)
          }
          return false
        },
    }
  },

  addKeyboardShortcuts() {
    return {
      // 移除 Tab 键处理，避免与其他扩展冲突
      // Tab 键由各自的列表扩展处理
      "Mod-]": () => this.editor.commands.increaseIndent(),
      "Mod-[": () => this.editor.commands.decreaseIndent(),
    }
  },
})