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

  // 图片
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')

  // 引用
  html = html.replace(/^>\s*(.+)$/gm, "<blockquote>$1</blockquote>")
  // 合并连续的 blockquote
  html = html.replace(/<\/blockquote>\n<blockquote>/g, "\n")

  // 分割线
  html = html.replace(/^(-{3,}|\*{3,}|_{3,})$/gm, "<hr>")

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
