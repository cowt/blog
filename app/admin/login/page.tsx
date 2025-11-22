import { login, isAuthenticated } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

export default async function LoginPage() {
  if (await isAuthenticated()) {
    redirect("/admin")
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/30 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-serif">Admin Login</CardTitle>
          <CardDescription>Enter your password to access the dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={async (formData) => {
              "use server"
              const result = await login(formData)
              if (result.success) {
                redirect("/admin")
              }
              // Ideally show error, but for simplicity in RSC we just reload/don't redirect
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required placeholder="••••••••" />
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
