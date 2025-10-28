'use client'

import { Plus, Sparkles, MapPin } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { TripsList } from "@/components/trips-list"
import { CreateTripDialog } from "@/components/create-trip-dialog"
import { MainNav } from "@/components/main-nav"
import { Logo } from "@/components/logo"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function TripsPage() {
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
            <Logo />
            <span className="text-2xl font-bold text-foreground">New Life</span>
          </Link>
          <MainNav />
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />
        <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Travel Planning</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              My Trips
            </h1>
            <p className="text-base sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Create, manage, and share your personalized travel itineraries with AI assistance
            </p>
            <CreateTripDialog>
              <Button size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
                <Plus className="w-5 h-5 mr-2" />
                Create New Trip
              </Button>
            </CreateTripDialog>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto">
          <TripsList />
        </div>
      </main>
    </div>
  )
}
