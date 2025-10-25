"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, Clock, ChevronRight } from "lucide-react"
import Link from "next/link"
import { getTrips, type Trip } from "@/lib/trips-storage"
import { DeleteTripDialog } from "@/components/delete-trip-dialog"

export function TripsList() {
  const [trips, setTrips] = useState<Trip[]>([])

  useEffect(() => {
    setTrips(getTrips())

    const handleStorageChange = () => {
      setTrips(getTrips())
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  const getDuration = (start: string, end: string) => {
    const days = Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24))
    return `${days} days`
  }

  if (trips.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No trips yet</h3>
          <p className="text-muted-foreground mb-6">
            Start planning your next adventure with AI-powered recommendations
          </p>
          <Button asChild>
            <Link href="/explore">Explore Destinations</Link>
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {trips.map((trip) => (
        <div key={trip.id} className="relative group">
          <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <DeleteTripDialog tripId={trip.id} tripName={trip.name} />
          </div>

          <Link href={`/trips/${trip.id}`}>
            <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
              <div className="h-48 bg-muted overflow-hidden">
                <img
                  src={trip.imageUrl || "/placeholder.svg"}
                  alt={trip.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                      {trip.name}
                    </h3>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{trip.destination}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{getDuration(trip.startDate, trip.endDate)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{trip.travelers} travelers</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                  </span>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      ))}
    </div>
  )
}
