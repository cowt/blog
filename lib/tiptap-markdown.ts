import { Node as ProseMirrorNode } from "@tiptap/pm/model"

/**
 * 将 Tiptap 文档转换为 Markdown
 */
export function tiptapToMarkdown(doc: ProseMirrorNode): string {
  const result: string[] = []

  doc.forEach((node, _offset, _index) => {
    const md = nodeToMarkdown(node, 0)
    if (md) result.push(md)
  })

  return result.join("\n\n")
}

function nodeToMarkdown(node: ProseMirrorNode, indent: number): string {
  const indentStr = "  ".repeat(indent)

  switch (node.type.name) {
    case "paragraph":
      const textIndent = node.attrs.textIndent || 0
      const indentPrefix = textIndent > 0 ? "  ".repeat(textIndent) : ""
      return indentPrefix + indentStr + inlineToMarkdown(node)

    case "heading":
      const level = node.attrs.level || 1
      const headingIndent = node.attrs.textIndent || 0
      const headingPrefix = headingIndent > 0 ? "  ".repeat(headingIndent) : ""
      return headingPrefix + "#".repeat(level) + " " + inlineToMarkdown(node)

    case "bulletList":
      return bulletListToMarkdown(node, indent)

    case "orderedList":
      return orderedListToMarkdown(node, indent)

    case "listItem":
      return listItemToMarkdown(node, indent)

    case "taskList":
      return taskListToMarkdown(node, indent)

    case "taskItem":
      return taskItemToMarkdown(node, indent)

    case "blockquote":
      return blockquoteToMarkdown(node)

    case "codeBlock":
      const lang = node.attrs.language || ""
      return "```" + lang + "\n" + node.textContent + "\n```"

    case "horizontalRule":
      return "---"

    case "image":
      const alt = node.attrs.alt || ""
      const src = node.attrs.src || ""
      const title = node.attrs.title ? ` "${node.attrs.title}"` : ""
      
      // Preserve image attributes as HTML for complex styling or alignment
      if (node.attrs.width || node.attrs.style || node.attrs["data-align"]) {
        const attrs: string[] = []
        if (node.attrs.width) attrs.push(`width="${node.attrs.width}"`)
        if (node.attrs.style) attrs.push(`style="${node.attrs.style}"`)
        if (node.attrs.class) attrs.push(`class="${node.attrs.class}"`)
        if (node.attrs["data-align"]) attrs.push(`data-align="${node.attrs["data-align"]}"`)
        attrs.push(`src="${src}"`)
        if (alt) attrs.push(`alt="${alt}"`)
        if (node.attrs.title) attrs.push(`title="${node.attrs.title}"`)
        
        return `<img ${attrs.join(' ')} />`
      }
      
      return `![${alt}](${src}${title})`

    case "table":
      return tableToMarkdown(node)

    case "details":
      return detailsToMarkdown(node)

    case "mathBlock":
      return "$$\n" + (node.attrs.latex || "") + "\n$$"

    case "mermaid":
      return "```mermaid\n" + (node.attrs.code || "") + "\n```"

    case "hardBreak":
      return "  \n"

    case "footnoteList":
      return footnoteListToMarkdown(node)

    case "footnoteItem":
      // 单独的 footnoteItem 不应该出现在顶层
      return ""

    default:
      // 未知块级节点，尝试获取文本内容
      if (node.isBlock) {
        return inlineToMarkdown(node)
      }
      return ""
  }
}

function inlineToMarkdown(node: ProseMirrorNode): string {
  let result = ""

  node.forEach((child) => {
    if (child.isText) {
      let text = child.text || ""

      // 应用 marks
      child.marks.forEach((mark) => {
        switch (mark.type.name) {
          case "bold":
          case "strong":
            text = `**${text}**`
            break
          case "italic":
          case "em":
            text = `*${text}*`
            break
          case "strike":
            text = `~~${text}~~`
            break
          case "code":
            text = `\`${text}\``
            break
          case "link":
            const href = mark.attrs.href || ""
            text = `[${text}](${href})`
            break
          case "superscript":
            text = `^${text}^`
            break
          case "subscript":
            text = `~${text}~`
            break
        }
      })

      result += text
    } else if (child.type.name === "mathInline") {
      result += "$" + (child.attrs.latex || "") + "$"
    } else if (child.type.name === "hardBreak") {
      result += "  \n"
    } else if (child.type.name === "image") {
      const alt = child.attrs.alt || ""
      const src = child.attrs.src || ""
      
      // Preserve image attributes as HTML for complex styling or alignment
      if (child.attrs.width || child.attrs.style || child.attrs["data-align"]) {
        const attrs: string[] = []
        if (child.attrs.width) attrs.push(`width="${child.attrs.width}"`)
        if (child.attrs.style) attrs.push(`style="${child.attrs.style}"`)
        if (child.attrs.class) attrs.push(`class="${child.attrs.class}"`)
        if (child.attrs["data-align"]) attrs.push(`data-align="${child.attrs["data-align"]}"`)
        attrs.push(`src="${src}"`)
        if (alt) attrs.push(`alt="${alt}"`)
        if (child.attrs.title) attrs.push(`title="${child.attrs.title}"`)
        
        result += `<img ${attrs.join(' ')} />`
      } else {
        result += `![${alt}](${src})`
      }
    } else if (child.type.name === "footnoteRef") {
      const id = child.attrs.id || ""
      result += `[^${id}]`
    }
  })

  return result
}

function bulletListToMarkdown(node: ProseMirrorNode, indent: number): string {
  const items: string[] = []

  node.forEach((child) => {
    if (child.type.name === "listItem") {
      items.push(listItemToMarkdown(child, indent))
    }
  })

  return items.join("\n")
}

function orderedListToMarkdown(node: ProseMirrorNode, indent: number): string {
  const items: string[] = []
  let num = node.attrs.start || 1

  node.forEach((child) => {
    if (child.type.name === "listItem") {
      const indentStr = "  ".repeat(indent)
      const content = listItemContent(child, indent)
      items.push(`${indentStr}${num}. ${content}`)
      num++
    }
  })

  return items.join("\n")
}

function listItemToMarkdown(node: ProseMirrorNode, indent: number): string {
  const indentStr = "  ".repeat(indent)
  const content = listItemContent(node, indent)
  return `${indentStr}- ${content}`
}

function listItemContent(node: ProseMirrorNode, indent: number): string {
  const parts: string[] = []

  node.forEach((child, _offset, _index) => {
    if (child.type.name === "paragraph") {
      parts.push(inlineToMarkdown(child))
    } else if (child.type.name === "bulletList") {
      parts.push("\n" + bulletListToMarkdown(child, indent + 1))
    } else if (child.type.name === "orderedList") {
      parts.push("\n" + orderedListToMarkdown(child, indent + 1))
    } else if (child.type.name === "taskList") {
      parts.push("\n" + taskListToMarkdown(child, indent + 1))
    }
  })

  return parts.join("")
}

function taskListToMarkdown(node: ProseMirrorNode, indent: number): string {
  const items: string[] = []

  node.forEach((child) => {
    if (child.type.name === "taskItem") {
      items.push(taskItemToMarkdown(child, indent))
    }
  })

  return items.join("\n")
}

function taskItemToMarkdown(node: ProseMirrorNode, indent: number): string {
  const indentStr = "  ".repeat(indent)
  const checked = node.attrs.checked ? "x" : " "
  const textParts: string[] = []
  const nestedParts: string[] = []

  node.forEach((child) => {
    if (child.type.name === "paragraph") {
      const text = inlineToMarkdown(child)
      if (text.trim()) {
        textParts.push(text.trim())
      }
    } else if (child.type.name === "taskList") {
      nestedParts.push(taskListToMarkdown(child, indent + 1))
    }
  })

  const text = textParts.join(" ")
  const nested = nestedParts.length > 0 ? "\n" + nestedParts.join("\n") : ""

  return `${indentStr}- [${checked}] ${text}${nested}`
}

function blockquoteToMarkdown(node: ProseMirrorNode, depth: number = 1): string {
  const prefix = "> ".repeat(depth)
  const lines: string[] = []

  node.forEach((child) => {
    if (child.type.name === "blockquote") {
      // 嵌套引用，增加深度
      const nestedMd = blockquoteToMarkdown(child, depth + 1)
      lines.push(nestedMd)
    } else {
      const md = nodeToMarkdown(child, 0)
      if (md) {
        md.split("\n").forEach((line) => {
          lines.push(prefix + line)
        })
      }
    }
  })

  return lines.join("\n")
}

function tableToMarkdown(node: ProseMirrorNode): string {
  const rows: string[][] = []
  let headerRow = true

  node.forEach((row) => {
    if (row.type.name === "tableRow") {
      const cells: string[] = []
      row.forEach((cell) => {
        cells.push(inlineToMarkdown(cell.firstChild || cell))
      })
      rows.push(cells)

      // 添加分隔行
      if (headerRow) {
        rows.push(cells.map(() => "---"))
        headerRow = false
      }
    }
  })

  return rows.map((row) => "| " + row.join(" | ") + " |").join("\n")
}

function detailsToMarkdown(node: ProseMirrorNode): string {
  let summary = "详情"
  const content: string[] = []
  const isOpen = node.attrs.open

  node.forEach((child) => {
    if (child.type.name === "detailsSummary") {
      summary = inlineToMarkdown(child)
    } else {
      const md = nodeToMarkdown(child, 0)
      if (md) content.push(md)
    }
  })

  const openAttr = isOpen ? " open" : ""
  return `<details${openAttr}>\n<summary>${summary}</summary>\n\n${content.join("\n\n")}\n\n</details>`
}

function footnoteListToMarkdown(node: ProseMirrorNode): string {
  const definitions: string[] = []

  node.forEach((child) => {
    if (child.type.name === "footnoteItem") {
      const id = child.attrs.id || ""
      const content = inlineToMarkdown(child)
      definitions.push(`[^${id}]: ${content}`)
    }
  })

  return definitions.join("\n")
}
