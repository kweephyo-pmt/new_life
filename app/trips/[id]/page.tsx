'use client'

import { Compass, Calendar, MapPin, Users, DollarSign } from "lucide-react"
import Link from "next/link"
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

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  const loadTrip = async () => {
    if (!user) return
    setLoading(true)
    try {
      const tripData = await getTripById(id, user.uid)
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

  if (!user || !trip) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Compass className="w-8 h-8 text-primary" />
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
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Compass className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">New Life</span>
          </Link>
          <MainNav />
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative h-64 bg-muted overflow-hidden">
        <img src={trip.imageUrl || "/placeholder.svg"} alt={trip.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 -mt-20 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Trip Header */}
          <div className="bg-card rounded-2xl border border-border p-8 mb-8 shadow-lg">
            <h1 className="text-4xl font-bold text-foreground mb-4">{trip.name}</h1>

            <div className="flex flex-wrap gap-6 text-muted-foreground mb-6">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                <span>{trip.destination}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <span>
                  {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <span>{trip.travelers} travelers</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                <span>฿{trip.budget.toLocaleString()} budget</span>
              </div>
            </div>

            <div className="flex gap-3">
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
              <EditTripDialog trip={trip} onUpdate={loadTrip}>
                <Button variant="outline">Edit Trip</Button>
              </EditTripDialog>
              <ShareTripDialog tripName={trip.name}>
                <Button variant="outline">Share</Button>
              </ShareTripDialog>
              <DeleteTripDialog tripId={trip.id} tripName={trip.name} redirectAfterDelete={true} />
            </div>
          </div>

          <Tabs defaultValue="itinerary" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="itinerary">Real-Time Itinerary</TabsTrigger>
              <TabsTrigger value="budget">Budget Optimizer</TabsTrigger>
              <TabsTrigger value="timing">Optimal Timing</TabsTrigger>
            </TabsList>

            <TabsContent value="itinerary">
              <RealtimeItinerary tripId={trip.id} />
            </TabsContent>

            <TabsContent value="budget">
              <BudgetOptimizer tripId={trip.id} totalBudget={trip.budget} />
            </TabsContent>

            <TabsContent value="timing">
              <OptimalTiming destination={trip.destination} startDate={trip.startDate} endDate={trip.endDate} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
