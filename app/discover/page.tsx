'use client'

import { Compass } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DestinationMap } from "@/components/destination-map"
import { PhotoGallery } from "@/components/photo-gallery"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MainNav } from "@/components/main-nav"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function DiscoverPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

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
            <Compass className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">New Life</span>
          </Link>
          <MainNav />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Discover Destinations</h1>
            <p className="text-muted-foreground">Explore the world through interactive maps and stunning photography</p>
          </div>

          <Tabs defaultValue="map" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="map">Interactive Map</TabsTrigger>
              <TabsTrigger value="gallery">Photo Gallery</TabsTrigger>
            </TabsList>

            <TabsContent value="map" className="mt-6">
              <DestinationMap />
            </TabsContent>

            <TabsContent value="gallery" className="mt-6">
              <PhotoGallery />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
