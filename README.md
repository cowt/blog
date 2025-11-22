# Telegraph Clone / Blog Platform

A modern, minimalist blogging platform built with Next.js 16, Tailwind CSS v4,
and Cloudflare R2 / AWS S3 for storage.

## Features

- **Rich Text Editor**: Powered by Tiptap, supporting images, links, and
  markdown-like shortcuts.
- **File Storage**: Direct uploads to S3-compatible storage (Cloudflare R2
  recommended).
- **Admin Dashboard**: Secure interface for managing posts with advanced
  configuration options.
- **AI-Powered Content**: Automatic generation of article excerpts and cover
  images using OpenAI API.
- **Static/Dynamic Rendering**: Fast page loads with Next.js App Router.
- **Dark Mode**: Built-in support for light and dark themes.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (Radix UI)
- **Editor**: Tiptap
- **Storage**: AWS SDK v3 (S3 Client)
- **AI**: OpenAI SDK

## Project Structure

```
├── app/
│   ├── admin/          # Admin dashboard and editor
│   │   ├── (dashboard)/
│   │   │   ├── theme-config/   # Website theme configuration
│   │   │   ├── ai-config/      # AI settings
│   │   │   └── s3-config/      # S3 storage settings
│   │   ├── posts/      # Post management
│   │   └── login/      # Admin authentication
│   ├── api/            # API routes
│   │   ├── config/     # Configuration APIs
│   │   └── upload/     # File upload
│   ├── p/              # Public post pages
│   └── ...
├── components/
│   ├── ui/             # Reusable UI components
│   ├── editor/         # Editor components
│   └── ...
├── lib/
│   ├── auth.ts         # Authentication logic
│   ├── posts.ts        # Post management logic
│   ├── storage.ts      # S3/R2 storage client
│   ├── config.ts       # Configuration management
│   ├── ai.ts           # AI generation services
│   └── utils.ts        # Utility functions
├── types/              # Shared TypeScript definitions
└── ...
```

## Admin Configuration Features

### 1. Website Theme Configuration (`/admin/theme-config`)

Configure your website's appearance and basic information:

**Basic Information:**

- Site name and description
- Website URL
- Logo and favicon URLs

**Theme Settings:**

- Primary color (with color picker)
- Font family

### 2. AI Configuration (`/admin/ai-config`)

Configure AI-powered content generation:

**API Settings:**

- Base URL (supports OpenAI-compatible APIs)
- API Key (with show/hide toggle)
- Model selection (e.g., gpt-4o-mini, gpt-4o)

**Auto-generation Settings:**

- **Auto-generate Excerpt**: Automatically create article summaries
  - Customizable prompt (use `{content}` placeholder)
- **Auto-generate Cover Image**: Automatically create cover images using DALL-E
  3
  - Customizable prompt (use `{title}` placeholder)

### 3. S3 Storage Configuration (`/admin/s3-config`)

Configure S3-compatible object storage (AWS S3, Cloudflare R2, etc.):

**Storage Credentials:**

- Access Key ID
- Secret Access Key (with show/hide toggle)

**Storage Settings:**

- Endpoint URL
- Bucket name
- Region
- Public URL prefix (optional)

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   # or
   pnpm install
   ```

2. **Configure Environment Variables**: Copy `.env.example` to `.env` and fill
   in the values.
   ```bash
   cp .env.example .env
   ```

   Required variables:
   - `ADMIN_PASSWORD`: Password for the admin area.
   - `R2_ACCESS_KEY_ID`: S3/R2 Access Key (optional if configured via admin
     panel).
   - `R2_SECRET_ACCESS_KEY`: S3/R2 Secret Key (optional if configured via admin
     panel).
   - `R2_ENDPOINT`: S3/R2 Endpoint URL (optional if configured via admin panel).
   - `R2_BUCKET_NAME`: Bucket name (optional if configured via admin panel).

   **Note on S3 Configuration Priority:**
   - **Admin Panel Config > Environment Variables**
   - If you configure S3 settings via the admin panel (`/admin/s3-config`),
     those settings will take precedence over environment variables
   - Environment variables serve as fallback configuration
   - This allows you to update storage settings without restarting the
     application

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. **Open in Browser**: Visit `http://localhost:3000`.

5. **Access Admin Panel**: Navigate to `/admin/login` and use your configured
   password.

## Configuration Storage

All configurations are stored as JSON files in your S3/R2 bucket:

- Theme config: `config/theme.json`
- AI config: `config/ai.json`
- S3 config: `config/s3.json`

## AI Features Usage

### Setting Up AI Features

1. Log in to the admin panel
2. Navigate to "AI 相关配置" in the sidebar
3. Configure your API settings:
   - Enter your OpenAI API key (or compatible API)
   - Set the base URL (default: `https://api.openai.com/v1`)
   - Choose your preferred model
4. Enable auto-generation features as needed
5. Customize prompts (optional)
6. Save configuration

### How It Works

When you publish a post:

- If auto-generate excerpt is enabled and the post has no excerpt, the system
  will automatically generate one using GPT
- If auto-generate cover image is enabled and the post has no cover image, the
  system will automatically generate one using DALL-E 3
- Generated content is automatically filled into the post's `excerpt` and
  `coverImage` fields
- Existing content is never overwritten

### Cost Considerations

- **Excerpt generation**: Uses `gpt-4o-mini` (low cost)
- **Cover image generation**: Uses `dall-e-3` (higher cost - use carefully)
- Content is limited to first 3000 characters for excerpt generation
- Failed AI generation won't block post publication

## Deployment

This project is designed to be deployed on Vercel or any platform supporting
Next.js. Ensure environment variables are set in your deployment settings.

## License

MIT
