"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import type { AnnouncementBanner } from "@/types"
import { cn } from "@/lib/utils"

interface AnnouncementBannerProps {
  config: AnnouncementBanner
}

const typeStyles = {
  info: "bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-100 border-blue-200 dark:border-blue-800",
  warning: "bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-100 border-amber-200 dark:border-amber-800",
  error: "bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100 border-red-200 dark:border-red-800",
  success: "bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100 border-green-200 dark:border-green-800",
}

export function AnnouncementBannerComponent({ config }: AnnouncementBannerProps) {
  const [dismissed, setDismissed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // 检查是否已关闭过（基于消息内容的 hash）
    const dismissedKey = `announcement-dismissed-${btoa(config.message).slice(0, 16)}`
    if (localStorage.getItem(dismissedKey)) {
      setDismissed(true)
    }
  }, [config.message])

  if (!config.enabled || !config.message || dismissed || !mounted) {
    return null
  }

  const handleDismiss = () => {
    const dismissedKey = `announcement-dismissed-${btoa(config.message).slice(0, 16)}`
    localStorage.setItem(dismissedKey, "true")
    setDismissed(true)
  }

  const type = config.type || "info"

  const content = (
    <>
      <span>{config.message}</span>
      {config.link && config.linkText && (
        <a
          href={config.link}
          className="ml-2 underline underline-offset-2 font-medium hover:opacity-80"
        >
          {config.linkText}
        </a>
      )}
    </>
  )

  return (
    <div
      className={cn(
        "relative w-full border-b text-sm py-2 overflow-hidden",
        typeStyles[type]
      )}
    >
      <div className="container max-w-6xl mx-auto px-4 flex items-center justify-center">
        {config.scrolling ? (
          <div className="overflow-hidden flex-1 mx-8">
            <div className="animate-marquee whitespace-nowrap inline-block">
              {content}
              <span className="mx-16">{content}</span>
            </div>
          </div>
        ) : (
          <div className="text-center flex-1">{content}</div>
        )}

        {config.dismissible !== false && (
          <button
            onClick={handleDismiss}
            className="absolute right-4 p-1 hover:opacity-70 transition-opacity"
            aria-label="关闭公告"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
