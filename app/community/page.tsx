'use client'

import { MessageSquare, Sparkles, Bookmark, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TravelFeed } from "@/components/travel-feed"
import { MainNav } from "@/components/main-nav"
import { Logo } from "@/components/logo"
import { CreatePostDialog } from "@/components/create-post-dialog"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { getSavedPosts, type Post as FirestorePost } from "@/lib/posts-storage"

export default function CommunityPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo />
            <span className="text-2xl font-bold text-foreground">New Life</span>
          </Link>
          <MainNav />
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary/5 to-background border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-2">
                  <Sparkles className="w-8 h-8 text-primary" />
                  Travel Community
                </h1>
                <p className="text-lg text-muted-foreground">Share your adventures and get inspired by fellow travelers</p>
              </div>
              <CreatePostDialog onPostCreated={() => setRefreshKey(prev => prev + 1)} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <Tabs defaultValue="feed" className="space-y-6">
            <div className="flex justify-center mb-6">
              <TabsList className="grid w-full max-w-3xl grid-cols-2 h-12">
                <TabsTrigger value="feed" className="text-lg">Feed</TabsTrigger>
                <TabsTrigger value="saved" className="text-lg">Saved</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="feed" className="space-y-6">
              <TravelFeed key={refreshKey} />
            </TabsContent>

            <TabsContent value="saved">
              <TravelFeed key={`saved-${refreshKey}`} filterSaved={true} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
