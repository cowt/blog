---
inclusion: always
---

# Product Overview

This is a modern, minimalist blogging platform with an admin dashboard for content management. The platform features:

- Rich text editor (Tiptap) with markdown-like shortcuts, images, and links
- S3-compatible storage (Cloudflare R2/AWS S3) for file uploads and content persistence
- AI-powered content generation (OpenAI) for automatic excerpts and cover images
- Secure admin dashboard with configuration panels for theme, AI, and storage settings
- Public-facing blog with dark mode support

## Key Workflows

**Content Management**: Posts are stored as JSON files in S3 (`posts/{slug}.json`) with a central index (`posts/index.json`). All configuration is also stored in S3 (`config/*.json`).

**Admin Configuration**: Three configuration panels allow runtime updates without redeployment:
- Theme config: site branding, colors, fonts
- AI config: OpenAI API settings and auto-generation prompts
- S3 config: storage credentials (takes precedence over environment variables)

**Authentication**: Simple cookie-based admin authentication using `ADMIN_PASSWORD` environment variable. Middleware protects all `/admin/*` routes except `/admin/login`.
