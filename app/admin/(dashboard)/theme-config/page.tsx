"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
    announcement: {
      enabled: false,
      message: "",
      link: "",
      linkText: "",
      type: "info",
      scrolling: false,
      dismissible: true,
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

      <Card>
        <CardHeader>
          <CardTitle>公告横幅</CardTitle>
          <CardDescription>在网站顶部显示公告信息</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="announcementEnabled">启用公告</Label>
            <Switch
              id="announcementEnabled"
              checked={config.announcement?.enabled || false}
              onCheckedChange={(checked) =>
                setConfig({
                  ...config,
                  announcement: { ...config.announcement, enabled: checked, message: config.announcement?.message || "" },
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="announcementMessage">公告内容</Label>
            <Input
              id="announcementMessage"
              value={config.announcement?.message || ""}
              onChange={(e) =>
                setConfig({
                  ...config,
                  announcement: { ...config.announcement, enabled: config.announcement?.enabled || false, message: e.target.value },
                })
              }
              placeholder="输入公告内容..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="announcementLink">链接地址（可选）</Label>
              <Input
                id="announcementLink"
                value={config.announcement?.link || ""}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    announcement: { ...config.announcement, enabled: config.announcement?.enabled || false, message: config.announcement?.message || "", link: e.target.value },
                  })
                }
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="announcementLinkText">链接文字（可选）</Label>
              <Input
                id="announcementLinkText"
                value={config.announcement?.linkText || ""}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    announcement: { ...config.announcement, enabled: config.announcement?.enabled || false, message: config.announcement?.message || "", linkText: e.target.value },
                  })
                }
                placeholder="了解更多"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="announcementType">公告类型</Label>
            <Select
              value={config.announcement?.type || "info"}
              onValueChange={(value: "info" | "warning" | "error" | "success") =>
                setConfig({
                  ...config,
                  announcement: { ...config.announcement, enabled: config.announcement?.enabled || false, message: config.announcement?.message || "", type: value },
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="info">信息（蓝色）</SelectItem>
                <SelectItem value="success">成功（绿色）</SelectItem>
                <SelectItem value="warning">警告（黄色）</SelectItem>
                <SelectItem value="error">错误（红色）</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="announcementScrolling">滚动效果</Label>
              <p className="text-sm text-muted-foreground">启用后公告文字会滚动显示</p>
            </div>
            <Switch
              id="announcementScrolling"
              checked={config.announcement?.scrolling || false}
              onCheckedChange={(checked) =>
                setConfig({
                  ...config,
                  announcement: { ...config.announcement, enabled: config.announcement?.enabled || false, message: config.announcement?.message || "", scrolling: checked },
                })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="announcementDismissible">允许关闭</Label>
              <p className="text-sm text-muted-foreground">用户可以点击关闭按钮隐藏公告</p>
            </div>
            <Switch
              id="announcementDismissible"
              checked={config.announcement?.dismissible !== false}
              onCheckedChange={(checked) =>
                setConfig({
                  ...config,
                  announcement: { ...config.announcement, enabled: config.announcement?.enabled || false, message: config.announcement?.message || "", dismissible: checked },
                })
              }
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
