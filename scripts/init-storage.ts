import { uploadFile } from "../lib/storage"

/**
 * 初始化存储
 * 创建空的文章索引文件
 */
async function initStorage() {
  try {
    console.log("Initializing storage...")
    
    // 创建空的文章索引
    await uploadFile("posts/index.json", JSON.stringify([]), "application/json")
    
    console.log("✅ Storage initialized successfully!")
    console.log("Created: posts/index.json")
  } catch (error) {
    console.error("❌ Failed to initialize storage:", error)
    process.exit(1)
  }
}

initStorage()
