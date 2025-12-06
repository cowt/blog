---
inclusion: always
---

# Project Structure

## Directory Organization

```
app/                    # Next.js App Router
├── admin/             # Admin dashboard (protected by middleware)
│   ├── (dashboard)/   # Route group for dashboard layout
│   │   ├── ai-config/
│   │   ├── s3-config/
│   │   └── theme-config/
│   ├── login/         # Admin authentication
│   └── posts/         # Post management (new, edit)
├── api/               # API routes
│   ├── config/        # Configuration endpoints (ai, s3, theme)
│   └── upload/        # File upload endpoint
├── p/[slug]/          # Public post pages
└── guide/             # Guide/documentation page

components/            # React components
├── ui/                # shadcn/ui components (Radix UI wrappers)
├── editor/            # Tiptap editor components
└── post/              # Post-related components

lib/                   # Core business logic
├── auth.ts            # Authentication utilities
├── posts.ts           # Post CRUD operations
├── storage.ts         # S3 client and file operations
├── config.ts          # Configuration management
├── ai.ts              # AI generation services
└── utils.ts           # Utility functions

types/                 # TypeScript type definitions
└── index.ts           # Shared types (Post, PostMeta, Config types)

public/                # Static assets
config/                # Local config files (theme.json)
```

## Key Patterns

**Server Actions**: Functions in `lib/` marked with `"use server"` for server-side operations

**Storage Layer**: All data persistence goes through `lib/storage.ts` which abstracts S3 operations

**Configuration Priority**: Admin panel config (stored in S3) > Environment variables

**Route Protection**: `middleware.ts` checks for `admin_session` cookie on `/admin/*` routes

**Type Safety**: Centralized types in `types/index.ts` used across the application
