import { getPost } from "@/lib/posts"
import { Editor } from "@/components/editor"
import { marked } from "marked"

export default async function EditorPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  let post = await getPost(slug)

  if (post && post.content) {
    // Parse Markdown to HTML for Tiptap
    // Tiptap expects HTML to initialize efficiently, or it treats text as paragraph
    // marked is synchronous
    const html = await marked.parse(post.content)
    // We replace the content with HTML for the editor initialization
    post = { ...post, content: html }
  }

  return <Editor initialPost={post} newSlug={slug} />
}
