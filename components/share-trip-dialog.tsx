"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Check, Facebook, Twitter, Mail } from "lucide-react"
import { toast } from "sonner"

export function ShareTripDialog({ children, tripName, tripId }: { children: React.ReactNode; tripName: string; tripId: string }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const shareUrl = `https://new-life-ai.vercel.app/trips/public/${tripId}`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success('Link copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy link')
    }
  }

  const shareToSocial = (platform: string) => {
    const text = `Check out my trip: ${tripName}`
    const urls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
      email: `mailto:?subject=${encodeURIComponent(tripName)}&body=${encodeURIComponent(`${text}\n\n${shareUrl}`)}`,
    }

    if (urls[platform]) {
      window.open(urls[platform], "_blank")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Share Your Trip</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Share Link */}
          <div className="space-y-2">
            <Label>Share Link</Label>
            <div className="flex gap-2">
              <Input value={shareUrl} readOnly className="flex-1" />
              <Button onClick={copyToClipboard} variant="outline" size="icon">
                {copied ? <Check className="w-4 h-4 text-secondary" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Social Share Buttons */}
          <div className="space-y-2">
            <Label>Share on Social Media</Label>
            <div className="grid grid-cols-3 gap-3">
              <Button
                onClick={() => shareToSocial("facebook")}
                variant="outline"
                className="flex flex-col gap-2 h-auto py-4"
              >
                <Facebook className="w-6 h-6" />
                <span className="text-xs">Facebook</span>
              </Button>
              <Button
                onClick={() => shareToSocial("twitter")}
                variant="outline"
                className="flex flex-col gap-2 h-auto py-4"
              >
                <Twitter className="w-6 h-6" />
                <span className="text-xs">Twitter</span>
              </Button>
              <Button
                onClick={() => shareToSocial("email")}
                variant="outline"
                className="flex flex-col gap-2 h-auto py-4"
              >
                <Mail className="w-6 h-6" />
                <span className="text-xs">Email</span>
              </Button>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="space-y-2">
            <Label>Privacy</Label>
            <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm items-center text-muted-foreground">
              Anyone with the link can view
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
