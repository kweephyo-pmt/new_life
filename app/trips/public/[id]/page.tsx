'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Calendar, Users, DollarSign, ArrowLeft } from 'lucide-react'
import { Logo } from '@/components/logo'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getTripById, type Trip } from '@/lib/trips-storage'
import { RealtimeItinerary } from '@/components/realtime-itinerary'
import { useAuth } from '@/contexts/AuthContext'
import { MainNav } from '@/components/main-nav'

export default function PublicTripPage() {
  const params = useParams()
  const tripId = params.id as string
  const { user } = useAuth()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTrip()
  }, [tripId])

  const loadTrip = async () => {
    setLoading(true)
    try {
      // For public view, we pass empty userId since we don't require authentication
      const tripData = await getTripById(tripId, '')
      setTrip(tripData)
    } catch (error) {
      console.error('Error loading trip:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Trip Not Found</h1>
          <p className="text-muted-foreground mb-4">This trip doesn't exist or has been removed.</p>
          <Link href="/">
            <Button>Go to Homepage</Button>
          </Link>
        </div>
      </div>
    )
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
          {user ? (
            <MainNav />
          ) : (
            <div className="flex gap-2">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative h-48 sm:h-64 bg-muted overflow-hidden">
        <img 
          src={trip.imageUrl || "/placeholder.svg"} 
          alt={trip.name} 
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 -mt-16 sm:-mt-20 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Trip Header */}
          <div className="bg-card rounded-xl sm:rounded-2xl border border-border p-4 sm:p-8 mb-6 sm:mb-8 shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-2xl sm:text-4xl font-bold text-foreground">{trip.name}</h1>
              <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                Shared Trip
              </div>
            </div>

            <div className="flex flex-wrap gap-3 sm:gap-6 text-sm sm:text-base text-muted-foreground mb-4">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                <span>{trip.destination}</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                <span className="text-xs sm:text-base">
                  {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                <span>{trip.travelers} travelers</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                <span>฿{trip.budget.toLocaleString()} budget</span>
              </div>
            </div>

            {trip.preferences && (
              <div className="bg-muted/50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold mb-2">Trip Preferences</h3>
                <p className="text-sm text-muted-foreground">{trip.preferences}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t">
              <Link href={user ? "/trips" : "/signup"} className="flex-1">
                <Button className="w-full">
                  {user ? "Go to My Trips" : "Create Your Own Trip"}
                </Button>
              </Link>
            </div>
          </div>

          {/* Itinerary Section */}
          <Card className="p-6">
            <RealtimeItinerary tripId={tripId} isPublicView={true} />
          </Card>

          {/* CTA Section */}
          {!user && (
            <Card className="p-8 text-center mt-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <h2 className="text-2xl font-bold mb-2">Love this trip?</h2>
              <p className="text-muted-foreground mb-6">
                Create your own AI-powered travel itinerary with New Life
              </p>
              <div className="flex gap-3 justify-center">
                <Link href="/signup">
                  <Button size="lg">Get Started Free</Button>
                </Link>
                <Link href="/">
                  <Button size="lg" variant="outline">Learn More</Button>
                </Link>
              </div>
            </Card>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 New Life. Your AI-powered travel companion.</p>
        </div>
      </footer>
    </div>
  )
}
