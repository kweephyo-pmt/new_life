"use client"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Image as ImageIcon, MapPin, Loader2, Upload, X } from "lucide-react"
import { createPost } from "@/lib/posts-storage"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"
import Image from "next/image"

interface CreatePostDialogProps {
  onPostCreated?: () => void
}

export function CreatePostDialog({ onPostCreated }: CreatePostDialogProps) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState("")
  const [location, setLocation] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be less than 10MB")
      return
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file")
      return
    }

    try {
      setUploading(true)
      
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default')
      
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      )

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      setImageUrl(data.secure_url)
      toast.success("Image uploaded successfully!")
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error("Failed to upload image")
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !content.trim() || !location.trim()) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      setLoading(true)
      
      const authorName = user.displayName || user.email?.split('@')[0] || 'Anonymous'
      const authorUsername = `@${authorName.toLowerCase().replace(/\s+/g, '')}`
      
      const images = imageUrl.trim() ? [imageUrl] : []
      
      await createPost(
        user.uid,
        authorName,
        authorUsername,
        content,
        location,
        images
      )
      
      toast.success("Post created successfully!")
      setContent("")
      setLocation("")
      setImageUrl("")
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      setOpen(false)
      
      if (onPostCreated) {
        onPostCreated()
      }
    } catch (error) {
      console.error("Error creating post:", error)
      toast.error("Failed to create post")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Create Post</span>
          <span className="sm:hidden">Post</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-[600px] max-h-[85vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="pb-3 sm:pb-4">
          <DialogTitle className="text-base sm:text-xl">Share Your Travel Story</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="content" className="text-sm">What's on your mind?</Label>
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

          <div className="space-y-1.5 sm:space-y-2">
            <Label className="text-sm">
              <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
              Image (optional)
            </Label>
            
            {imageUrl ? (
              <div className="relative">
                <div className="relative h-48 rounded-lg overflow-hidden border">
                  <Image
                    src={imageUrl}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setImageUrl("")
                    if (fileInputRef.current) {
                      fileInputRef.current.value = ''
                    }
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Image
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-3 sm:pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading || uploading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || uploading}>
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading image...
                </>
              ) : loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                "Post"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
