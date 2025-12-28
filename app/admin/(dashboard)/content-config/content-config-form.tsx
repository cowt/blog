"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { ContentThemeSelector } from "@/components/admin/content-theme-selector"
import { ContentStyleConfig } from "@/lib/content-styles"
import { saveContentConfig } from "@/lib/content-config"

interface ContentConfigFormProps {
  initialConfig: ContentStyleConfig
}

export function ContentConfigForm({ initialConfig }: ContentConfigFormProps) {
  const [config, setConfig] = useState<ContentStyleConfig>(initialConfig)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await saveContentConfig(config)
      toast.success("内容样式配置已保存")
    } catch (error) {
      console.error("Failed to save content config:", error)
      toast.error("保存失败，请重试")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <ContentThemeSelector
        currentConfig={config}
        onConfigChange={setConfig}
      />
      
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "保存中..." : "保存配置"}
        </Button>
      </div>
    </div>
  )
}