"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2, Eye, EyeOff } from "lucide-react"
import type { AIConfig } from "@/types"

export default function AIConfigPage() {
  const [config, setConfig] = useState<AIConfig>({
    baseURL: "https://api.openai.com/v1",
    apiKey: "",
    model: "gpt-4o-mini",
    autoGenerateExcerpt: false,
    autoGenerateCoverImage: false,
    autoGenerateTags: false,
    excerptPrompt: "请为以下文章生成一段简洁的摘要(100-150字),用于SEO和列表预览:\n\n{content}",
    coverImagePrompt: "Generate a beautiful cover image for a blog post with the following title: {title}",
    tagsPrompt: "Based on the following blog post content, suggest 3-5 relevant tags. Return only the tags as a JSON array of strings, without any explanation.\n\nContent:\n{content}",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const response = await fetch("/api/config/ai")
      if (response.ok) {
        const data = await response.json()
        setConfig(data)
      }
    } catch (error) {
      console.error("Failed to load config:", error)
      toast.error("加载配置失败")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/config/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })

      if (response.ok) {
        toast.success("配置保存成功")
      } else {
        throw new Error("Failed to save")
      }
    } catch (error) {
      console.error("Failed to save config:", error)
      toast.error("保存配置失败")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI 相关配置</h1>
        <p className="text-muted-foreground mt-1">
          配置 AI 功能,自动生成文章摘要和封面图
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>API 配置</CardTitle>
          <CardDescription>配置 OpenAI 兼容的 API 接口</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="baseURL">Base URL</Label>
            <Input
              id="baseURL"
              value={config.baseURL}
              onChange={(e) => setConfig({ ...config, baseURL: e.target.value })}
              placeholder="https://api.openai.com/v1"
            />
            <p className="text-xs text-muted-foreground">
              支持 OpenAI 兼容的 API,如 OpenAI、Azure OpenAI、本地部署的模型等
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <div className="relative">
              <Input
                id="apiKey"
                type={showApiKey ? "text" : "password"}
                value={config.apiKey}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                placeholder="sk-..."
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">模型</Label>
            <Input
              id="model"
              value={config.model || ""}
              onChange={(e) => setConfig({ ...config, model: e.target.value })}
              placeholder="gpt-4o-mini"
            />
            <p className="text-xs text-muted-foreground">
              用于生成摘要的模型,如 gpt-4o-mini、gpt-4o 等
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>自动生成设置</CardTitle>
          <CardDescription>配置自动生成功能的开关和提示词</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="autoGenerateExcerpt">自动生成摘要</Label>
              <p className="text-sm text-muted-foreground">
                发布文章时自动生成文章摘要
              </p>
            </div>
            <Switch
              id="autoGenerateExcerpt"
              checked={config.autoGenerateExcerpt}
              onCheckedChange={(checked) =>
                setConfig({ ...config, autoGenerateExcerpt: checked })
              }
            />
          </div>

          {config.autoGenerateExcerpt && (
            <div className="space-y-2">
              <Label htmlFor="excerptPrompt">摘要生成提示词</Label>
              <Textarea
                id="excerptPrompt"
                value={config.excerptPrompt}
                onChange={(e) => setConfig({ ...config, excerptPrompt: e.target.value })}
                placeholder="请为以下文章生成一段简洁的摘要..."
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                使用 {"{content}"} 作为文章内容的占位符
              </p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="autoGenerateCoverImage">自动生成封面图</Label>
              <p className="text-sm text-muted-foreground">
                发布文章时自动生成封面图(使用 DALL-E)
              </p>
            </div>
            <Switch
              id="autoGenerateCoverImage"
              checked={config.autoGenerateCoverImage}
              onCheckedChange={(checked) =>
                setConfig({ ...config, autoGenerateCoverImage: checked })
              }
            />
          </div>

          {config.autoGenerateCoverImage && (
            <div className="space-y-2">
              <Label htmlFor="coverImagePrompt">封面图生成提示词</Label>
              <Textarea
                id="coverImagePrompt"
                value={config.coverImagePrompt}
                onChange={(e) =>
                  setConfig({ ...config, coverImagePrompt: e.target.value })
                }
                placeholder="Generate a beautiful cover image..."
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                使用 {"{title}"} 作为文章标题的占位符
              </p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="autoGenerateTags">自动生成标签</Label>
              <p className="text-sm text-muted-foreground">
                发布文章时自动生成文章标签
              </p>
            </div>
            <Switch
              id="autoGenerateTags"
              checked={config.autoGenerateTags}
              onCheckedChange={(checked) =>
                setConfig({ ...config, autoGenerateTags: checked })
              }
            />
          </div>

          {config.autoGenerateTags && (
            <div className="space-y-2">
              <Label htmlFor="tagsPrompt">标签生成提示词</Label>
              <Textarea
                id="tagsPrompt"
                value={config.tagsPrompt}
                onChange={(e) =>
                  setConfig({ ...config, tagsPrompt: e.target.value })
                }
                placeholder="Based on the following blog post content, suggest 3-5 relevant tags..."
                rows={5}
              />
              <p className="text-xs text-muted-foreground">
                使用 {"{ content}"} 作为文章内容的占位符。建议要求 AI 返回 JSON 数组格式。
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          保存配置
        </Button>
      </div>
    </div>
  )
}
