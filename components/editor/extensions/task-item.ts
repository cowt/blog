import TaskItem from "@tiptap/extension-task-item"
import { CommandProps } from "@tiptap/core"

// 扩展 Tiptap 的 Commands 接口，声明自定义命令
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    taskItem: {
      toggleTask: () => ReturnType
    }
  }
}

/**
 * 自定义 TaskItem 扩展
 * 修改 HTML 结构，让 checkbox 和文字在同一行
 */
export const CustomTaskItem = TaskItem.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      checked: {
        default: false,
        keepOnSplit: false,
        parseHTML: (element) => {
          const checkbox = element.querySelector('input[type="checkbox"]') as HTMLInputElement | null
          return checkbox?.checked || element.getAttribute("data-checked") === "true"
        },
        renderHTML: (attributes) => ({
          "data-checked": attributes.checked,
        }),
      },
    }
  },

  addCommands() {
    return {
      ...this.parent?.(),
      toggleTask:
        () =>
        ({ commands, tr, state }: CommandProps) => {
          // 查找当前光标位置的 taskItem 节点
          const { $from } = state.selection
          const taskItemPos = $from.before($from.depth)
          const taskItemNode = tr.doc.nodeAt(taskItemPos)

          if (taskItemNode && taskItemNode.type.name === "taskItem") {
            // 切换 checked 状态
            return commands.command(({ tr }) => {
              tr.setNodeMarkup(taskItemPos, undefined, {
                ...taskItemNode.attrs,
                checked: !taskItemNode.attrs.checked,
              })
              return true
            })
          }
          return false
        },
    }
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      "li",
      {
        ...HTMLAttributes,
        "data-type": "taskItem",
        "data-checked": node.attrs.checked,
        class: "task-item",
      },
      [
        "label",
        { class: "task-item-label", contenteditable: "false" },
        [
          "input",
          {
            type: "checkbox",
            checked: node.attrs.checked ? "checked" : null,
          },
        ],
      ],
      ["span", { class: "task-item-content" }, 0], // 0 表示内容插入点
    ]
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      const isEditable = editor.isEditable

      const listItem = document.createElement("li")
      listItem.setAttribute("data-type", "taskItem")
      listItem.setAttribute("data-checked", String(node.attrs.checked))
      listItem.className = "task-item"

      const label = document.createElement("label")
      label.className = "task-item-label"
      label.contentEditable = "false"

      const checkbox = document.createElement("input")
      checkbox.type = "checkbox"
      checkbox.checked = node.attrs.checked

      // 只读模式下禁用 checkbox
      if (!isEditable) {
        checkbox.disabled = true
        checkbox.style.pointerEvents = "none"
      } else {
        checkbox.addEventListener("change", () => {
          const pos = getPos()
          if (typeof pos === "number") {
            const checked = checkbox.checked
            // 立即更新 DOM 属性以确保样式同步
            listItem.setAttribute("data-checked", String(checked))
            editor
              .chain()
              .focus()
              .command(({ tr }) => {
                tr.setNodeMarkup(pos, undefined, { ...node.attrs, checked })
                return true
              })
              .run()
          }
        })
      }

      label.appendChild(checkbox)

      const content = document.createElement("span")
      content.className = "task-item-content"

      listItem.appendChild(label)
      listItem.appendChild(content)

      return {
        dom: listItem,
        contentDOM: content,
        update: (updatedNode) => {
          if (updatedNode.type.name !== "taskItem") return false
          checkbox.checked = updatedNode.attrs.checked
          listItem.setAttribute("data-checked", String(updatedNode.attrs.checked))
          return true
        },
      }
    }
  },
})
