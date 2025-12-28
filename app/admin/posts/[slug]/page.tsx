import { getPost } from "@/lib/posts"
import { Editor } from "@/components/editor"
import { getContentConfig } from "@/lib/content-config"

export default async function EditorPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPost(slug)
  const contentConfig = await getContentConfig()

  return <Editor initialPost={post} newSlug={slug} contentConfig={contentConfig} />
}
