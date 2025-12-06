/**
 * 统一的内容样式系统
 * 用于文章展示页面和编辑器，确保所见即所得
 */

export type ContentTheme = "default" | "minimal" | "magazine" | "notion"

export interface ContentStyleConfig {
  theme: ContentTheme
  fontSize?: "sm" | "base" | "lg"
  lineHeight?: "normal" | "relaxed" | "loose"
}

/**
 * 基础内容样式类 - 所有主题共享
 */
export const baseContentClass = "content-body"

/**
 * 获取内容区域的样式类名
 */
export function getContentClassName(config: ContentStyleConfig = { theme: "default" }): string {
  const classes = [baseContentClass]
  
  // 主题
  classes.push(`content-theme-${config.theme}`)
  
  // 字体大小
  if (config.fontSize) {
    classes.push(`content-text-${config.fontSize}`)
  }
  
  // 行高
  if (config.lineHeight) {
    classes.push(`content-leading-${config.lineHeight}`)
  }
  
  return classes.join(" ")
}

/**
 * 编辑器专用样式类
 */
export function getEditorClassName(config: ContentStyleConfig = { theme: "default" }): string {
  return `${getContentClassName(config)} content-editor`
}

/**
 * 文章展示专用样式类
 */
export function getArticleClassName(config: ContentStyleConfig = { theme: "default" }): string {
  return `${getContentClassName(config)} content-article`
}

/**
 * 默认配置
 */
export const defaultContentConfig: ContentStyleConfig = {
  theme: "default",
  fontSize: "base",
  lineHeight: "relaxed",
}
