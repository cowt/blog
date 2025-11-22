"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

const COOKIE_NAME = "admin_session"

export async function isAuthenticated() {
  const cookieStore = await cookies()
  return cookieStore.has(COOKIE_NAME)
}

export async function login(formData: FormData) {
  const password = formData.get("password")

  if (password === process.env.ADMIN_PASSWORD) {
    const cookieStore = await cookies()
    cookieStore.set(COOKIE_NAME, "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })
    return { success: true }
  }

  return { success: false, error: "Invalid password" }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
  redirect("/admin/login")
}

export async function requireAuth() {
  const isAuth = await isAuthenticated()
  if (!isAuth) {
    redirect("/admin/login")
  }
}
