const SUMMARY_PATTERN = /^::>\s*(.*)$/
const CLOSING_PATTERN = /^::>\s*$/
const FALLBACK_SUMMARY = "点击展开"

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

export function convertCollapsibleShortcodes(markdown: string) {
  const lines = markdown.split("\n")
  const output: string[] = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index]
    const summaryMatch = line.match(SUMMARY_PATTERN)

    if (!summaryMatch) {
      output.push(line)
      index++
      continue
    }

    const summaryText = (summaryMatch[1] || "").trim()
    const collected: string[] = []
    index++
    let foundClosing = false

    while (index < lines.length) {
      const probe = lines[index]
      if (probe.match(CLOSING_PATTERN)) {
        foundClosing = true
        index++
        break
      }
      collected.push(probe)
      index++
    }

    if (!foundClosing) {
      output.push(line, ...collected)
      continue
    }

    const summary = escapeHtml(summaryText || FALLBACK_SUMMARY)
    output.push("<details>")
    output.push(`<summary>${summary}</summary>`)
    output.push("")
    if (collected.length > 0) {
      output.push(collected.join("\n"))
    }
    output.push("")
    output.push("</details>")
  }

  return output.join("\n")
}
