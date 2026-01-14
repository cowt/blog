import { JSONContent } from "@tiptap/core"

// 脚注定义存储
interface FootnoteDefinition {
  id: string
  content: string
}

// 脚注上下文
interface FootnoteContext {
  definitions: Map<string, FootnoteDefinition>
  used: Map<string, number>
  getNextNumber: () => number
}

/**
 * 将 Markdown 转换为 Tiptap JSON 内容
 */
export function markdownToTiptap(markdown: string): JSONContent {
  // 先提取所有脚注定义
  const footnoteDefinitions: Map<string, FootnoteDefinition> = new Map()
  const footnotePattern = /^\[\^([^\]]+)\]:\s*(.+)$/gm
  let match
  while ((match = footnotePattern.exec(markdown)) !== null) {
    footnoteDefinitions.set(match[1], {
      id: match[1],
      content: match[2],
    })
  }

  // 移除脚注定义行
  const cleanedMarkdown = markdown.replace(/^\[\^([^\]]+)\]:\s*.+$/gm, "")

  const lines = cleanedMarkdown.split("\n")
  const content: JSONContent[] = []
  let i = 0
  let footnoteCounter = 0
  const usedFootnotes: Map<string, number> = new Map()

  const fnCtx: FootnoteContext = {
    definitions: footnoteDefinitions,
    used: usedFootnotes,
    getNextNumber: () => ++footnoteCounter,
  }

  while (i < lines.length) {
    const result = parseLine(lines, i, fnCtx)
    if (result.node) {
      content.push(result.node)
    }
    // 安全检查：确保索引始终前进，防止无限循环
    if (result.nextIndex <= i) {
      i++
    } else {
      i = result.nextIndex
    }
  }

  // 如果有使用的脚注，添加脚注列表
  if (usedFootnotes.size > 0) {
    const footnoteItems: JSONContent[] = []
    const sortedFootnotes = Array.from(usedFootnotes.entries()).sort((a, b) => a[1] - b[1])

    for (const [id] of sortedFootnotes) {
      const def = footnoteDefinitions.get(id)
      if (def) {
        footnoteItems.push({
          type: "footnoteItem",
          attrs: { id },
          content: parseInline(def.content, fnCtx),
        })
      }
    }

    if (footnoteItems.length > 0) {
      content.push({
        type: "footnoteList",
        content: footnoteItems,
      })
    }
  }

  return {
    type: "doc",
    content: content.length > 0 ? content : [{ type: "paragraph" }],
  }
}

interface ParseResult {
  node: JSONContent | null
  nextIndex: number
}

function parseLine(lines: string[], index: number, fnCtx?: FootnoteContext): ParseResult {
  if (index >= lines.length) {
    return { node: null, nextIndex: index + 1 }
  }

  const line = lines[index]

  // 空行
  if (line.trim() === "") {
    return { node: null, nextIndex: index + 1 }
  }

  // 标题
  const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)
  if (headingMatch) {
    return {
      node: {
        type: "heading",
        attrs: { level: headingMatch[1].length },
        content: parseInline(headingMatch[2], fnCtx),
      },
      nextIndex: index + 1,
    }
  }

  // 代码块
  if (line.startsWith("```")) {
    return parseCodeBlock(lines, index)
  }

  // 数学公式块 (必须是 $$ 开头)
  if (line.startsWith("$$")) {
    return parseMathBlock(lines, index)
  }

  // 任务列表
  if (line.match(/^\s*- \[[ xX]\]/)) {
    return parseTaskList(lines, index, fnCtx)
  }

  // 无序列表
  if (line.match(/^\s*[-*+]\s/)) {
    return parseBulletList(lines, index, 0, fnCtx)
  }

  // 有序列表
  if (line.match(/^\s*\d+\.\s/)) {
    return parseOrderedList(lines, index, 0, fnCtx)
  }

  // 引用
  if (line.startsWith(">")) {
    return parseBlockquote(lines, index, fnCtx)
  }

  // 分割线
  if (line.match(/^(-{3,}|\*{3,}|_{3,})$/)) {
    return {
      node: { type: "horizontalRule" },
      nextIndex: index + 1,
    }
  }

  // 图片（独立行）
  const imgMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)
  if (imgMatch) {
    return {
      node: {
        type: "image",
        attrs: { src: imgMatch[2], alt: imgMatch[1] },
      },
      nextIndex: index + 1,
    }
  }

  // HTML 图片标签（独立行）
  const htmlImgMatch = line.match(/^<img\s+([^>]+)\s*\/?>$/)
  if (htmlImgMatch) {
    const attrs: Record<string, string> = {}
    const attrString = htmlImgMatch[1]
    
    // 解析属性（支持 data-* 属性）
    const attrMatches = attrString.matchAll(/([\w-]+)="([^"]*)"/g)
    for (const match of attrMatches) {
      attrs[match[1]] = match[2]
    }
    
    return {
      node: {
        type: "image",
        attrs: {
          src: attrs.src || "",
          alt: attrs.alt || "",
          width: attrs.width || null,
          style: attrs.style || null,
          class: attrs.class || null,
          title: attrs.title || null,
          "data-align": attrs["data-align"] || null,
        },
      },
      nextIndex: index + 1,
    }
  }

  // Details
  if (line.startsWith("<details>")) {
    return parseDetails(lines, index, fnCtx)
  }

  // 表格 (以 | 开头的行)
  if (line.trim().startsWith("|")) {
    return parseTable(lines, index, fnCtx)
  }

  // 普通段落
  const inlineContent = parseInline(line, fnCtx)

  // 检测行首的空格缩进
  const leadingSpaces = line.match(/^(\s*)/)?.[1] || ""
  const indentLevel = Math.floor(leadingSpaces.length / 2) // 每2个空格为一级缩进

  return {
    node: {
      type: "paragraph",
      attrs: indentLevel > 0 ? { textIndent: indentLevel } : undefined,
      // 确保段落至少有内容，避免空内容错误
      content: inlineContent.length > 0 ? inlineContent : [{ type: "text", text: " " }],
    },
    nextIndex: index + 1,
  }
}

function parseInline(text: string, fnCtx?: FootnoteContext): JSONContent[] {
  const content: JSONContent[] = []
  let remaining = text

  while (remaining.length > 0) {
    // 脚注引用 [^id]
    const footnoteMatch = remaining.match(/^\[\^([^\]]+)\]/)
    if (footnoteMatch && fnCtx) {
      const id = footnoteMatch[1]
      if (fnCtx.definitions.has(id)) {
        let label = fnCtx.used.get(id)
        if (label === undefined) {
          label = fnCtx.getNextNumber()
          fnCtx.used.set(id, label)
        }
        content.push({
          type: "footnoteRef",
          attrs: { id, label },
        })
        remaining = remaining.slice(footnoteMatch[0].length)
        continue
      }
    }

    // 行内数学公式 $...$
    const mathMatch = remaining.match(/^\$([^$]+)\$/)
    if (mathMatch) {
      content.push({
        type: "mathInline",
        attrs: { latex: mathMatch[1] },
      })
      remaining = remaining.slice(mathMatch[0].length)
      continue
    }

    // 行内代码
    const codeMatch = remaining.match(/^`([^`]+)`/)
    if (codeMatch) {
      content.push({
        type: "text",
        marks: [{ type: "code" }],
        text: codeMatch[1],
      })
      remaining = remaining.slice(codeMatch[0].length)
      continue
    }

    // 粗体 **...**
    const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/)
    if (boldMatch) {
      content.push({
        type: "text",
        marks: [{ type: "bold" }],
        text: boldMatch[1],
      })
      remaining = remaining.slice(boldMatch[0].length)
      continue
    }

    // 斜体 *...*
    const italicMatch = remaining.match(/^\*([^*]+)\*/)
    if (italicMatch) {
      content.push({
        type: "text",
        marks: [{ type: "italic" }],
        text: italicMatch[1],
      })
      remaining = remaining.slice(italicMatch[0].length)
      continue
    }

    // 删除线 ~~...~~
    const strikeMatch = remaining.match(/^~~([^~]+)~~/)
    if (strikeMatch) {
      content.push({
        type: "text",
        marks: [{ type: "strike" }],
        text: strikeMatch[1],
      })
      remaining = remaining.slice(strikeMatch[0].length)
      continue
    }

    // 上标 ^...^
    const supMatch = remaining.match(/^\^([^^]+)\^/)
    if (supMatch) {
      content.push({
        type: "text",
        marks: [{ type: "superscript" }],
        text: supMatch[1],
      })
      remaining = remaining.slice(supMatch[0].length)
      continue
    }

    // 下标 ~...~
    const subMatch = remaining.match(/^~([^~]+)~/)
    if (subMatch) {
      content.push({
        type: "text",
        marks: [{ type: "subscript" }],
        text: subMatch[1],
      })
      remaining = remaining.slice(subMatch[0].length)
      continue
    }

    // 链接 [text](url)
    const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/)
    if (linkMatch) {
      content.push({
        type: "text",
        marks: [{ type: "link", attrs: { href: linkMatch[2] } }],
        text: linkMatch[1],
      })
      remaining = remaining.slice(linkMatch[0].length)
      continue
    }

    // 图片 ![alt](src) 或 HTML img 标签
    const imgMatch = remaining.match(/^!\[([^\]]*)\]\(([^)]+)\)/)
    if (imgMatch) {
      content.push({
        type: "image",
        attrs: { src: imgMatch[2], alt: imgMatch[1] },
      })
      remaining = remaining.slice(imgMatch[0].length)
      continue
    }

    // HTML 图片标签
    const htmlImgMatch = remaining.match(/^<img\s+([^>]+)\s*\/?>/)
    if (htmlImgMatch) {
      const attrs: Record<string, string> = {}
      const attrString = htmlImgMatch[1]
      
      // 解析属性（支持 data-* 属性）
      const attrMatches = attrString.matchAll(/([\w-]+)="([^"]*)"/g)
      for (const match of attrMatches) {
        attrs[match[1]] = match[2]
      }
      
      content.push({
        type: "image",
        attrs: {
          src: attrs.src || "",
          alt: attrs.alt || "",
          width: attrs.width || null,
          style: attrs.style || null,
          class: attrs.class || null,
          title: attrs.title || null,
          "data-align": attrs["data-align"] || null,
        },
      })
      remaining = remaining.slice(htmlImgMatch[0].length)
      continue
    }

    // 普通文本（取到下一个特殊字符）
    const textMatch = remaining.match(/^[^`*~\[!^$]+/)
    if (textMatch) {
      // 只添加非空文本节点
      if (textMatch[0]) {
        content.push({
          type: "text",
          text: textMatch[0],
        })
      }
      remaining = remaining.slice(textMatch[0].length)
      continue
    }

    // 单个特殊字符
    content.push({
      type: "text",
      text: remaining[0],
    })
    remaining = remaining.slice(1)
  }

  // 过滤掉空文本节点
  return content.filter(node => {
    if (node.type === "text") {
      return node.text && node.text.length > 0
    }
    return true
  })
}


function parseCodeBlock(lines: string[], index: number): ParseResult {
  const firstLine = lines[index]
  const langMatch = firstLine.match(/^```(\w*)/)
  const language = langMatch ? langMatch[1] : ""

  // Mermaid 特殊处理
  if (language === "mermaid") {
    const codeLines: string[] = []
    let i = index + 1
    while (i < lines.length && !lines[i].startsWith("```")) {
      codeLines.push(lines[i])
      i++
    }
    return {
      node: {
        type: "mermaid",
        attrs: { code: codeLines.join("\n") },
      },
      nextIndex: i + 1,
    }
  }

  // 普通代码块
  const codeLines: string[] = []
  let i = index + 1
  while (i < lines.length && !lines[i].startsWith("```")) {
    codeLines.push(lines[i])
    i++
  }

  return {
    node: {
      type: "codeBlock",
      attrs: { language },
      content: [{ type: "text", text: codeLines.join("\n") }],
    },
    nextIndex: i + 1,
  }
}

function parseMathBlock(lines: string[], index: number): ParseResult {
  const mathLines: string[] = []
  let i = index + 1

  const firstLine = lines[index]
  // 单行数学公式 $$...$$
  if (firstLine.length > 4 && firstLine.endsWith("$$")) {
    return {
      node: {
        type: "mathBlock",
        attrs: { latex: firstLine.slice(2, -2).trim() },
      },
      nextIndex: index + 1,
    }
  }

  // 多行数学公式，查找结束的 $$
  while (i < lines.length && !lines[i].startsWith("$$")) {
    mathLines.push(lines[i])
    i++
  }

  // 如果找不到结束标记，返回 null 避免无限循环
  if (i >= lines.length) {
    return {
      node: {
        type: "paragraph",
        content: [{ type: "text", text: firstLine }],
      },
      nextIndex: index + 1,
    }
  }

  return {
    node: {
      type: "mathBlock",
      attrs: { latex: mathLines.join("\n") },
    },
    nextIndex: i + 1,
  }
}

function parseTaskList(lines: string[], index: number, fnCtx?: FootnoteContext): ParseResult {
  const items: JSONContent[] = []
  let i = index

  while (i < lines.length) {
    const line = lines[i]
    const match = line.match(/^(\s*)- \[([ xX])\]\s*(.*)$/)

    if (!match) {
      if (line.trim() === "") {
        i++
        continue
      }
      break
    }

    const indent = match[1].length
    const checked = match[2].toLowerCase() === "x"
    const text = match[3]

    const itemContent: JSONContent[] = [
      {
        type: "paragraph",
        content: parseInline(text, fnCtx),
      },
    ]

    i++

    if (i < lines.length) {
      const nextMatch = lines[i].match(/^(\s*)- \[[ xX]\]/)
      if (nextMatch && nextMatch[1].length > indent) {
        const nested = parseTaskList(lines, i, fnCtx)
        if (nested.node) {
          itemContent.push(nested.node)
        }
        i = nested.nextIndex
      }
    }

    items.push({
      type: "taskItem",
      attrs: { checked },
      content: itemContent,
    })
  }

  return {
    node: {
      type: "taskList",
      content: items,
    },
    nextIndex: i,
  }
}

function parseBulletList(lines: string[], index: number, baseIndent: number = 0, fnCtx?: FootnoteContext): ParseResult {
  const items: JSONContent[] = []
  let i = index

  while (i < lines.length) {
    const line = lines[i]
    const match = line.match(/^(\s*)[-*+]\s+(.*)$/)

    if (!match) {
      if (line.trim() === "") {
        i++
        continue
      }
      break
    }

    const indent = match[1].length

    // 如果缩进不匹配，停止解析但确保至少处理一行
    if (indent < baseIndent) break
    if (indent > baseIndent) {
      // 如果还没有处理任何项目，至少处理当前行作为段落
      if (items.length === 0) {
        return {
          node: {
            type: "paragraph",
            content: parseInline(line, fnCtx),
          },
          nextIndex: index + 1,
        }
      }
      break
    }

    const itemContent: JSONContent[] = [
      {
        type: "paragraph",
        content: parseInline(match[2], fnCtx),
      },
    ]
    i++

    if (i < lines.length) {
      const nextLine = lines[i]
      const nextBulletMatch = nextLine.match(/^(\s*)[-*+]\s/)
      if (nextBulletMatch && nextBulletMatch[1].length > indent) {
        const nested = parseBulletList(lines, i, nextBulletMatch[1].length, fnCtx)
        if (nested.node) {
          itemContent.push(nested.node)
        }
        i = nested.nextIndex
      } else {
        const nextOrderedMatch = nextLine.match(/^(\s*)\d+\.\s/)
        if (nextOrderedMatch && nextOrderedMatch[1].length > indent) {
          const nested = parseOrderedList(lines, i, nextOrderedMatch[1].length, fnCtx)
          if (nested.node) {
            itemContent.push(nested.node)
          }
          i = nested.nextIndex
        }
      }
    }

    items.push({
      type: "listItem",
      content: itemContent,
    })
  }

  return {
    node: {
      type: "bulletList",
      content: items,
    },
    nextIndex: i,
  }
}

function parseOrderedList(lines: string[], index: number, baseIndent: number = 0, fnCtx?: FootnoteContext): ParseResult {
  const items: JSONContent[] = []
  let i = index

  while (i < lines.length) {
    const line = lines[i]
    const match = line.match(/^(\s*)\d+\.\s+(.*)$/)

    if (!match) {
      if (line.trim() === "") {
        i++
        continue
      }
      break
    }

    const indent = match[1].length

    // 如果缩进不匹配，停止解析但确保至少处理一行
    if (indent < baseIndent) break
    if (indent > baseIndent) {
      // 如果还没有处理任何项目，至少处理当前行作为段落
      if (items.length === 0) {
        return {
          node: {
            type: "paragraph",
            content: parseInline(line, fnCtx),
          },
          nextIndex: index + 1,
        }
      }
      break
    }

    const itemContent: JSONContent[] = [
      {
        type: "paragraph",
        content: parseInline(match[2], fnCtx),
      },
    ]
    i++

    if (i < lines.length) {
      const nextLine = lines[i]
      const nextOrderedMatch = nextLine.match(/^(\s*)\d+\.\s/)
      if (nextOrderedMatch && nextOrderedMatch[1].length > indent) {
        const nested = parseOrderedList(lines, i, nextOrderedMatch[1].length, fnCtx)
        if (nested.node) {
          itemContent.push(nested.node)
        }
        i = nested.nextIndex
      } else {
        const nextBulletMatch = nextLine.match(/^(\s*)[-*+]\s/)
        if (nextBulletMatch && nextBulletMatch[1].length > indent) {
          const nested = parseBulletList(lines, i, nextBulletMatch[1].length, fnCtx)
          if (nested.node) {
            itemContent.push(nested.node)
          }
          i = nested.nextIndex
        }
      }
    }

    items.push({
      type: "listItem",
      content: itemContent,
    })
  }

  return {
    node: {
      type: "orderedList",
      content: items,
    },
    nextIndex: i,
  }
}

function parseBlockquote(lines: string[], index: number, fnCtx?: FootnoteContext): ParseResult {
  const quoteLines: string[] = []
  let i = index

  while (i < lines.length && lines[i].startsWith(">")) {
    quoteLines.push(lines[i].replace(/^>\s?/, ""))
    i++
  }

  const content: JSONContent[] = []
  let j = 0
  while (j < quoteLines.length) {
    const line = quoteLines[j]

    if (line.trim() === "") {
      j++
      continue
    }

    if (line.startsWith(">")) {
      const nestedResult = parseBlockquote(quoteLines, j, fnCtx)
      if (nestedResult.node) {
        content.push(nestedResult.node)
      }
      j = nestedResult.nextIndex
      continue
    }

    const paragraphLines: string[] = []
    while (j < quoteLines.length && quoteLines[j].trim() !== "" && !quoteLines[j].startsWith(">")) {
      paragraphLines.push(quoteLines[j])
      j++
    }
    if (paragraphLines.length > 0) {
      content.push({
        type: "paragraph",
        content: parseInline(paragraphLines.join(" "), fnCtx),
      })
    }
  }

  return {
    node: {
      type: "blockquote",
      content: content.length > 0 ? content : [{ type: "paragraph" }],
    },
    nextIndex: i,
  }
}

function parseTable(lines: string[], index: number, fnCtx?: FootnoteContext): ParseResult {
  const rows: JSONContent[] = []
  let i = index
  let isFirstRow = true
  let maxColumns = 0
  const tableRows: string[][] = []

  // 第一遍：收集所有表格行并确定最大列数
  while (i < lines.length) {
    const line = lines[i].trim()

    if (!line.startsWith("|")) break

    if (line.match(/^\|[\s\-:|]+\|?$/)) {
      i++
      continue
    }

    let cells = line.split("|")
    if (cells[0].trim() === "") cells = cells.slice(1)
    if (cells[cells.length - 1].trim() === "") cells = cells.slice(0, -1)
    cells = cells.map((cell) => cell.trim())

    if (cells.length === 0 || cells.every(c => c.match(/^[\s\-:]*$/))) {
      i++
      continue
    }

    tableRows.push(cells)
    maxColumns = Math.max(maxColumns, cells.length)
    i++
  }

  // 第二遍：确保所有行都有相同的列数，并创建JSONContent
  isFirstRow = true
  for (const cells of tableRows) {
    // 补齐缺失的列
    while (cells.length < maxColumns) {
      cells.push("")
    }

    const cellNodes: JSONContent[] = cells.map((cellContent) => {
      const inlineContent = parseInline(cellContent, fnCtx)
      return {
        type: isFirstRow ? "tableHeader" : "tableCell",
        content: [
          {
            type: "paragraph",
            content: inlineContent.length > 0 ? inlineContent : [{ type: "text", text: " " }],
          },
        ],
      }
    })

    rows.push({
      type: "tableRow",
      content: cellNodes,
    })

    isFirstRow = false
  }

  return {
    node: {
      type: "table",
      content: rows,
    },
    nextIndex: i,
  }
}

function parseDetails(lines: string[], index: number, fnCtx?: FootnoteContext): ParseResult {
  let summary = "详情"
  const contentLines: string[] = []
  let i = index + 1
  let isOpen = false

  // 检查是否有 open 属性
  const detailsLine = lines[index]
  if (detailsLine.includes("open")) {
    isOpen = true
  }

  // 查找 summary
  while (i < lines.length) {
    const line = lines[i]
    const summaryMatch = line.match(/<summary>(.+)<\/summary>/)
    if (summaryMatch) {
      summary = summaryMatch[1]
      i++
      break
    }
    if (line.includes("</details>")) break
    i++
  }

  // 收集内容
  while (i < lines.length && !lines[i].includes("</details>")) {
    const line = lines[i].trim()
    if (line) { // 只添加非空行
      contentLines.push(lines[i])
    }
    i++
  }

  const innerContent: JSONContent[] = []
  let j = 0
  while (j < contentLines.length) {
    const result = parseLine(contentLines, j, fnCtx)
    if (result.node) {
      innerContent.push(result.node)
    }
    j = result.nextIndex
  }

  const detailsContent: JSONContent[] = [
    {
      type: "detailsSummary",
      content: parseInline(summary, fnCtx),
    },
  ]

  if (innerContent.length > 0) {
    detailsContent.push(...innerContent)
  } else {
    detailsContent.push({ 
      type: "paragraph",
      content: [{ type: "text", text: "在这里添加折叠内容..." }]
    })
  }

  return {
    node: {
      type: "details",
      attrs: { open: isOpen },
      content: detailsContent,
    },
    nextIndex: i + 1,
  }
}
