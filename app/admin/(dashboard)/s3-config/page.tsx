"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2, Eye, EyeOff } from "lucide-react"
import type { S3Config } from "@/types"

export default function S3ConfigPage() {
  const [config, setConfig] = useState<S3Config>({
    accessKeyId: "",
    secretAccessKey: "",
    endpoint: "",
    bucketName: "",
    region: "auto",
    publicUrl: "",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showSecretKey, setShowSecretKey] = useState(false)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const response = await fetch("/api/config/s3")
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
      const response = await fetch("/api/config/s3", {
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
        <h1 className="text-3xl font-bold tracking-tight">S3 存储配置</h1>
        <p className="text-muted-foreground mt-1">
          配置 S3 兼容的对象存储服务 (支持 AWS S3、Cloudflare R2 等)
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>存储凭证</CardTitle>
          <CardDescription>配置访问对象存储的凭证信息</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="accessKeyId">Access Key ID</Label>
            <Input
              id="accessKeyId"
              value={config.accessKeyId}
              onChange={(e) => setConfig({ ...config, accessKeyId: e.target.value })}
              placeholder="your-access-key-id"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="secretAccessKey">Secret Access Key</Label>
            <div className="relative">
              <Input
                id="secretAccessKey"
                type={showSecretKey ? "text" : "password"}
                value={config.secretAccessKey}
                onChange={(e) => setConfig({ ...config, secretAccessKey: e.target.value })}
                placeholder="your-secret-access-key"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => setShowSecretKey(!showSecretKey)}
              >
                {showSecretKey ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>存储配置</CardTitle>
          <CardDescription>配置存储桶和访问端点</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="endpoint">Endpoint</Label>
            <Input
              id="endpoint"
              value={config.endpoint}
              onChange={(e) => setConfig({ ...config, endpoint: e.target.value })}
              placeholder="https://your-account-id.r2.cloudflarestorage.com"
            />
            <p className="text-xs text-muted-foreground">
              S3 API 端点地址,例如 Cloudflare R2 的端点
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bucketName">Bucket Name</Label>
            <Input
              id="bucketName"
              value={config.bucketName}
              onChange={(e) => setConfig({ ...config, bucketName: e.target.value })}
              placeholder="my-blog-storage"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="region">Region</Label>
            <Input
              id="region"
              value={config.region || ""}
              onChange={(e) => setConfig({ ...config, region: e.target.value })}
              placeholder="auto"
            />
            <p className="text-xs text-muted-foreground">
              区域设置,Cloudflare R2 使用 "auto"
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="publicUrl">Public URL (可选)</Label>
            <Input
              id="publicUrl"
              value={config.publicUrl || ""}
              onChange={(e) => setConfig({ ...config, publicUrl: e.target.value })}
              placeholder="https://your-domain.com"
            />
            <p className="text-xs text-muted-foreground">
              公开访问的 URL 前缀,用于生成文件的公开访问链接
            </p>
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
