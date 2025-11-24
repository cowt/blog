import type React from "react"
import { requireAuth } from "@/lib/auth"
import { DashboardLayoutClient } from "./dashboard-layout-client"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAuth()

  return <DashboardLayoutClient>{children}</DashboardLayoutClient>
}
