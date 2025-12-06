import { uploadFile, getFile, deleteFile } from "./storage"
import type { Post, PostMeta } from "@/types"

const INDEX_FILE = "posts/index.json"

export async function getPosts(): Promise<PostMeta[]> {
  try {
    const json = await getFile(INDEX_FILE)
    if (!json) {
      // 索引文件不存在,初始化为空数组
      await uploadFile(INDEX_FILE, JSON.stringify([]), "application/json")
      return []
    }
    return JSON.parse(json)
  } catch (e) {
    console.error("Error fetching posts index:", e)
    return []
  }
}

export async function getPost(slug: string): Promise<Post | null> {
  try {
    const json = await getFile(`posts/${slug}.json`)
    if (!json) return null
    return JSON.parse(json)
  } catch (e) {
    console.error(`Error fetching post ${slug}:`, e)
    return null
  }
}

export async function savePost(post: Post) {
  // 1. Save the post content
  await uploadFile(`posts/${post.slug}.json`, JSON.stringify(post), "application/json")

  // 2. Update the index
  const posts = await getPosts()
  const existingIndex = posts.findIndex((p) => p.slug === post.slug)

  const meta: PostMeta = {
    slug: post.slug,
    title: post.title,
    createdAt: post.createdAt,
    published: post.published,
    excerpt: post.excerpt,
    coverImage: post.coverImage,
    showInList: post.showInList,
    tags: post.tags,
  }

  if (existingIndex >= 0) {
    posts[existingIndex] = meta
  } else {
    posts.unshift(meta)
  }

  await uploadFile(INDEX_FILE, JSON.stringify(posts), "application/json")

  return post
}

export async function unpublishPost(slug: string) {
  // 1. Get the post
  const post = await getPost(slug)
  if (!post) {
    throw new Error("Post not found")
  }

  // 2. Update published status
  post.published = false
  await uploadFile(`posts/${slug}.json`, JSON.stringify(post), "application/json")

  // 3. Update the index
  const posts = await getPosts()
  const existingIndex = posts.findIndex((p) => p.slug === slug)
  
  if (existingIndex >= 0) {
    posts[existingIndex].published = false
    await uploadFile(INDEX_FILE, JSON.stringify(posts), "application/json")
  }
}

export async function deletePost(slug: string) {
  // 1. Delete the post file
  await deleteFile(`posts/${slug}.json`)

  // 2. Update the index
  const posts = await getPosts()
  const newPosts = posts.filter((p) => p.slug !== slug)
  
  await uploadFile(INDEX_FILE, JSON.stringify(newPosts), "application/json")
}
