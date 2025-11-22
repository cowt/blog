"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import type { ThemeConfig } from "@/types"

export default function ThemeConfigPage() {
  const [config, setConfig] = useState<ThemeConfig>({
    siteName: "",
    siteDescription: "",
    siteUrl: "",
    logo: "",
    favicon: "",
    theme: {
      primaryColor: "#000000",
      fontFamily: "system-ui",
    },
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const response = await fetch("/api/config/theme")
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
      const response = await fetch("/api/config/theme", {
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
        <h1 className="text-3xl font-bold tracking-tight">网站主题配置</h1>
        <p className="text-muted-foreground mt-1">
          配置网站的基本信息和外观
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>基本信息</CardTitle>
          <CardDescription>网站的基本信息设置</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="siteName">网站名称</Label>
            <Input
              id="siteName"
              value={config.siteName || ""}
              onChange={(e) => setConfig({ ...config, siteName: e.target.value })}
              placeholder="My Blog"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="siteDescription">网站描述</Label>
            <Textarea
              id="siteDescription"
              value={config.siteDescription || ""}
              onChange={(e) => setConfig({ ...config, siteDescription: e.target.value })}
              placeholder="A personal blog built with Next.js"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="siteUrl">网站 URL</Label>
            <Input
              id="siteUrl"
              type="url"
              value={config.siteUrl || ""}
              onChange={(e) => setConfig({ ...config, siteUrl: e.target.value })}
              placeholder="https://example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo">Logo URL</Label>
            <Input
              id="logo"
              type="url"
              value={config.logo || ""}
              onChange={(e) => setConfig({ ...config, logo: e.target.value })}
              placeholder="https://example.com/logo.png"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="favicon">Favicon URL</Label>
            <Input
              id="favicon"
              type="url"
              value={config.favicon || ""}
              onChange={(e) => setConfig({ ...config, favicon: e.target.value })}
              placeholder="https://example.com/favicon.ico"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>主题设置</CardTitle>
          <CardDescription>自定义网站的外观</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="primaryColor">主色调</Label>
            <div className="flex gap-2">
              <Input
                id="primaryColor"
                type="color"
                value={config.theme?.primaryColor || "#000000"}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    theme: { ...config.theme, primaryColor: e.target.value },
                  })
                }
                className="w-20 h-10"
              />
              <Input
                type="text"
                value={config.theme?.primaryColor || "#000000"}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    theme: { ...config.theme, primaryColor: e.target.value },
                  })
                }
                placeholder="#000000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fontFamily">字体</Label>
            <Input
              id="fontFamily"
              value={config.theme?.fontFamily || ""}
              onChange={(e) =>
                setConfig({
                  ...config,
                  theme: { ...config.theme, fontFamily: e.target.value },
                })
              }
              placeholder="system-ui"
            />
          </div>
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
