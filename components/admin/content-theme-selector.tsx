"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ContentTheme, ContentStyleConfig, getContentClassName } from "@/lib/content-styles"
import { cn } from "@/lib/utils"

interface ContentThemeSelectorProps {
  currentConfig: ContentStyleConfig
  onConfigChange: (config: ContentStyleConfig) => void
}

const themeOptions: { value: ContentTheme; label: string; description: string }[] = [
  {
    value: "default",
    label: "默认主题",
    description: "自然绿色调，渐变装饰线，温暖清新"
  },
  {
    value: "minimal",
    label: "极简主题",
    description: "纯粹黑白，克制内敛，无装饰元素"
  },
  {
    value: "magazine",
    label: "杂志主题",
    description: "衬线正文 + 无衬线标题，首字母放大，经典红色强调"
  },
  {
    value: "notion",
    label: "Notion 主题",
    description: "紧凑工具风，蓝色链接下划线，红色行内代码"
  },
  {
    value: "japanese",
    label: "日式简约",
    description: "宽松行距，段落首缩进，居中标题装饰线"
  }
]

const fontSizeOptions = [
  { value: "xs", label: "紧凑 (12px)" },
  { value: "sm", label: "标准 (14px)" },
  { value: "base", label: "大号 (16px)" },
  { value: "lg", label: "特大 (18px)" }
]

const lineHeightOptions = [
  { value: "tight", label: "紧凑 (1.4)" },
  { value: "normal", label: "标准 (1.6)" },
  { value: "relaxed", label: "舒适 (1.8)" },
  { value: "loose", label: "宽松 (2.0)" }
]

const spacingOptions = [
  { value: "tight", label: "紧凑间距" },
  { value: "compact", label: "标准间距" },
  { value: "normal", label: "宽松间距" },
  { value: "loose", label: "特宽间距" }
]

function buildPreviewHTML(): string {
  return [
    '<h1>示例标题</h1>',
    '<p>这是一个段落示例，用于展示当前主题的文本样式和间距效果。中英文混排 Typography 的间距处理也会在此体现。</p>',
    '<h2>二级标题</h2>',
    '<h3>三级标题</h3>',
    '<p>段落中的<strong>加粗文本</strong>和<em>强调文本</em>以及<mark>高亮标记</mark>的样式差异。</p>',
    '<ul><li>列表项目一</li><li>列表项目二</li><li>列表项目三</li></ul>',
    '<blockquote><p>这是一个引用块的示例，展示引用样式。</p></blockquote>',
    '<p><code>inline code</code> 和普通文本的混合效果。</p>',
    '<hr />',
    '<p>分割线上方的内容与下方的内容。</p>',
  ].join('')
}

export function ContentThemeSelector({ currentConfig, onConfigChange }: ContentThemeSelectorProps) {
  const [config, setConfig] = useState<ContentStyleConfig>(currentConfig)

  const handleConfigUpdate = (updates: Partial<ContentStyleConfig>) => {
    const newConfig = { ...config, ...updates }
    setConfig(newConfig)
    onConfigChange(newConfig)
  }

  const selectedTheme = themeOptions.find(t => t.value === config.theme)

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
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {themeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTheme && (
              <p className="text-xs text-muted-foreground">{selectedTheme.description}</p>
            )}
          </div>

          {/* 字体大小 */}
          <div className="space-y-2">
            <Label>字体大小</Label>
            <Select
              value={config.fontSize || "base"}
              onValueChange={(value: "xs" | "sm" | "base" | "lg") => handleConfigUpdate({ fontSize: value })}
            >
              <SelectTrigger className="w-full">
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
              onValueChange={(value: "tight" | "normal" | "relaxed" | "loose") => handleConfigUpdate({ lineHeight: value })}
            >
              <SelectTrigger className="w-full">
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
              onValueChange={(value: "tight" | "compact" | "normal" | "loose") => handleConfigUpdate({ spacing: value })}
            >
              <SelectTrigger className="w-full">
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
          <div className={cn(
            getContentClassName(config),
            "border rounded-lg p-6 bg-background overflow-hidden"
          )}>
            <div dangerouslySetInnerHTML={{ __html: buildPreviewHTML() }} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
