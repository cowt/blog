import { ContentConfigForm } from "./content-config-form"
import { getContentConfig } from "@/lib/content-config"

export default async function ContentConfigPage() {
  const config = await getContentConfig()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">内容样式配置</h1>
        <p className="text-muted-foreground mt-2">
          配置文章内容的显示样式，包括主题、字体大小、行高和间距设置
        </p>
      </div>
      
      <ContentConfigForm initialConfig={config} />
    </div>
  )
}