"use client"

import { useEffect, useState } from "react"
import { Calendar, MapPin, Users, DollarSign } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RealtimeItinerary } from "@/components/realtime-itinerary"
import { GenerateItineraryButton } from "@/components/generate-itinerary-button"
import { ShareTripDialog } from "@/components/share-trip-dialog"
import { BudgetOptimizer } from "@/components/budget-optimizer"
import { OptimalTiming } from "@/components/optimal-timing"
import { AppHeader } from "@/components/app-header"
import { getTripById, type Trip } from "@/lib/trips-storage"
import { DeleteTripDialog } from "@/components/delete-trip-dialog"

export default function TripDetailPage({ params }: { params: { id: string } }) {
  const [trip, setTrip] = useState<Trip | null>(null)

  useEffect(() => {
    const loadedTrip = getTripById(params.id)
    setTrip(loadedTrip || null)
  }, [params.id])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
  }

  const getDuration = (start: string, end: string) => {
    const days = Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24))
    return `${days} days`
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
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
      <AppHeader />

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
                <span>${trip.budget.toLocaleString()} budget</span>
              </div>
            </div>

            <div className="flex gap-3">
              <GenerateItineraryButton
                tripId={trip.id}
                destination={trip.destination}
                duration={getDuration(trip.startDate, trip.endDate)}
              />
              <Button variant="outline">Edit Trip</Button>
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
