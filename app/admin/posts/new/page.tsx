import { Editor } from "@/components/editor"
import { getContentConfig } from "@/lib/content-config"

export default async function NewPostPage() {
  const contentConfig = await getContentConfig()
  return <Editor contentConfig={contentConfig} />
}
