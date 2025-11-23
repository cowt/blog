"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Loader2, FileX } from "lucide-react"
import { unpublishPostAction } from "@/app/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface UnpublishPostButtonProps {
  slug: string
  title: string
}

export function UnpublishPostButton({ slug, title }: UnpublishPostButtonProps) {
  const [isUnpublishing, setIsUnpublishing] = useState(false)
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleUnpublish = async () => {
    setIsUnpublishing(true)
    try {
      await unpublishPostAction(slug)
      toast.success("Post unpublished successfully")
      setOpen(false)
      router.refresh()
    } catch (error) {
      toast.error("Failed to unpublish post")
      console.error(error)
    } finally {
      setIsUnpublishing(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <FileX className="w-4 h-4" />
          <span className="sr-only">Unpublish</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Unpublish this post?</AlertDialogTitle>
          <AlertDialogDescription>
            This will convert <strong>{title}</strong> to a draft. It will no longer be visible on your blog.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isUnpublishing}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleUnpublish} disabled={isUnpublishing}>
            {isUnpublishing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Unpublish
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
