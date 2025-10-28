"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Edit2, Loader2, User, MapPin, Globe, Camera, X } from "lucide-react"
import { updateProfile } from "firebase/auth"
import { saveUserProfile } from "@/lib/user-profile-storage"
import { toast } from "sonner"
import type { User as FirebaseUser } from "firebase/auth"

interface EditProfileDialogProps {
  user: FirebaseUser
  initialDisplayName: string
  initialUsername: string
  initialBio: string
  initialLocation: string
  initialWebsite: string
  onProfileUpdated: () => void
}

export function EditProfileDialog({
  user,
  initialDisplayName,
  initialUsername,
  initialBio,
  initialLocation,
  initialWebsite,
  onProfileUpdated
}: EditProfileDialogProps) {
  const [open, setOpen] = useState(false)
  const [displayName, setDisplayName] = useState(initialDisplayName)
  const [username, setUsername] = useState(initialUsername)
  const [bio, setBio] = useState(initialBio)
  const [location, setLocation] = useState(initialLocation)
  const [website, setWebsite] = useState(initialWebsite)
  const [photoURL, setPhotoURL] = useState(user.photoURL || '')
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setDisplayName(initialDisplayName)
      setUsername(initialUsername)
      setBio(initialBio)
      setLocation(initialLocation)
      setWebsite(initialWebsite)
      setPhotoURL(user.photoURL || '')
    }
  }, [open, initialDisplayName, initialUsername, initialBio, initialLocation, initialWebsite, user.photoURL])

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
      setPhotoURL(data.secure_url)
      toast.success("Profile picture uploaded successfully!")
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error("Failed to upload image")
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!displayName.trim()) {
      toast.error("Display name is required")
      return
    }

    setLoading(true)
    try {
      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: displayName.trim(),
        photoURL: photoURL || null,
      })
      
      // Update Firestore profile
      const profileData: any = {
        email: user.email || '',
        displayName: displayName.trim(),
        username: username.trim().toLowerCase(),
        bio: bio.trim(),
        location: location.trim(),
        website: website.trim(),
      }
      
      if (photoURL) {
        profileData.photoURL = photoURL
      }
      
      await saveUserProfile(user.uid, profileData)
      
      toast.success('Profile updated successfully!')
      setOpen(false)
      onProfileUpdated()
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit2 className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-[500px] max-h-[85vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="pb-3 sm:pb-4">
          <DialogTitle className="text-base sm:text-xl">Edit Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {/* Profile Picture */}
          <div className="flex flex-col items-center gap-3 sm:gap-4 pb-3 sm:pb-4 border-b">
            <div className="relative">
              <Avatar className="w-20 h-20 sm:w-24 sm:h-24 ring-2 sm:ring-4 ring-background shadow-lg">
                {photoURL ? (
                  <AvatarImage src={photoURL} alt={displayName} className="object-cover" />
                ) : null}
                <AvatarFallback className="bg-primary text-primary-foreground text-xl sm:text-2xl">
                  {displayName.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              {photoURL && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-8 w-8 rounded-full shadow-md"
                  onClick={() => setPhotoURL('')}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
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
                    <Camera className="w-4 h-4 mr-2" />
                    Change Photo
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="displayName" className="text-sm">
              <User className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
              Display Name *
            </Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              required
              className="text-sm sm:text-base"
            />
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="username" className="text-sm">Username *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="username"
                required
                className="pl-8 text-sm sm:text-base"
              />
            </div>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="bio" className="text-sm">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={2}
              className="resize-none text-sm sm:text-base"
            />
            <p className="text-xs text-muted-foreground">
              {bio.length}/200 characters
            </p>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="location" className="text-sm">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
              Location
            </Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Bangkok, Thailand"
              className="text-sm sm:text-base"
            />
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="website" className="text-sm">
              <Globe className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
              Website
            </Label>
            <Input
              id="website"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://yourwebsite.com"
              className="text-sm sm:text-base"
            />
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
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
