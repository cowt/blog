/**
 * 简单的 Markdown 到 HTML 转换器（用于导出）
 */
export function markdownToHtml(markdown: string): string {
  let html = markdown

  // 代码块（先处理，避免内部被转换）
  const codeBlocks: string[] = []
  html = html.replace(/```(\w*)\n([\s\S]*?)\n```/g, (_, lang, code) => {
    const index = codeBlocks.length
    const langClass = lang ? ` class="language-${lang}"` : ""
    codeBlocks.push(`<pre><code${langClass}>${escapeHtml(code)}</code></pre>`)
    return `__CODE_BLOCK_${index}__`
  })

  // 提取并移除脚注定义（必须在脚注引用替换之前）
  const footnoteMap = new Map<string, string>()
  html = html.replace(/^\[\^([^\]]+)\](?::[ \t]*|[ \t]+)(.+)$/gm, (_match, id, content) => {
    footnoteMap.set(id, content)
    return ''
  })

  // 行内代码
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>")

  // 数学公式块
  html = html.replace(/\$\$\n?([\s\S]*?)\n?\$\$/g, '<div class="math-block">$$$$1$$</div>')

  // 行内数学公式
  html = html.replace(/\$([^$\n]+)\$/g, '<span class="math-inline">$$$1$$</span>')

  // 标题
  html = html.replace(/^######\s+(.+)$/gm, "<h6>$1</h6>")
  html = html.replace(/^#####\s+(.+)$/gm, "<h5>$1</h5>")
  html = html.replace(/^####\s+(.+)$/gm, "<h4>$1</h4>")
  html = html.replace(/^###\s+(.+)$/gm, "<h3>$1</h3>")
  html = html.replace(/^##\s+(.+)$/gm, "<h2>$1</h2>")
  html = html.replace(/^#\s+(.+)$/gm, "<h1>$1</h1>")

  // 粗体和斜体
  html = html.replace(/\*\*\*([^*]+)\*\*\*/g, "<strong><em>$1</em></strong>")
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
  html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>")

  // 上标 ^...^ (在删除线之前处理)
  html = html.replace(/\^([^^]+)\^/g, "<sup>$1</sup>")

  // 下标 ~...~ (在删除线之前处理，使用负向断言避免匹配 ~~)
  html = html.replace(/(?<!~)~([^~]+)~(?!~)/g, "<sub>$1</sub>")

  // 删除线 ~~...~~
  html = html.replace(/~~([^~]+)~~/g, "<del>$1</del>")

  // 链接
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')

  // 脚注引用 [^id]
  let footnoteRefCounter = 0
  html = html.replace(/\[\^([^\]]+)\]/g, (_match, id) => {
    if (footnoteMap.has(id)) {
      footnoteRefCounter++
      return `<sup class="footnote-ref" id="fnref-${id}" data-footnote-id="${id}"><a href="#fn-${id}">${footnoteRefCounter}</a></sup>`
    }
    return `<sup class="footnote-ref">${id}</sup>`
  })

  // 图片
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')

  // 引用
  html = html.replace(/^>\s*(.+)$/gm, "<blockquote>$1</blockquote>")
  // 合并连续的 blockquote
  html = html.replace(/<\/blockquote>\n<blockquote>/g, "\n")

  // 分割线
  html = html.replace(/^(-{3,}|\*{3,}|_{3,})$/gm, "<hr>")

  // 表格处理（在列表之前处理）
  html = processMarkdownTables(html)

  // 任务列表
  html = html.replace(/^(\s*)- \[x\]\s+(.+)$/gim, '$1<li class="task-item checked"><input type="checkbox" checked disabled> $2</li>')
  html = html.replace(/^(\s*)- \[ \]\s+(.+)$/gim, '$1<li class="task-item"><input type="checkbox" disabled> $2</li>')

  // 无序列表
  html = html.replace(/^(\s*)[-*+]\s+(.+)$/gm, "$1<li>$2</li>")

  // 有序列表
  html = html.replace(/^(\s*)\d+\.\s+(.+)$/gm, "$1<li>$2</li>")

  // 包装列表项
  html = wrapListItems(html)

  // 段落（处理剩余的非空行）
  const lines = html.split("\n")
  const result: string[] = []
  let inParagraph = false

  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed === "") {
      if (inParagraph) {
        result.push("</p>")
        inParagraph = false
      }
      continue
    }

    // 跳过已经是 HTML 标签的行
    if (
      trimmed.startsWith("<h") ||
      trimmed.startsWith("<p") ||
      trimmed.startsWith("<ul") ||
      trimmed.startsWith("<ol") ||
      trimmed.startsWith("<li") ||
      trimmed.startsWith("<blockquote") ||
      trimmed.startsWith("<pre") ||
      trimmed.startsWith("<hr") ||
      trimmed.startsWith("<div") ||
      trimmed.startsWith("<table") ||
      trimmed.startsWith("<section") ||
      trimmed.startsWith("<sup") ||
      trimmed.startsWith("</") ||
      trimmed.startsWith("__CODE_BLOCK_")
    ) {
      if (inParagraph) {
        result.push("</p>")
        inParagraph = false
      }
      result.push(line)
      continue
    }

    if (!inParagraph) {
      result.push("<p>" + trimmed)
      inParagraph = true
    } else {
      result.push(" " + trimmed)
    }
  }

  if (inParagraph) {
    result.push("</p>")
  }

  html = result.join("\n")

  // 恢复代码块
  codeBlocks.forEach((block, index) => {
    html = html.replace(`__CODE_BLOCK_${index}__`, block)
  })

  // 在文档末尾添加脚注列表
  if (footnoteMap.size > 0) {
    const items: string[] = []
    for (const [id, content] of footnoteMap) {
      // 将裸 URL 转换为链接，显示文本 URL decode 中文
      const linkedContent = content.replace(
        /(https?:\/\/[^\s<>\[\]()]+)/g,
        (url) => {
          let display: string
          try { display = decodeURI(url) } catch { display = url }
          return `<a href="${url}" target="_blank" rel="noopener noreferrer">${display}</a>`
        }
      )
      items.push(`<li class="footnote-item" id="fn-${id}"><span class="footnote-content">${linkedContent}</span> <a href="#fnref-${id}" class="footnote-backref" data-footnote-backref="${id}">↩</a></li>`)
    }
    html += '\n\n<section class="footnotes">\n<ol class="footnotes-list">\n' + items.join('\n') + '\n</ol>\n</section>'
  }

  return html
}

function processMarkdownTables(html: string): string {
  const lines = html.split('\n')
  const result: string[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    
    // 检查是否是表格行（包含 | 分隔符，且不是空行）
    if (line.trim().includes('|') && line.trim() !== '' && !line.trim().startsWith('```')) {
      const tableLines: string[] = []
      let j = i
      
      // 收集连续的表格行
      while (j < lines.length) {
        const currentLine = lines[j].trim()
        // 如果是空行，跳过但继续检查下一行
        if (currentLine === '') {
          j++
          continue
        }
        // 如果包含 | 且不是代码块，认为是表格行
        if (currentLine.includes('|') && !currentLine.startsWith('```')) {
          tableLines.push(lines[j])
          j++
        } else {
          // 不是表格行，停止收集
          break
        }
      }
      
      if (tableLines.length >= 1) { // 改为至少1行就处理
        // 转换表格
        const tableHtml = convertTableToHtml(tableLines)
        result.push(tableHtml)
        i = j
        continue
      }
    }
    
    result.push(line)
    i++
  }

  return result.join('\n')
}

function convertTableToHtml(tableLines: string[]): string {
  const rows: string[][] = []
  let hasHeader = false
  let maxColumns = 0
  
  for (let i = 0; i < tableLines.length; i++) {
    const line = tableLines[i].trim()
    
    // 跳过分隔行（如 |---|---|）
    if (line.match(/^\|[\s\-\|:]+\|$/)) {
      hasHeader = true
      continue
    }
    
    // 解析表格行
    const cells = line
      .split('|')
      .slice(1, -1) // 移除首尾空元素
      .map(cell => cell.trim())
    
    if (cells.length > 0) {
      rows.push(cells)
      maxColumns = Math.max(maxColumns, cells.length)
    }
  }
  
  if (rows.length === 0) return ''
  
  // 确保所有行都有相同的列数
  rows.forEach(row => {
    while (row.length < maxColumns) {
      row.push('') // 补充空单元格
    }
  })
  
  let html = '<table>\n'
  
  // 如果有标题行
  if (hasHeader && rows.length > 0) {
    html += '  <thead>\n'
    html += '    <tr>\n'
    rows[0].forEach(cell => {
      html += `      <th>${cell}</th>\n`
    })
    html += '    </tr>\n'
    html += '  </thead>\n'
    
    if (rows.length > 1) {
      html += '  <tbody>\n'
      for (let i = 1; i < rows.length; i++) {
        html += '    <tr>\n'
        rows[i].forEach(cell => {
          html += `      <td>${cell}</td>\n`
        })
        html += '    </tr>\n'
      }
      html += '  </tbody>\n'
    }
  } else {
    // 没有标题行，所有行都是数据行
    html += '  <tbody>\n'
    rows.forEach(row => {
      html += '    <tr>\n'
      row.forEach(cell => {
        html += `      <td>${cell}</td>\n`
      })
      html += '    </tr>\n'
    })
    html += '  </tbody>\n'
  }
  
  html += '</table>'
  return html
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

function wrapListItems(html: string): string {
  const lines = html.split("\n")
  const result: string[] = []
  let inList = false
  let listType = ""

  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed.startsWith('<li class="task-item')) {
      if (!inList || listType !== "task") {
        if (inList) result.push(listType === "ol" ? "</ol>" : "</ul>")
        result.push('<ul class="task-list">')
        inList = true
        listType = "task"
      }
      result.push(line)
    } else if (trimmed.startsWith("<li>")) {
      if (!inList) {
        result.push("<ul>")
        inList = true
        listType = "ul"
      }
      result.push(line)
    } else {
      if (inList) {
        result.push(listType === "ol" ? "</ol>" : "</ul>")
        inList = false
        listType = ""
      }
      result.push(line)
    }
  }

  if (inList) {
    result.push(listType === "ol" ? "</ol>" : "</ul>")
  }

  return result.join("\n")
}
