import { Extension } from "@tiptap/core"
import { Plugin, PluginKey } from "@tiptap/pm/state"
import { markdownToTiptap } from "@/lib/markdown-to-tiptap"

/**
 * 检测文本是否包含 Markdown 语法
 */
function isMarkdownText(text: string): boolean {
  // 表格检测 - 以 | 开头的行
  if (/^\s*\|.+\|/m.test(text)) {
    return true
  }

  // 标题
  if (/^#{1,6}\s+/m.test(text)) {
    return true
  }

  // 代码块
  if (/^```/m.test(text)) {
    return true
  }

  // 数学公式块 $$...$$
  if (/\$\$[\s\S]+?\$\$/m.test(text)) {
    return true
  }

  // 行内数学公式 $...$
  if (/\$[^$\n]+\$/.test(text)) {
    return true
  }

  // 列表
  if (/^\s*[-*+]\s+/m.test(text) || /^\s*\d+\.\s+/m.test(text)) {
    return true
  }

  // 任务列表
  if (/^\s*- \[[ xX]\]/m.test(text)) {
    return true
  }

  // 引用
  if (/^>\s+/m.test(text)) {
    return true
  }

  // 分割线
  if (/^(-{3,}|\*{3,}|_{3,})$/m.test(text)) {
    return true
  }

  // 图片 ![alt](url)
  if (/!\[[^\]]*\]\([^)]+\)/.test(text)) {
    return true
  }

  // 行内格式（粗体、斜体、代码、链接）
  if (/\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\)/.test(text)) {
    return true
  }

  // 删除线 ~~text~~
  if (/~~[^~]+~~/.test(text)) {
    return true
  }

  // 上标 ^text^
  if (/\^[^^]+\^/.test(text)) {
    return true
  }

  // 下标 ~text~ (单个波浪线，排除删除线)
  if (/(?<!~)~[^~]+~(?!~)/.test(text)) {
    return true
  }

  // 脚注引用 [^1] 或脚注定义 [^1]:
  if (/\[\^[^\]]+\]/.test(text)) {
    return true
  }

  // Details/折叠块
  if (/<details>|<summary>/i.test(text)) {
    return true
  }

  // Mermaid 图表
  if (/```mermaid/i.test(text)) {
    return true
  }

  return false
}

export const MarkdownPaste = Extension.create({
  name: "markdownPaste",

  addProseMirrorPlugins() {
    const editor = this.editor

    return [
      new Plugin({
        key: new PluginKey("markdownPaste"),
        props: {
          handlePaste: (view, event) => {
            const clipboardData = event.clipboardData
            if (!clipboardData) return false

            // 如果有 HTML 内容，让 Tiptap 默认处理
            const html = clipboardData.getData("text/html")
            if (html && html.trim()) {
              return false
            }

            // 获取纯文本
            const text = clipboardData.getData("text/plain")
            if (!text || !text.trim()) {
              return false
            }

            // 检测是否是 Markdown
            if (!isMarkdownText(text)) {
              return false
            }

            // 转换 Markdown 为 Tiptap JSON
            const doc = markdownToTiptap(text)

            // 使用 editor.commands.insertContent 插入
            if (doc.content && doc.content.length > 0) {
              try {
                // 删除当前选区
                const { from, to } = view.state.selection
                if (from !== to) {
                  editor.commands.deleteSelection()
                }

                // 插入转换后的内容
                editor.commands.insertContent(doc.content)
                return true
              } catch (e) {
                console.error("Markdown paste error:", e)
                return false
              }
            }

            return false
          },
        },
      }),
    ]
  },
})
