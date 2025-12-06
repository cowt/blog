// Markdown utilities

/**
 * 预处理 Markdown 内容
 * - 转换上标语法 ^text^ -> <sup>text</sup>
 * - 转换下标语法 ~text~ -> <sub>text</sub>
 * - 注意：需要在 remark-gfm 处理删除线之前转换
 */
export function convertCollapsibleShortcodes(markdown: string) {
  let result = markdown

  // 保护代码块，避免内部被转换
  const codeBlocks: string[] = []
  result = result.replace(/```[\s\S]*?```/g, (match) => {
    const index = codeBlocks.length
    codeBlocks.push(match)
    return `__CODE_BLOCK_${index}__`
  })

  // 保护行内代码
  const inlineCodes: string[] = []
  result = result.replace(/`[^`]+`/g, (match) => {
    const index = inlineCodes.length
    inlineCodes.push(match)
    return `__INLINE_CODE_${index}__`
  })

  // 先保护删除线 ~~text~~ 避免被下标匹配
  const strikethroughs: string[] = []
  result = result.replace(/~~([^~]+)~~/g, (match) => {
    const index = strikethroughs.length
    strikethroughs.push(match)
    return `__STRIKE_${index}__`
  })

  // 转换上标 ^text^ -> <sup>text</sup>
  result = result.replace(/\^([^^]+)\^/g, '<sup>$1</sup>')

  // 转换下标 ~text~ -> <sub>text</sub>
  result = result.replace(/~([^~]+)~/g, '<sub>$1</sub>')

  // 恢复删除线
  strikethroughs.forEach((strike, index) => {
    result = result.replace(`__STRIKE_${index}__`, strike)
  })

  // 恢复行内代码
  inlineCodes.forEach((code, index) => {
    result = result.replace(`__INLINE_CODE_${index}__`, code)
  })

  // 恢复代码块
  codeBlocks.forEach((block, index) => {
    result = result.replace(`__CODE_BLOCK_${index}__`, block)
  })

  return result
}
