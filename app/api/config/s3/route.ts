import { NextResponse } from "next/server"
import { getS3Config, saveS3Config } from "@/lib/config"
import { isAuthenticated } from "@/lib/auth"

export async function GET() {
  try {
    const config = await getS3Config()
    return NextResponse.json(config)
  } catch (error) {
    console.error("Error fetching S3 config:", error)
    return NextResponse.json({ error: "Failed to fetch config" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const config = await request.json()
    await saveS3Config(config)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving S3 config:", error)
    return NextResponse.json({ error: "Failed to save config" }, { status: 500 })
  }
}
