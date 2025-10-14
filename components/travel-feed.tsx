"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { Heart, MessageCircle, Share2, Bookmark, MapPin, MoreVertical } from "lucide-react"

interface Post {
  id: string
  author: {
    name: string
    avatar: string
    username: string
  }
  content: string
  location: string
  images: string[]
  likes: number
  comments: number
  timestamp: string
  isLiked: boolean
  isSaved: boolean
}

export function TravelFeed() {
  const [posts, setPosts] = useState<Post[]>([
    {
      id: "1",
      author: {
        name: "Sarah Johnson",
        avatar: "SJ",
        username: "@sarahtravels",
      },
      content:
        "Just spent an incredible week exploring Tokyo! The blend of traditional temples and modern technology is absolutely mesmerizing. Can't wait to come back!",
      location: "Tokyo, Japan",
      images: ["/trips/tokyo-night.jpg"],
      likes: 234,
      comments: 18,
      timestamp: "2 hours ago",
      isLiked: false,
      isSaved: false,
    },
    {
      id: "2",
      author: {
        name: "Michael Chen",
        avatar: "MC",
        username: "@mikeexplores",
      },
      content:
        "Sunrise at Mount Fuji was worth the early wake-up call. One of the most peaceful moments of my life. Highly recommend the climb!",
      location: "Mount Fuji, Japan",
      images: ["/trips/mount-fuji.jpg"],
      likes: 567,
      comments: 42,
      timestamp: "5 hours ago",
      isLiked: true,
      isSaved: false,
    },
    {
      id: "3",
      author: {
        name: "Emma Wilson",
        avatar: "EW",
        username: "@emmawanders",
      },
      content:
        "The bamboo forest in Kyoto is like stepping into another world. So serene and beautiful. Added it to my top 10 favorite places!",
      location: "Arashiyama, Kyoto",
      images: ["/trips/kyoto-bamboo.jpg"],
      likes: 892,
      comments: 67,
      timestamp: "1 day ago",
      isLiked: false,
      isSaved: true,
    },
  ])

  const toggleLike = (postId: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post,
      ),
    )
  }

  const toggleSave = (postId: string) => {
    setPosts(posts.map((post) => (post.id === postId ? { ...post, isSaved: !post.isSaved } : post)))
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <Card key={post.id} className="overflow-hidden">
          {/* Post Header */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 bg-primary text-primary-foreground flex items-center justify-center">
                <span className="text-sm font-semibold">{post.author.avatar}</span>
              </Avatar>
              <div>
                <p className="font-semibold text-foreground">{post.author.name}</p>
                <p className="text-sm text-muted-foreground">{post.author.username}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </div>

          {/* Post Image */}
          <div className="relative h-96 bg-muted">
            <img src={post.images[0] || "/placeholder.svg"} alt={post.content} className="w-full h-full object-cover" />
          </div>

          {/* Post Actions */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <button onClick={() => toggleLike(post.id)} className="flex items-center gap-2 group">
                  <Heart
                    className={`w-6 h-6 transition-colors ${post.isLiked ? "fill-destructive text-destructive" : "text-foreground group-hover:text-destructive"}`}
                  />
                  <span className="text-sm font-medium text-foreground">{post.likes}</span>
                </button>
                <button className="flex items-center gap-2 group">
                  <MessageCircle className="w-6 h-6 text-foreground group-hover:text-primary transition-colors" />
                  <span className="text-sm font-medium text-foreground">{post.comments}</span>
                </button>
                <button className="flex items-center gap-2 group">
                  <Share2 className="w-6 h-6 text-foreground group-hover:text-primary transition-colors" />
                </button>
              </div>
              <button onClick={() => toggleSave(post.id)}>
                <Bookmark
                  className={`w-6 h-6 transition-colors ${post.isSaved ? "fill-primary text-primary" : "text-foreground hover:text-primary"}`}
                />
              </button>
            </div>

            {/* Post Content */}
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{post.location}</span>
              </div>
              <p className="text-foreground leading-relaxed">
                <span className="font-semibold">{post.author.name}</span> {post.content}
              </p>
              <p className="text-sm text-muted-foreground">{post.timestamp}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
