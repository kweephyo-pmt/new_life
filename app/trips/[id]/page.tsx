'use client'

import { Calendar, MapPin, Users, DollarSign } from "lucide-react"
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
import { getTripById, getTripByIdPublic, type Trip } from "@/lib/trips-storage"
import { DeleteTripDialog } from "@/components/delete-trip-dialog"
import { EditTripDialog } from "@/components/edit-trip-dialog"

export default function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)

  const loadTrip = async () => {
    setLoading(true)
    try {
      let tripData: Trip | null = null
      
      if (user) {
        // Try to load as owner first
        tripData = await getTripById(id, user.uid)
      }
      
      // If not owner or not logged in, try public access
      if (!tripData) {
        tripData = await getTripByIdPublic(id)
      }
      
      setTrip(tripData)
    } catch (error) {
      console.error('Error loading trip:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading) {
      loadTrip()
    }
  }, [id, user, authLoading])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
  }

  const getDuration = (start: string, end: string) => {
    const days = Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24))
    return `${days} days`
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!trip) {
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
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }
  
  const isOwner = user && trip.userId === user.uid

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
      <div className="relative h-48 sm:h-64 bg-muted overflow-hidden">
        <img src={trip.imageUrl || "/placeholder.svg"} alt={trip.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 -mt-16 sm:-mt-20 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Trip Header */}
          <div className="bg-card rounded-xl sm:rounded-2xl border border-border p-4 sm:p-8 mb-6 sm:mb-8 shadow-lg">
            <h1 className="text-2xl sm:text-4xl font-bold text-foreground mb-3 sm:mb-4">{trip.name}</h1>

            <div className="flex flex-wrap gap-3 sm:gap-6 text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
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

            {isOwner && (
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
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
            )}
          </div>

          {isOwner ? (
            <Tabs defaultValue="itinerary" className="space-y-4 sm:space-y-6">
              <TabsList className="grid w-full grid-cols-3 h-auto">
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
                <RealtimeItinerary tripId={trip.id} />
              </TabsContent>

              <TabsContent value="budget" className="overflow-visible">
                <BudgetOptimizer tripId={trip.id} totalBudget={trip.budget} />
              </TabsContent>

              <TabsContent value="timing" className="overflow-visible">
                <OptimalTiming destination={trip.destination} startDate={trip.startDate} endDate={trip.endDate} />
              </TabsContent>
            </Tabs>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-bold text-foreground">Itinerary</h2>
              </div>
              <RealtimeItinerary tripId={trip.id} />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
