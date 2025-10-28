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
      <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              <span>Connect with travelers worldwide</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold text-foreground mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Travel Community
            </h1>
            <p className="text-base sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Share your adventures, discover hidden gems, and connect with fellow travelers from around the world
            </p>
            <CreatePostDialog onPostCreated={() => setRefreshKey(prev => prev + 1)} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="feed" className="space-y-8">
            {/* Tabs Navigation */}
            <div className="flex justify-center">
              <TabsList className="inline-flex h-12 items-center justify-center rounded-xl bg-muted p-1 text-muted-foreground shadow-sm">
                <TabsTrigger 
                  value="feed" 
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-6 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Feed
                </TabsTrigger>
                <TabsTrigger 
                  value="saved"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-6 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                >
                  <Bookmark className="w-4 h-4 mr-2" />
                  Saved
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Feed Content */}
            <TabsContent value="feed" className="mt-0 space-y-6">
              <TravelFeed key={refreshKey} />
            </TabsContent>

            {/* Saved Content */}
            <TabsContent value="saved" className="mt-0 space-y-6">
              <TravelFeed key={`saved-${refreshKey}`} filterSaved={true} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
