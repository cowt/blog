import { getPost } from "@/lib/posts"
import { Editor } from "@/components/editor"
import { getContentConfig } from "@/lib/content-config"

export default async function EditorPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  // 并行读取文章内容和配置，减少 S3 请求延迟
  const [post, contentConfig] = await Promise.all([
    getPost(slug),
    getContentConfig(),
  ])

  return <Editor initialPost={post} newSlug={slug} contentConfig={contentConfig} />
}
