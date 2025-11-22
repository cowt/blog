import { getPost } from "@/lib/posts"
import { Editor } from "@/components/editor"

export default async function EditorPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPost(slug)

  return <Editor initialPost={post} newSlug={slug} />
}
