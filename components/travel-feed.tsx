"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Heart, MessageCircle, Share2, Bookmark, MapPin, MoreVertical, Loader2, Trash2, Pencil, Send } from "lucide-react"
import { getAllPosts, getSavedPosts, toggleLike, toggleSave, deletePost, addComment, getComments, deleteComment, setupPostsListener, setupCommentsListener, type Post as FirestorePost, type Comment } from "@/lib/posts-storage"
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
  const [commentUnsubscribers, setCommentUnsubscribers] = useState<Record<string, () => void>>({})

  useEffect(() => {
    // Set up real-time listener for posts
    const unsubscribe = setupPostsListener((updatedPosts: Post[]) => {
      setPosts(updatedPosts)
      setLoading(false)
    }, filterSaved, user?.uid)
    
    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [user, filterSaved])

  // Cleanup effect to ensure body is scrollable and clean up comment listeners
  useEffect(() => {
    return () => {
      document.body.style.pointerEvents = ''
      document.body.style.overflow = ''
      
      // Clean up all comment listeners
      Object.values(commentUnsubscribers).forEach(unsubscribe => {
        if (unsubscribe) unsubscribe()
      })
    }
  }, [commentUnsubscribers])

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
    
    // Optimistically update UI
    setPosts(prevPosts => prevPosts.map(post => {
      if (post.id === postId) {
        const isLiked = post.likedBy.includes(user.uid)
        return {
          ...post,
          likes: isLiked ? post.likes - 1 : post.likes + 1,
          likedBy: isLiked 
            ? post.likedBy.filter(id => id !== user.uid)
            : [...post.likedBy, user.uid]
        }
      }
      return post
    }))
    
    // Update in background
    await toggleLike(postId, user.uid)
  }

  const handleToggleSave = async (postId: string) => {
    if (!user) return
    
    // Optimistically update UI
    setPosts(prevPosts => prevPosts.map(post => {
      if (post.id === postId) {
        const isSaved = post.savedBy.includes(user.uid)
        return {
          ...post,
          savedBy: isSaved 
            ? post.savedBy.filter(id => id !== user.uid)
            : [...post.savedBy, user.uid]
        }
      }
      return post
    }))
    
    // Update in background
    await toggleSave(postId, user.uid)
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
      // Optimistically remove post from UI
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postToDelete))
      
      const success = await deletePost(postToDelete, user.uid)
      if (success) {
        toast.success('Post deleted successfully')
      } else {
        toast.error('Failed to delete post')
        // Reload if failed
        await loadPosts()
      }
    } catch (error) {
      console.error('Error deleting post:', error)
      toast.error('Failed to delete post')
      // Reload if error
      await loadPosts()
    } finally {
      setDeleteDialogOpen(false)
      setPostToDelete(null)
    }
  }

  const toggleComments = async (postId: string) => {
    const isCurrentlyShowing = showComments[postId]
    const willBeShowing = !isCurrentlyShowing
    
    setShowComments(prev => ({ ...prev, [postId]: willBeShowing }))
    
    if (willBeShowing) {
      // Opening comments - set up real-time listener if not already set up
      if (!commentUnsubscribers[postId]) {
        const unsubscribe = setupCommentsListener(postId, (updatedComments: Comment[]) => {
          setComments(prev => ({ ...prev, [postId]: updatedComments }))
        })
        
        if (unsubscribe) {
          setCommentUnsubscribers(prev => ({ ...prev, [postId]: unsubscribe }))
        }
      }
    } else {
      // Closing comments - clean up listener
      if (commentUnsubscribers[postId]) {
        commentUnsubscribers[postId]()
        setCommentUnsubscribers(prev => {
          const newUnsubs = { ...prev }
          delete newUnsubs[postId]
          return newUnsubs
        })
      }
    }
  }

  const handleAddComment = async (postId: string) => {
    if (!user || !commentText[postId]?.trim()) return
    
    setCommentLoading(prev => ({ ...prev, [postId]: true }))
    
    try {
      const commentContent = commentText[postId].trim()
      setCommentText(prev => ({ ...prev, [postId]: '' }))
      
      const success = await addComment(
        postId,
        user.uid,
        user.displayName || 'User',
        user.email?.split('@')[0] || 'user',
        commentContent,
        user.photoURL || undefined
      )
      
      if (!success) {
        toast.error('Failed to add comment')
        // Restore comment text on failure
        setCommentText(prev => ({ ...prev, [postId]: commentContent }))
      }
      // Real-time listener will handle adding the comment to UI
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
      // Real-time listener will handle the UI update
      const success = await deleteComment(commentId, user.uid, postId)
      if (success) {
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
    <div className="space-y-6">
      {posts.map((post) => (
        <Card key={post.id} className="overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-shadow duration-200">
          {/* Post Header */}
          <div className="p-4 sm:p-5 flex items-center justify-between border-b border-border/50">
            <div className="flex items-center gap-3">
              <Avatar className="w-11 h-11 sm:w-12 sm:h-12 ring-2 ring-primary/10 shadow-sm">
                {post.author.photoURL ? (
                  <AvatarImage src={post.author.photoURL} alt={post.author.name} className="object-cover" />
                ) : null}
                <AvatarFallback className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground font-semibold">
                  {post.author.avatar}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <p className="text-sm sm:text-base font-semibold text-foreground">{post.author.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>@{post.author.username}</span>
                  <span>•</span>
                  <span>{formatTimestamp(post.timestamp)}</span>
                </div>
              </div>
            </div>
            {user && post.userId === user.uid && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-muted">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => handleEditClick(post)} className="cursor-pointer">
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit Post
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive cursor-pointer"
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
          <div className="relative aspect-square sm:aspect-[4/3] bg-muted overflow-hidden">
            <img 
              src={post.images[0] || "/placeholder.svg"} 
              alt={post.content} 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
            />
          </div>

          {/* Post Actions */}
          <div className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4 sm:gap-6">
                <button 
                  onClick={() => handleToggleLike(post.id)} 
                  className="flex items-center gap-2 group hover:scale-110 transition-transform"
                >
                  <Heart
                    className={`w-6 h-6 transition-all ${
                      user && post.likedBy?.includes(user.uid) 
                        ? "fill-red-500 text-red-500 scale-110" 
                        : "text-muted-foreground group-hover:text-red-500 group-hover:scale-110"
                    }`}
                  />
                  <span className="text-sm font-semibold text-foreground">{post.likes}</span>
                </button>
                <button 
                  onClick={() => toggleComments(post.id)} 
                  className="flex items-center gap-2 group hover:scale-110 transition-transform"
                >
                  <MessageCircle className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="text-sm font-semibold text-foreground">{post.comments}</span>
                </button>
                <button className="group hover:scale-110 transition-transform">
                  <Share2 className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>
              </div>
              <button 
                onClick={() => handleToggleSave(post.id)}
                className="hover:scale-110 transition-transform"
              >
                <Bookmark
                  className={`w-6 h-6 transition-all ${
                    user && post.savedBy?.includes(user.uid) 
                      ? "fill-primary text-primary scale-110" 
                      : "text-muted-foreground hover:text-primary"
                  }`}
                />
              </button>
            </div>

            {/* Post Content */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="font-medium">{post.location}</span>
              </div>
              <p className="text-sm sm:text-base text-foreground leading-relaxed">
                <span className="font-semibold">{post.author.name}</span>{" "}
                <span className="text-muted-foreground">{post.content}</span>
              </p>
            </div>

            {/* Comments Section */}
            {showComments[post.id] && (
              <div className="mt-6 pt-5 border-t border-border/50">
                {/* Comments Header */}
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-foreground">
                    Comments {comments[post.id]?.length > 0 && `(${comments[post.id].length})`}
                  </h4>
                </div>

                {/* Comments List */}
                <div className="space-y-4 mb-4">
                  {comments[post.id]?.length > 0 ? (
                    comments[post.id].map((comment) => (
                      <div key={comment.id} className="flex gap-3 group">
                        <Avatar className="w-9 h-9 ring-2 ring-primary/10 shadow-sm flex-shrink-0">
                          {comment.author.photoURL ? (
                            <AvatarImage src={comment.author.photoURL} alt={comment.author.name} className="object-cover" />
                          ) : null}
                          <AvatarFallback className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground text-xs font-semibold">
                            {comment.author.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="bg-muted/50 rounded-2xl px-4 py-2.5 hover:bg-muted/70 transition-colors">
                            <p className="font-semibold text-sm text-foreground mb-0.5">{comment.author.name}</p>
                            <p className="text-sm text-foreground/90 leading-relaxed break-words">{comment.content}</p>
                          </div>
                          <div className="flex items-center gap-3 mt-1.5 px-4">
                            <span className="text-xs text-muted-foreground font-medium">
                              {formatTimestamp(comment.timestamp)}
                            </span>
                            {user && comment.userId === user.uid && (
                              <button
                                onClick={() => handleDeleteComment(comment.id, post.id)}
                                className="text-xs text-destructive hover:text-destructive/80 font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No comments yet. Be the first to comment!
                    </p>
                  )}
                </div>

                {/* Add Comment Input */}
                {user && (
                  <div className="flex gap-3 pt-2">
                    <Avatar className="w-9 h-9 ring-2 ring-primary/10 shadow-sm flex-shrink-0">
                      {user.photoURL ? (
                        <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} className="object-cover" />
                      ) : null}
                      <AvatarFallback className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground text-xs font-semibold">
                        {user.displayName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 flex gap-2">
                      <div className="relative flex-1">
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
                          className="pr-12 rounded-full border-2 focus:border-primary transition-colors"
                        />
                      </div>
                      <Button
                        size="icon"
                        onClick={() => handleAddComment(post.id)}
                        disabled={!commentText[post.id]?.trim() || commentLoading[post.id]}
                        className="rounded-full h-10 w-10 shadow-sm hover:shadow-md transition-all"
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
