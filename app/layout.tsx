import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { BackToTop } from "@/components/back-to-top"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
// import 'katex/dist/katex.min.css'

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  adjustFontFallback: false,
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  adjustFontFallback: false,
})

import { getThemeConfig } from "@/lib/config"

export async function generateMetadata(): Promise<Metadata> {
  const themeConfig = await getThemeConfig()
  return {
    title: themeConfig.siteName,
    description: themeConfig.siteDescription,
    generator: "Next.js",
    icons: {
      icon: [
        {
          url: "/icon-light-32x32.png",
          media: "(prefers-color-scheme: light)",
        },
        {
          url: "/icon-dark-32x32.png",
          media: "(prefers-color-scheme: dark)",
        },
        {
          url: themeConfig.favicon || "/icon.svg",
          type: "image/svg+xml",
        },
      ],
      apple: "/apple-icon.png",
    },
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css"
          integrity="sha384-n8MVd4RsNIU0tAv4ct0nTaAbDJwPJzDEaqSD1odI+WdtXRGWt2kTvGFasHpSy3SV"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <BackToTop />
        <Analytics />
      </body>
    </html>
  )
}
