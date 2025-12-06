export interface PostMeta {
  slug: string
  title: string
  createdAt: string
  published: boolean
  // 扩展字段 - 内容元数据
  excerpt?: string // 文章摘要，用于 SEO 和列表预览
  coverImage?: string // 封面图 URL
  updatedAt?: string // 最后更新时间
  readingTime?: number // 预估阅读时间 (分钟)
  showInList?: boolean // 是否在根目录列表中显示，默认 true
  
  // 扩展字段 - 分类与标签
  tags?: string[] // 标签列表
  category?: string // 分类
  
  // 扩展字段 - 交互计数 (列表页展示用，可能由定时任务更新)
  interactionCount?: {
    likes: number
    comments: number
    views: number
  }
}

export interface Post extends PostMeta {
  content: string
  // 扩展字段 - 目录结构
  toc?: {
    level: number
    text: string
    id: string
  }[]
}

export interface Comment {
  id: string
  postId: string
  author: {
    name: string
    email?: string // 仅后端存储，不公开
    website?: string
    avatar?: string
  }
  content: string
  createdAt: string
  parentId?: string // 用于嵌套回复
  status: "pending" | "approved" | "spam" // 评论审核状态
  likes?: number // 评论的点赞数
}

// 独立存储的交互数据 (存储于 interactions/[slug].json)
export interface PostInteractions {
  slug: string
  likes: number
  views: number
  comments: Comment[]
}

// 公告横幅配置
export interface AnnouncementBanner {
  enabled: boolean
  message: string
  link?: string
  linkText?: string
  type?: "info" | "warning" | "error" | "success"
  scrolling?: boolean // 是否滚动
  dismissible?: boolean // 是否可关闭
}

// 网站主题配置
export interface ThemeConfig {
  siteName?: string
  siteDescription?: string
  siteUrl?: string
  logo?: string
  favicon?: string
  theme?: {
    primaryColor?: string
    fontFamily?: string
  }
  announcement?: AnnouncementBanner
}

// AI 相关配置
export interface AIConfig {
  baseURL: string
  apiKey: string
  model?: string
  autoGenerateTags: boolean
  excerptPrompt: string
  coverImagePrompt: string
  tagsPrompt: string
}

// S3/R2 存储配置
export interface S3Config {
  accessKeyId: string
  secretAccessKey: string
  endpoint: string
  bucketName: string
  region?: string
  publicUrl?: string // 公开访问的 URL 前缀
}
