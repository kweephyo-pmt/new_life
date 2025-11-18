'use client'

import { Calendar, MapPin, Users, Banknote, Clock, Sparkles } from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RealtimeItinerary } from "@/components/realtime-itinerary"
import { GenerateItineraryButton } from "@/components/generate-itinerary-button"
import { ShareTripDialog } from "@/components/share-trip-dialog"
import { BudgetOptimizer } from "@/components/budget-optimizer"
import { OptimalTiming } from "@/components/optimal-timing"
import { MainNav } from "@/components/main-nav"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect, useState, use } from "react"
import { getTripById, type Trip } from "@/lib/trips-storage"
import { DeleteTripDialog } from "@/components/delete-trip-dialog"
import { EditTripDialog } from "@/components/edit-trip-dialog"

export default function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)

  // Allow public viewing - don't redirect to login
  // useEffect(() => {
  //   if (!authLoading && !user) {
  //     router.push('/login')
  //   }
  // }, [user, authLoading, router])

  const loadTrip = async () => {
    // Allow loading trip even without user (for public sharing)
    setLoading(true)
    try {
      const tripData = await getTripById(id, user?.uid || '')
      setTrip(tripData)
    } catch (error) {
      console.error('Error loading trip:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTrip()
  }, [id, user])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
  }

  const getDuration = (start: string, end: string) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return "—"
    }

    const diffMs = endDate.getTime() - startDate.getTime()
    const days = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1)
    return `${days} days`
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!user || !trip) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Logo />
              <span className="text-2xl font-bold text-foreground">New Life</span>
            </Link>
            <MainNav />
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Trip not found</h1>
            <Button asChild>
              <Link href="/trips">Back to My Trips</Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo />
            <span className="text-xl sm:text-2xl font-bold text-foreground">New Life</span>
          </Link>
          <MainNav />
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
              <span className="uppercase tracking-wide">{trip.status}</span>
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
                <Banknote className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium uppercase tracking-wide">Budget (THB)</span>
              </div>
              <p className="text-lg font-bold text-foreground">
                ฿{trip.budget.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-card rounded-xl border border-border p-6 mb-8 shadow-sm">

            {user ? (
              // Authenticated user - show all controls
              <div className="flex flex-col sm:flex-row gap-3">
                <GenerateItineraryButton
                  tripId={trip.id}
                  destination={trip.destination}
                  startDate={trip.startDate}
                  endDate={trip.endDate}
                  travelers={trip.travelers}
                  budget={trip.budget}
                  preferences={trip.preferences}
                  onGenerated={() => {
                    // Trigger refresh of itinerary component
                    window.dispatchEvent(new Event('refreshItinerary'))
                  }}
                />
                <div className="flex gap-2 sm:gap-3">
                  <EditTripDialog trip={trip} onUpdate={loadTrip}>
                    <Button 
                      variant="outline" 
                      className="flex-1 sm:flex-none h-10 px-4 sm:px-6 font-medium border-2 hover:bg-primary/10 hover:border-primary/30 transition-all"
                    >
                      Edit Trip
                    </Button>
                  </EditTripDialog>
                  <ShareTripDialog tripName={trip.name} tripId={trip.id}>
                    <Button 
                      variant="outline" 
                      className="flex-1 sm:flex-none h-10 px-4 sm:px-6 font-medium border-2 hover:bg-primary/10 hover:border-primary/30 transition-all"
                    >
                      Share
                    </Button>
                  </ShareTripDialog>
                  <DeleteTripDialog tripId={trip.id} tripName={trip.name} redirectAfterDelete={true} />
                </div>
              </div>
            ) : (
              // Public viewer - show CTA to sign up
              <div className="flex flex-col gap-3">
                <div className="bg-primary/10 rounded-lg p-4 text-center">
                  <p className="text-sm font-medium mb-3">Love this trip? Create your own with AI!</p>
                  <div className="flex gap-2 justify-center">
                    <Link href="/signup">
                      <Button className="h-10">Get Started Free</Button>
                    </Link>
                    <Link href="/login">
                      <Button variant="outline" className="h-10">Sign In</Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Tabs defaultValue="itinerary" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 h-12 bg-muted/50 p-1 rounded-xl">
              <TabsTrigger value="itinerary" className="text-xs sm:text-sm px-2 sm:px-4 py-2">
                <span className="hidden sm:inline">Real-Time Itinerary</span>
                <span className="sm:hidden">Itinerary</span>
              </TabsTrigger>
              <TabsTrigger value="budget" className="text-xs sm:text-sm px-2 sm:px-4 py-2">
                <span className="hidden sm:inline">Budget Optimizer</span>
                <span className="sm:hidden">Budget</span>
              </TabsTrigger>
              <TabsTrigger value="timing" className="text-xs sm:text-sm px-2 sm:px-4 py-2">
                <span className="hidden sm:inline">Optimal Timing</span>
                <span className="sm:hidden">Timing</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="itinerary" className="overflow-visible">
              <RealtimeItinerary tripId={trip.id} isPublicView={!user || trip.userId !== user.uid} />
            </TabsContent>

            <TabsContent value="budget" className="overflow-visible">
              <BudgetOptimizer tripId={trip.id} totalBudget={trip.budget} />
            </TabsContent>

            <TabsContent value="timing" className="overflow-visible">
              <OptimalTiming destination={trip.destination} startDate={trip.startDate} endDate={trip.endDate} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
