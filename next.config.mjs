/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  reactStrictMode: false, // 禁用严格模式以避免开发环境下的双重渲染

  // 使用传统 webpack 构建（因为我们需要自定义 splitChunks 配置）
  // Next.js 16 默认使用 Turbopack，需要在 package.json 中添加 --webpack 标志
  // 或者在这里明确配置

  // 优化代码分割，将大型库拆分到单独的 chunk
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // 只在客户端构建时应用
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks.cacheGroups,
            // 将 TipTap 编辑器相关代码拆分到单独的 chunk
            tiptap: {
              test: /[\\/]node_modules[\\/]@tiptap[\\/]/,
              name: 'tiptap',
              priority: 30,
              reuseExistingChunk: true,
            },
            // 将 KaTeX（数学公式渲染）拆分到单独的 chunk
            katex: {
              test: /[\\/]node_modules[\\/]katex[\\/]/,
              name: 'katex',
              priority: 30,
              reuseExistingChunk: true,
            },
            // 将 Lowlight（代码高亮）拆分到单独的 chunk
            lowlight: {
              test: /[\\/]node_modules[\\/](lowlight|highlight\.js)[\\/]/,
              name: 'lowlight',
              priority: 30,
              reuseExistingChunk: true,
            },
            // 将 Mermaid（图表渲染）拆分到单独的 chunk
            mermaid: {
              test: /[\\/]node_modules[\\/]mermaid[\\/]/,
              name: 'mermaid',
              priority: 30,
              reuseExistingChunk: true,
            },
            // 将 Prosemirror（TipTap 底层库）拆分到单独的 chunk
            prosemirror: {
              test: /[\\/]node_modules[\\/]prosemirror-[\w-]+[\\/]/,
              name: 'prosemirror',
              priority: 25,
              reuseExistingChunk: true,
            },
            // 其他常用库
            commons: {
              test: /[\\/]node_modules[\\/]/,
              name: 'commons',
              priority: 10,
              minChunks: 2,
              reuseExistingChunk: true,
            },
          },
        },
      }
    }
    return config
  },

  // 添加空的 turbopack 配置以避免警告
  // 注意：Turbopack 目前不支持自定义 splitChunks，所以我们使用 webpack
  turbopack: {},
}

export default nextConfig
