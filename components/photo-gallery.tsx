"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Heart, Share2, Download, X, MapPin, Loader2, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
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

  const goToPrevious = () => {
    if (!selectedPost) return
    const currentIndex = filteredPosts.findIndex(p => p.id === selectedPost.id)
    if (currentIndex > 0) {
      setSelectedPost(filteredPosts[currentIndex - 1])
    }
  }

  const goToNext = () => {
    if (!selectedPost) return
    const currentIndex = filteredPosts.findIndex(p => p.id === selectedPost.id)
    if (currentIndex < filteredPosts.length - 1) {
      setSelectedPost(filteredPosts[currentIndex + 1])
    }
  }

  const getCurrentIndex = () => {
    if (!selectedPost) return { current: 0, total: 0 }
    const currentIndex = filteredPosts.findIndex(p => p.id === selectedPost.id)
    return { current: currentIndex + 1, total: filteredPosts.length }
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
        <DialogContent 
          className="!w-[100vw] md:!w-[95vw] !h-[100vh] md:!h-[95vh] !max-w-[100vw] md:!max-w-[95vw] p-0 overflow-hidden [&>button[type='button']]:hidden"
        >
          {selectedPost && (
            <>
              <DialogTitle className="sr-only">
                {selectedPost.location} - Photo by {selectedPost.author.name}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {selectedPost.content}
              </DialogDescription>
              
              {/* Custom Close Button - positioned to cover default one */}
              <button
                onClick={() => setSelectedPost(null)}
                className="absolute top-2 right-2 md:top-4 md:right-4 z-[100] w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/60 backdrop-blur-sm hover:bg-black/80 text-white flex items-center justify-center shadow-lg transition-colors"
              >
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>

              {/* Navigation Arrows */}
              {getCurrentIndex().current > 1 && (
                <button
                  onClick={goToPrevious}
                  className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-[100] w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/60 backdrop-blur-sm hover:bg-black/80 text-white flex items-center justify-center shadow-lg transition-colors"
                >
                  <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
                </button>
              )}
              
              {getCurrentIndex().current < getCurrentIndex().total && (
                <button
                  onClick={goToNext}
                  className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-[100] w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/60 backdrop-blur-sm hover:bg-black/80 text-white flex items-center justify-center shadow-lg transition-colors"
                >
                  <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
                </button>
              )}

              {/* Photo Counter */}
              <div className="absolute top-2 left-2 md:top-4 md:left-4 z-[100] px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm text-white text-sm font-medium shadow-lg">
                {getCurrentIndex().current} / {getCurrentIndex().total}
              </div>

              <div className="flex flex-col md:grid md:grid-cols-[2fr_1fr] h-full overflow-y-auto md:overflow-hidden">
                {/* Image Section */}
                <div className="relative bg-black flex items-center justify-center overflow-hidden h-[35vh] md:h-auto">
                  <img
                    src={selectedPost.images[0]}
                    alt={selectedPost.content}
                    className="w-full h-full object-cover md:object-contain"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 md:p-8">
                    <div className="flex items-center gap-2 md:gap-3 text-white">
                      <MapPin className="w-4 h-4 md:w-6 md:h-6" />
                      <h2 className="text-lg md:text-3xl font-bold drop-shadow-lg">{selectedPost.location}</h2>
                    </div>
                  </div>
                </div>

                {/* Info Section */}
                <div className="flex flex-col bg-background flex-1">
                  {/* Header */}
                  <div className="p-4 md:p-8 border-b flex-shrink-0">
                    <div className="flex items-center gap-3">
                      {selectedPost.author.photoURL ? (
                        <img 
                          src={selectedPost.author.photoURL} 
                          alt={selectedPost.author.name}
                          className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover ring-2 ring-primary/30 shadow-md"
                        />
                      ) : (
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground flex items-center justify-center ring-2 ring-primary/30 shadow-md">
                          <span className="text-lg md:text-2xl font-bold">{selectedPost.author.avatar}</span>
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-base md:text-lg font-bold text-foreground">{selectedPost.author.name}</p>
                        <p className="text-xs md:text-sm text-muted-foreground">@{selectedPost.author.username}</p>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-3 md:space-y-6">
                    <div>
                      <p className="text-sm md:text-base text-foreground leading-relaxed">
                        {selectedPost.content}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 md:gap-8 py-4 md:py-6 border-y">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                          <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                        </div>
                        <div>
                          <p className="text-xl font-bold text-foreground">{selectedPost.likes.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">likes</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <MessageCircle className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xl font-bold text-foreground">{selectedPost.comments}</p>
                          <p className="text-xs text-muted-foreground">comments</p>
                        </div>
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div className="text-sm text-muted-foreground">
                      Posted on {selectedPost.createdAt?.toDate().toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 md:p-8 border-t bg-muted/20">
                    <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                      <Button
                        onClick={() => handleShare(selectedPost)}
                        variant="outline"
                        size="lg"
                        className="flex-1"
                      >
                        <Share2 className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                        Share
                      </Button>
                      <Button 
                        onClick={() => {
                          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://new-life-ai.vercel.app'
                          window.open(`${baseUrl}/community?post=${selectedPost.id}`, '_blank')
                        }}
                        size="lg"
                        className="flex-1"
                      >
                        View Post
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
