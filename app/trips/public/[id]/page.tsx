'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Calendar, Users, DollarSign, Clock, Sparkles } from 'lucide-react'
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
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  }

  const getDuration = (start: string, end: string) => {
    const days = Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24))
    return `${days} days`
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
      <div className="relative h-64 sm:h-80 md:h-96 bg-gradient-to-br from-primary/5 to-primary/10 overflow-hidden">
        {trip.imageUrl && trip.imageUrl !== '/placeholder.svg' ? (
          <img 
            src={trip.imageUrl} 
            alt={trip.name} 
            className="w-full h-full object-cover object-center" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MapPin className="w-24 h-24 text-primary/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <div className="container mx-auto max-w-5xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium mb-3">
              <Sparkles className="w-4 h-4" />
              <span className="uppercase tracking-wide">Shared Trip</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 drop-shadow-lg">
              {trip.name}
            </h1>
            <div className="flex flex-wrap gap-4 text-white/90">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span className="font-medium">{trip.destination}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{getDuration(trip.startDate, trip.endDate)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-8 sm:py-12">
        <div className="max-w-5xl mx-auto">
          {/* Trip Info Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium uppercase tracking-wide">Dates</span>
              </div>
              <p className="text-sm font-semibold text-foreground">
                {formatDate(trip.startDate)}
              </p>
              <p className="text-xs text-muted-foreground">to {formatDate(trip.endDate)}</p>
            </div>
            
            <div className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium uppercase tracking-wide">Duration</span>
              </div>
              <p className="text-lg font-bold text-foreground">
                {getDuration(trip.startDate, trip.endDate)}
              </p>
            </div>
            
            <div className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium uppercase tracking-wide">Travelers</span>
              </div>
              <p className="text-lg font-bold text-foreground">
                {trip.travelers}
              </p>
            </div>
            
            <div className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <DollarSign className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium uppercase tracking-wide">Budget</span>
              </div>
              <p className="text-lg font-bold text-foreground">
                ฿{trip.budget.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Preferences Card */}
          {trip.preferences && (
            <div className="bg-card rounded-xl border border-border p-6 mb-8 shadow-sm">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Trip Preferences
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{trip.preferences}</p>
            </div>
          )}

          {/* CTA Card */}
          <div className="bg-card rounded-xl border border-border p-6 mb-8 shadow-sm">
            <div className="bg-primary/10 rounded-lg p-4 text-center">
              <p className="text-sm font-medium mb-3">
                {user ? "Want to create your own trip?" : "Love this trip? Create your own with AI!"}
              </p>
              <div className="flex gap-2 justify-center">
                {user ? (
                  <Link href="/trips">
                    <Button className="h-10">Go to My Trips</Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/signup">
                      <Button className="h-10">Get Started Free</Button>
                    </Link>
                    <Link href="/login">
                      <Button variant="outline" className="h-10">Sign In</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Itinerary Section */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <RealtimeItinerary tripId={tripId} isPublicView={true} />
          </div>

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
