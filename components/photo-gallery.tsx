"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Heart, Share2, Download, X, MapPin, Loader2 } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { setupPostsListener, type Post as FirestorePost } from "@/lib/posts-storage"
import { useAuth } from "@/contexts/AuthContext"
import { Timestamp } from "firebase/firestore"
import { toast } from "sonner"

interface Post {
  id: string
  userId: string
  author: {
    name: string
    avatar: string
    username: string
    photoURL?: string
  }
  content: string
  location: string
  images: string[]
  likes: number
  comments: number
  likedBy: string[]
  savedBy: string[]
  timestamp: Timestamp
  createdAt: Timestamp
}

export function PhotoGallery() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Set up real-time listener for posts with images only
    const unsubscribe = setupPostsListener((updatedPosts: Post[]) => {
      // Filter to only show posts with images
      const postsWithImages = updatedPosts.filter(
        post => post.images && post.images.length > 0 && post.images[0]
      )
      setPosts(postsWithImages)
      setLoading(false)
    }, false, undefined)
    
    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [])

  const filteredPosts = posts.filter(
    (post) =>
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleShare = async (post: Post) => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://new-life-ai.vercel.app'
    const shareUrl = `${baseUrl}/community?post=${post.id}`
    
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Link copied to clipboard!')
    } catch (error) {
      console.error('Error copying link:', error)
      toast.error('Failed to copy link')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="max-w-md mx-auto">
          <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No photos yet</h3>
          <p className="text-muted-foreground mb-6">
            Be the first to share your travel photos with the community!
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div>
      {/* Search Bar */}
      <Card className="p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by location, content, or photographer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Photo Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map((post) => (
          <Card key={post.id} className="overflow-hidden group cursor-pointer" onClick={() => setSelectedPost(post)}>
            <div className="relative h-64 bg-muted overflow-hidden">
              <img
                src={post.images[0]}
                alt={post.content}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* Quick Actions */}
              <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleShare(post)
                  }}
                  className="w-8 h-8 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
                >
                  <Share2 className="w-4 h-4 text-foreground" />
                </button>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-primary" />
                <p className="text-sm font-semibold text-foreground">{post.location}</p>
              </div>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{post.content}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Heart className="w-4 h-4" />
                  <span>{post.likes.toLocaleString()}</span>
                </div>
                <span className="text-xs text-muted-foreground">{post.author.name}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Photo Detail Dialog */}
      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="max-w-4xl p-0">
          {selectedPost && (
            <div className="grid md:grid-cols-2">
              <div className="relative h-[500px] bg-muted">
                <img
                  src={selectedPost.images[0]}
                  alt={selectedPost.content}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      <h2 className="text-2xl font-bold text-foreground">{selectedPost.location}</h2>
                    </div>
                    <p className="text-muted-foreground">{selectedPost.content}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedPost(null)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="flex items-center gap-2 mb-6">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground flex items-center justify-center">
                    <span className="text-sm font-semibold">{selectedPost.author.avatar}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{selectedPost.author.name}</p>
                    <p className="text-xs text-muted-foreground">@{selectedPost.author.username}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-1">
                    <Heart className="w-5 h-5 text-muted-foreground" />
                    <span className="font-semibold text-foreground">{selectedPost.likes.toLocaleString()}</span>
                    <span className="text-sm text-muted-foreground ml-1">likes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-foreground">{selectedPost.comments}</span>
                    <span className="text-sm text-muted-foreground ml-1">comments</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleShare(selectedPost)}
                    variant="outline"
                    className="flex-1"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://new-life-ai.vercel.app'
                      window.open(`${baseUrl}/community?post=${selectedPost.id}`, '_blank')
                    }}
                  >
                    View Post
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
