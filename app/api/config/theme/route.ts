import { NextResponse } from "next/server"
import { getThemeConfig, saveThemeConfig } from "@/lib/config"
import { isAuthenticated } from "@/lib/auth"

export async function GET() {
  try {
    const config = await getThemeConfig()
    return NextResponse.json(config)
  } catch (error) {
    console.error("Error fetching theme config:", error)
    return NextResponse.json({ error: "Failed to fetch config" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const config = await request.json()
    await saveThemeConfig(config)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving theme config:", error)
    return NextResponse.json({ error: "Failed to save config" }, { status: 500 })
  }
}
