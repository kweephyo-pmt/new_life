"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Loader2 } from "lucide-react"
import { updatePost } from "@/lib/posts-storage"
import { toast } from "sonner"

interface EditPostDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  postId: string
  initialContent: string
  initialLocation: string
  onPostUpdated?: () => void
}

export function EditPostDialog({
  open,
  onOpenChange,
  postId,
  initialContent,
  initialLocation,
  onPostUpdated
}: EditPostDialogProps) {
  const [content, setContent] = useState(initialContent)
  const [location, setLocation] = useState(initialLocation)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setContent(initialContent)
    setLocation(initialLocation)
  }, [initialContent, initialLocation, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim() || !location.trim()) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      setLoading(true)
      
      const success = await updatePost(postId, {
        content,
        location,
      })
      
      if (success) {
        toast.success("Post updated successfully!")
        onOpenChange(false)
        
        if (onPostUpdated) {
          onPostUpdated()
        }
      } else {
        toast.error("Failed to update post")
      }
    } catch (error) {
      console.error("Error updating post:", error)
      toast.error("Failed to update post")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[600px] max-h-[85vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="pb-3 sm:pb-4">
          <DialogTitle className="text-base sm:text-xl">Edit Post</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="content" className="text-sm">Content</Label>
            <Textarea
              id="content"
              placeholder="Share your travel experience..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              required
              className="resize-none text-sm sm:text-base"
            />
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="location" className="text-sm">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
              Location
            </Label>
            <Input
              id="location"
              placeholder="e.g., Tokyo, Japan"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 sm:pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
