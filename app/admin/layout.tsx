import type React from "react"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check auth, but allow login page to bypass
  // We handle this by checking if we are NOT on the login page?
  // Actually layout wraps everything. We need to check inside.
  // But we can't know the pathname easily in RSC layout.
  // We'll handle protection in page components, but for the layout UI:

  // This layout applies to /admin and children.
  // If we are at /admin/login, we should probably use a different layout or handle it here.
  // Next.js Layouts nest.
  // I'll make a separate layout for dashboard if I can, but simpler:
  // Just render children. The pages will handle auth checks.
  // But I want a sidebar for the dashboard.

  // I'll move the sidebar to a component used by authenticated pages.
  // Or I can check auth here. If not auth, I can't redirect easily in Layout without Middleware.
  // Actually redirect() works in Layouts in Next.js App Router!

  // Wait, if I redirect in Layout, /admin/login will also be redirected if it uses this layout?
  // No, /admin/login is inside /admin.
  // So I should verify if I'm on the login page.
  // I'll use a route group (authenticated) for the dashboard.

  return <div className="min-h-screen bg-muted/30">{children}</div>
}
