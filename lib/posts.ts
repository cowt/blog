import { uploadFile, getFile, deleteFile } from "./storage"
import type { Post, PostMeta } from "@/types"
import { unstable_cache, revalidateTag } from "next/cache"

const INDEX_FILE = "posts/index.json"

// 缓存文章索引，5 分钟过期
const getCachedPosts = unstable_cache(
  async () => {
    try {
      const json = await getFile(INDEX_FILE)
      if (!json) {
        // 索引文件不存在,初始化为空数组
        await uploadFile(INDEX_FILE, JSON.stringify([]), "application/json")
        return []
      }
      return JSON.parse(json) as PostMeta[]
    } catch (e) {
      console.error("Error fetching posts index:", e)
      return []
    }
  },
  ["posts-index"],
  { revalidate: 300, tags: ["posts"] }
)

export async function getPosts(): Promise<PostMeta[]> {
  return getCachedPosts()
}

// 缓存单篇文章，5 分钟过期
export async function getPost(slug: string): Promise<Post | null> {
  const getCached = unstable_cache(
    async () => {
      try {
        const json = await getFile(`posts/${slug}.json`)
        if (!json) return null
        return JSON.parse(json) as Post
      } catch (e) {
        console.error(`Error fetching post ${slug}:`, e)
        return null
      }
    },
    [`post-${slug}`],
    { revalidate: 300, tags: ["posts", `post-${slug}`] }
  )
  
  return getCached()
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

  // 清除缓存
  revalidateTag("posts", "max")
  revalidateTag(`post-${post.slug}`, "max")

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

  // 清除缓存
  revalidateTag("posts", "max")
  revalidateTag(`post-${slug}`, "max")
}

export async function deletePost(slug: string) {
  // 1. Delete the post file
  await deleteFile(`posts/${slug}.json`)

  // 2. Update the index
  const posts = await getPosts()
  const newPosts = posts.filter((p) => p.slug !== slug)

  await uploadFile(INDEX_FILE, JSON.stringify(newPosts), "application/json")

  // 清除缓存
  revalidateTag("posts", "max")
  revalidateTag(`post-${slug}`, "max")
}
