---
inclusion: always
---

# Tech Stack

## Core Framework
- **Next.js 15** (App Router) with TypeScript
- **React 19** (RC)
- **Tailwind CSS v4** for styling

## Key Libraries
- **UI Components**: shadcn/ui built on Radix UI primitives
- **Rich Text Editor**: Tiptap with extensions for tables, images, links, task lists
- **Storage**: AWS SDK v3 (`@aws-sdk/client-s3`) for S3-compatible storage
- **AI**: OpenAI SDK for GPT and DALL-E 3
- **Markdown**: `marked`, `react-markdown` with `remark-gfm`, `rehype-katex` for math
- **Forms**: `react-hook-form` with `zod` validation
- **Theming**: `next-themes` for dark mode
- **Notifications**: `sonner` for toast messages

## Common Commands

```bash
# Development
npm run dev          # Start dev server on localhost:3000

# Build & Deploy
npm run build        # Production build
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
```

## Configuration Notes

- TypeScript strict mode enabled with `ignoreBuildErrors: true` in Next.js config
- Path alias `@/*` maps to project root
- Images are unoptimized (`unoptimized: true`)
- Environment variables in `.env` (copy from `.env.example`)
