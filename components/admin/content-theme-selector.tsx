"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ContentTheme, ContentStyleConfig, getContentClassName } from "@/lib/content-styles"

interface ContentThemeSelectorProps {
  currentConfig: ContentStyleConfig
  onConfigChange: (config: ContentStyleConfig) => void
}

const themeOptions: { value: ContentTheme; label: string; description: string }[] = [
  {
    value: "default",
    label: "默认主题",
    description: "平衡的间距和绿色强调色，适合大多数内容"
  },
  {
    value: "minimal",
    label: "极简主题", 
    description: "简洁的设计，去除装饰性元素"
  },
  {
    value: "magazine",
    label: "杂志主题",
    description: "衬线字体和首字母放大，适合长文章"
  },
  {
    value: "notion",
    label: "Notion主题",
    description: "紧凑的布局和蓝色强调色"
  },
  {
    value: "japanese",
    label: "日式简约",
    description: "宽松的间距和优雅的排版，提高可读性"
  }
]

const fontSizeOptions = [
  { value: "sm", label: "小号 (14px)" },
  { value: "base", label: "标准 (16px)" },
  { value: "lg", label: "大号 (18px)" }
]

const lineHeightOptions = [
  { value: "normal", label: "紧凑 (1.6)" },
  { value: "relaxed", label: "舒适 (1.8)" },
  { value: "loose", label: "宽松 (2.0)" }
]

const spacingOptions = [
  { value: "compact", label: "紧凑间距" },
  { value: "normal", label: "标准间距" },
  { value: "loose", label: "宽松间距" }
]

export function ContentThemeSelector({ currentConfig, onConfigChange }: ContentThemeSelectorProps) {
  const [config, setConfig] = useState<ContentStyleConfig>(currentConfig)

  const handleConfigUpdate = (updates: Partial<ContentStyleConfig>) => {
    const newConfig = { ...config, ...updates }
    setConfig(newConfig)
    onConfigChange(newConfig)
  }

  const previewText = `
# 示例标题

这是一个段落示例，用于展示当前主题的文本样式和间距效果。

## 二级标题

- 列表项目一
- 列表项目二
- 列表项目三

> 这是一个引用块的示例，展示引用样式。

\`inline code\` 和普通文本的混合效果。
  `.trim()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>内容主题配置</CardTitle>
          <CardDescription>
            自定义文章内容的显示样式，包括主题、字体大小、行高和间距
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 主题选择 */}
          <div className="space-y-2">
            <Label>主题风格</Label>
            <Select
              value={config.theme}
              onValueChange={(value: ContentTheme) => handleConfigUpdate({ theme: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {themeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-muted-foreground">{option.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 字体大小 */}
          <div className="space-y-2">
            <Label>字体大小</Label>
            <Select
              value={config.fontSize || "base"}
              onValueChange={(value: "sm" | "base" | "lg") => handleConfigUpdate({ fontSize: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fontSizeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 行高 */}
          <div className="space-y-2">
            <Label>行高</Label>
            <Select
              value={config.lineHeight || "relaxed"}
              onValueChange={(value: "normal" | "relaxed" | "loose") => handleConfigUpdate({ lineHeight: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {lineHeightOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 间距 */}
          <div className="space-y-2">
            <Label>间距</Label>
            <Select
              value={config.spacing || "normal"}
              onValueChange={(value: "compact" | "normal" | "loose") => handleConfigUpdate({ spacing: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {spacingOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 预览区域 */}
      <Card>
        <CardHeader>
          <CardTitle>样式预览</CardTitle>
          <CardDescription>
            实时预览当前配置的显示效果
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className={`${getContentClassName(config)} border rounded-lg p-6 bg-background`}>
            <div dangerouslySetInnerHTML={{ __html: previewText.split('\n').map(line => {
              if (line.startsWith('# ')) {
                return `<h1>${line.slice(2)}</h1>`
              } else if (line.startsWith('## ')) {
                return `<h2>${line.slice(3)}</h2>`
              } else if (line.startsWith('- ')) {
                return `<li>${line.slice(2)}</li>`
              } else if (line.startsWith('> ')) {
                return `<blockquote><p>${line.slice(2)}</p></blockquote>`
              } else if (line.includes('`')) {
                return `<p>${line.replace(/`([^`]+)`/g, '<code>$1</code>')}</p>`
              } else if (line.trim()) {
                return `<p>${line}</p>`
              }
              return ''
            }).join('') }} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}