// 修复已保存文章的 slug
// 运行: node scripts/fix-slugs.mjs

import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3"
import { readFileSync } from "fs"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

// 读取 .env 文件
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const envPath = join(__dirname, "..", ".env")

try {
  const envContent = readFileSync(envPath, "utf-8")
  envContent.split("\n").forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      const value = match[2].trim()
      if (!process.env[key]) {
        process.env[key] = value
      }
    }
  })
} catch (error) {
  console.log("警告: 无法读取 .env 文件，使用现有环境变量")
}

const client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
})

const bucketName = process.env.R2_BUCKET_NAME || "blog-storage"

// 将标题转换为 URL 友好的 slug
function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u4e00-\u9fa5-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function getFile(key) {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    })
    const response = await client.send(command)
    const str = await response.Body?.transformToString()
    return str
  } catch (error) {
    if (error?.Code === "NoSuchKey" || error?.name === "NoSuchKey") {
      return null
    }
    throw error
  }
}

async function uploadFile(key, body, contentType) {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: body,
    ContentType: contentType,
  })
  await client.send(command)
}

async function fixSlugs() {
  console.log("开始修复 slugs...")
  
  // 1. 读取索引文件
  const indexJson = await getFile("posts/index.json")
  if (!indexJson) {
    console.log("没有找到索引文件")
    return
  }
  
  const posts = JSON.parse(indexJson)
  console.log(`找到 ${posts.length} 篇文章`)
  
  const updatedPosts = []
  
  // 2. 处理每篇文章
  for (const postMeta of posts) {
    const oldSlug = postMeta.slug
    const newSlug = slugify(oldSlug)
    
    if (oldSlug === newSlug) {
      console.log(`✓ ${oldSlug} - 无需修复`)
      updatedPosts.push(postMeta)
      continue
    }
    
    console.log(`修复: "${oldSlug}" -> "${newSlug}"`)
    
    // 读取旧文章内容
    const oldPostJson = await getFile(`posts/${oldSlug}.json`)
    if (!oldPostJson) {
      console.log(`  ⚠ 警告: 找不到文章文件 posts/${oldSlug}.json`)
      continue
    }
    
    const post = JSON.parse(oldPostJson)
    
    // 更新 slug
    post.slug = newSlug
    
    // 保存到新位置
    await uploadFile(`posts/${newSlug}.json`, JSON.stringify(post), "application/json")
    console.log(`  ✓ 已保存到 posts/${newSlug}.json`)
    
    // 更新索引中的元数据
    updatedPosts.push({
      ...postMeta,
      slug: newSlug,
    })
  }
  
  // 3. 保存更新后的索引
  await uploadFile("posts/index.json", JSON.stringify(updatedPosts), "application/json")
  console.log("\n✓ 索引文件已更新")
  console.log("修复完成！")
}

fixSlugs().catch(console.error)
