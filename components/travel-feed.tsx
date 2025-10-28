"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Heart, MessageCircle, Share2, Bookmark, MapPin, MoreVertical, Loader2, Trash2, Pencil, Send } from "lucide-react"
import { getAllPosts, getSavedPosts, toggleLike, toggleSave, deletePost, addComment, getComments, deleteComment, type Post as FirestorePost, type Comment } from "@/lib/posts-storage"
import { EditPostDialog } from "@/components/edit-post-dialog"
import { useAuth } from "@/contexts/AuthContext"
import { Timestamp } from "firebase/firestore"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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

interface TravelFeedProps {
  filterSaved?: boolean
}

export function TravelFeed({ filterSaved = false }: TravelFeedProps = {}) {
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [postToDelete, setPostToDelete] = useState<string | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [postToEdit, setPostToEdit] = useState<Post | null>(null)
  const [showComments, setShowComments] = useState<Record<string, boolean>>({})
  const [comments, setComments] = useState<Record<string, Comment[]>>({})
  const [commentText, setCommentText] = useState<Record<string, string>>({})
  const [commentLoading, setCommentLoading] = useState<Record<string, boolean>>({})

  useEffect(() => {
    loadPosts()
  }, [user])

  // Cleanup effect to ensure body is scrollable
  useEffect(() => {
    return () => {
      document.body.style.pointerEvents = ''
      document.body.style.overflow = ''
    }
  }, [])

  // Cleanup when dialog closes
  useEffect(() => {
    if (!editDialogOpen) {
      document.body.style.pointerEvents = ''
      document.body.style.overflow = ''
    }
  }, [editDialogOpen])

  const loadPosts = async () => {
    try {
      setLoading(true)
      const fetchedPosts = filterSaved && user 
        ? await getSavedPosts(user.uid)
        : await getAllPosts()
      setPosts(fetchedPosts)
    } catch (error) {
      console.error('Error loading posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleLike = async (postId: string) => {
    if (!user) return
    
    const success = await toggleLike(postId, user.uid)
    if (success) {
      await loadPosts()
    }
  }

  const handleToggleSave = async (postId: string) => {
    if (!user) return
    
    const success = await toggleSave(postId, user.uid)
    if (success) {
      await loadPosts()
    }
  }

  const handleEditClick = (post: Post) => {
    // Ensure clean state before opening
    setEditDialogOpen(false)
    setPostToEdit(null)
    
    // Use setTimeout to ensure state is cleared before setting new values
    setTimeout(() => {
      setPostToEdit(post)
      setEditDialogOpen(true)
    }, 50)
  }

  const handleDeleteClick = (postId: string) => {
    setPostToDelete(postId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!user || !postToDelete) return

    try {
      const success = await deletePost(postToDelete, user.uid)
      if (success) {
        toast.success('Post deleted successfully')
        await loadPosts()
      } else {
        toast.error('Failed to delete post')
      }
    } catch (error) {
      console.error('Error deleting post:', error)
      toast.error('Failed to delete post')
    } finally {
      setDeleteDialogOpen(false)
      setPostToDelete(null)
    }
  }

  const toggleComments = async (postId: string) => {
    const isShowing = showComments[postId]
    setShowComments(prev => ({ ...prev, [postId]: !isShowing }))
    
    if (!isShowing && !comments[postId]) {
      const postComments = await getComments(postId)
      setComments(prev => ({ ...prev, [postId]: postComments }))
    }
  }

  const handleAddComment = async (postId: string) => {
    if (!user || !commentText[postId]?.trim()) return
    
    setCommentLoading(prev => ({ ...prev, [postId]: true }))
    
    try {
      const success = await addComment(
        postId,
        user.uid,
        user.displayName || 'User',
        user.email?.split('@')[0] || 'user',
        commentText[postId].trim(),
        user.photoURL || undefined
      )
      
      if (success) {
        setCommentText(prev => ({ ...prev, [postId]: '' }))
        const updatedComments = await getComments(postId)
        setComments(prev => ({ ...prev, [postId]: updatedComments }))
        await loadPosts()
      } else {
        toast.error('Failed to add comment')
      }
    } catch (error) {
      console.error('Error adding comment:', error)
      toast.error('Failed to add comment')
    } finally {
      setCommentLoading(prev => ({ ...prev, [postId]: false }))
    }
  }

  const handleDeleteComment = async (commentId: string, postId: string) => {
    if (!user) return
    
    try {
      const success = await deleteComment(commentId, user.uid, postId)
      if (success) {
        const updatedComments = await getComments(postId)
        setComments(prev => ({ ...prev, [postId]: updatedComments }))
        await loadPosts()
        toast.success('Comment deleted')
      } else {
        toast.error('Failed to delete comment')
      }
    } catch (error) {
      console.error('Error deleting comment:', error)
      toast.error('Failed to delete comment')
    }
  }

  const formatTimestamp = (timestamp: Timestamp): string => {
    const now = new Date()
    const postDate = timestamp.toDate()
    const diffMs = now.getTime() - postDate.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins === 1) return '1 minute ago'
    if (diffMins < 60) return `${diffMins} minutes ago`
    if (diffHours === 1) return '1 hour ago'
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays === 1) return '1 day ago'
    if (diffDays < 7) return `${diffDays} days ago`
    return postDate.toLocaleDateString()
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
      <Card className="p-8 sm:p-12 text-center">
        {filterSaved ? (
          <>
            <Bookmark className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">No saved posts yet</h3>
            <p className="text-sm sm:text-base text-muted-foreground">Bookmark posts to save them for later</p>
          </>
        ) : (
          <>
            <MessageCircle className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">No posts yet</h3>
            <p className="text-sm sm:text-base text-muted-foreground">Be the first to share your travel story!</p>
          </>
        )}
      </Card>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {posts.map((post) => (
        <Card key={post.id} className="overflow-hidden">
          {/* Post Header */}
          <div className="p-3 sm:p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 sm:w-12 sm:h-12 ring-2 ring-background shadow-sm">
                {post.author.photoURL ? (
                  <AvatarImage src={post.author.photoURL} alt={post.author.name} className="object-cover" />
                ) : null}
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                  <span className="text-sm sm:text-base font-semibold">{post.author.avatar}</span>
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <p className="text-sm sm:text-base font-semibold text-foreground leading-tight">{post.author.name}</p>
                <p className="text-xs sm:text-sm text-muted-foreground leading-tight">@{post.author.username}</p>
              </div>
            </div>
            {user && post.userId === user.uid && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEditClick(post)}>
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit Post
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => handleDeleteClick(post.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Post
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Post Image */}
          <div className="relative h-96 bg-muted">
            <img src={post.images[0] || "/placeholder.svg"} alt={post.content} className="w-full h-full object-cover" />
          </div>

          {/* Post Actions */}
          <div className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3 sm:gap-4">
                <button onClick={() => handleToggleLike(post.id)} className="flex items-center gap-1 sm:gap-2 group">
                  <Heart
                    className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors ${user && post.likedBy?.includes(user.uid) ? "fill-destructive text-destructive" : "text-foreground group-hover:text-destructive"}`}
                  />
                  <span className="text-xs sm:text-sm font-medium text-foreground">{post.likes}</span>
                </button>
                <button onClick={() => toggleComments(post.id)} className="flex items-center gap-1 sm:gap-2 group">
                  <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-foreground group-hover:text-primary transition-colors" />
                  <span className="text-xs sm:text-sm font-medium text-foreground">{post.comments}</span>
                </button>
                <button className="flex items-center gap-1 sm:gap-2 group">
                  <Share2 className="w-5 h-5 sm:w-6 sm:h-6 text-foreground group-hover:text-primary transition-colors" />
                </button>
              </div>
              <button onClick={() => handleToggleSave(post.id)}>
                <Bookmark
                  className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors ${user && post.savedBy?.includes(user.uid) ? "fill-primary text-primary" : "text-foreground hover:text-primary"}`}
                />
              </button>
            </div>

            {/* Post Content */}
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{post.location}</span>
              </div>
              <p className="text-sm sm:text-base text-foreground leading-relaxed">
                <span className="font-semibold">{post.author.name}</span> {post.content}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">{formatTimestamp(post.timestamp)}</p>
            </div>

            {/* Comments Section */}
            {showComments[post.id] && (
              <div className="mt-4 pt-4 border-t space-y-4">
                {/* Comments List */}
                {comments[post.id]?.map((comment) => (
                  <div key={comment.id} className="flex gap-2 sm:gap-3">
                    <Avatar className="w-8 h-8 sm:w-9 sm:h-9 ring-1 ring-border shadow-sm flex-shrink-0">
                      {comment.author.photoURL ? (
                        <AvatarImage src={comment.author.photoURL} alt={comment.author.name} className="object-cover" />
                      ) : null}
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-xs">
                        {comment.author.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-muted rounded-lg px-3 py-2">
                        <p className="font-semibold text-sm">{comment.author.name}</p>
                        <p className="text-sm text-foreground">{comment.content}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-1 px-3">
                        <p className="text-xs text-muted-foreground">{formatTimestamp(comment.timestamp)}</p>
                        {user && comment.userId === user.uid && (
                          <button
                            onClick={() => handleDeleteComment(comment.id, post.id)}
                            className="text-xs text-destructive hover:underline"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add Comment Input */}
                {user && (
                  <div className="flex gap-2 sm:gap-3">
                    <Avatar className="w-8 h-8 sm:w-9 sm:h-9 ring-1 ring-border shadow-sm flex-shrink-0">
                      {user.photoURL ? (
                        <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} className="object-cover" />
                      ) : null}
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-xs">
                        {user.displayName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 flex gap-2">
                      <Input
                        placeholder="Write a comment..."
                        value={commentText[post.id] || ''}
                        onChange={(e) => setCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleAddComment(post.id)
                          }
                        }}
                        disabled={commentLoading[post.id]}
                      />
                      <Button
                        size="icon"
                        onClick={() => handleAddComment(post.id)}
                        disabled={!commentText[post.id]?.trim() || commentLoading[post.id]}
                      >
                        {commentLoading[post.id] ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      ))}

      {/* Edit Post Dialog */}
      <EditPostDialog
        key={postToEdit?.id || 'edit-dialog'}
        open={editDialogOpen && postToEdit !== null}
        onOpenChange={(open) => {
          setEditDialogOpen(open)
          if (!open) {
            setTimeout(() => setPostToEdit(null), 100)
          }
        }}
        postId={postToEdit?.id || ''}
        initialContent={postToEdit?.content || ''}
        initialLocation={postToEdit?.location || ''}
        onPostUpdated={loadPosts}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
