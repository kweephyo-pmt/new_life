import { Compass, Calendar, MapPin, Users, DollarSign } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ItineraryView } from "@/components/itinerary-view"
import { GenerateItineraryButton } from "@/components/generate-itinerary-button"
import { ShareTripDialog } from "@/components/share-trip-dialog"

export default function TripDetailPage({ params }: { params: { id: string } }) {
  // Mock trip data
  const trip = {
    id: params.id,
    name: "Tokyo Adventure",
    destination: "Tokyo, Japan",
    startDate: "2025-06-15",
    endDate: "2025-06-25",
    travelers: 2,
    budget: 5000,
    imageUrl: "/trips/tokyo-skyline.jpg",
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
  }

  const getDuration = (start: string, end: string) => {
    const days = Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24))
    return `${days} days`
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
          <nav className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/explore">Explore</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/trips">My Trips</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/budget">Budget</Link>
            </Button>
          </nav>
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
            </div>
          </div>

          {/* Itinerary Section */}
          <ItineraryView tripId={trip.id} />
        </div>
      </main>
    </div>
  )
}
