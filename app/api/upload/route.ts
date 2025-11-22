import { uploadFile } from "@/lib/storage"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  // Basic auth check via cookie
  const cookie = req.cookies.get("admin_session")
  if (!cookie) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const ext = file.name.split(".").pop()
    const filename = `images/${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`

    await uploadFile(filename, buffer, file.type)

    // Construct public URL
    // If R2_PUBLIC_URL is set (e.g. https://pub-xxx.r2.dev), use it
    // Otherwise, return a relative URL that the frontend proxy can handle, or the raw R2 URL
    const publicUrl = process.env.R2_PUBLIC_URL ? `${process.env.R2_PUBLIC_URL}/${filename}` : `/${filename}` // Fallback, assumes local proxy or user configuration

    return NextResponse.json({ url: publicUrl })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
