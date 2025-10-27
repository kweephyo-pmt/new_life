"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, Clock, ChevronRight } from "lucide-react"
import Link from "next/link"
import { getTrips, updateTrip, type Trip } from "@/lib/trips-storage"
import { DeleteTripDialog } from "@/components/delete-trip-dialog"
import { useAuth } from "@/contexts/AuthContext"
import { getTripsWithCurrentStatus } from "@/lib/trip-utils"

export function TripsList() {
  const { user } = useAuth()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [destinationImages, setDestinationImages] = useState<Record<string, string>>({})

  const loadTrips = async () => {
    if (!user) return
    setLoading(true)
    try {
      const userTrips = await getTrips(user.uid)
      // Update trip statuses based on current date
      const tripsWithStatus = getTripsWithCurrentStatus(userTrips)
      setTrips(tripsWithStatus)
      
      // Fetch Google Places photos for trips that don't have imageUrl yet
      const tripsNeedingPhotos = userTrips.filter(t => !t.imageUrl || t.imageUrl === '' || t.imageUrl.startsWith('/trips/'))
      
      if (tripsNeedingPhotos.length > 0) {
        const imagePromises = tripsNeedingPhotos.map(async (trip) => {
          try {
            const response = await fetch(`/api/destination-photo?destination=${encodeURIComponent(trip.destination)}`)
            const data = await response.json()
            
            // If we got a valid imageUrl, save it to Firestore
            if (data.imageUrl) {
              console.log(`Saving photo for ${trip.destination}:`, data.imageUrl)
              // Update trip in Firestore directly (client-side with auth)
              const success = await updateTrip(trip.id, user.uid, { imageUrl: data.imageUrl })
              console.log(`Update result for ${trip.destination}:`, success)
              return { tripId: trip.id, destination: trip.destination, imageUrl: data.imageUrl }
            } else {
              console.warn(`No image found for ${trip.destination}:`, data.error)
              return { tripId: trip.id, destination: trip.destination, imageUrl: null }
            }
          } catch (error) {
            console.error(`Error fetching image for ${trip.destination}:`, error)
            return { tripId: trip.id, destination: trip.destination, imageUrl: null }
          }
        })
        
        const images = await Promise.all(imagePromises)
        const imageMap: Record<string, string> = {}
        images.forEach(({ destination, imageUrl }) => {
          if (imageUrl) imageMap[destination] = imageUrl
        })
        setDestinationImages(imageMap)
      }
    } catch (error) {
      console.error('Error loading trips:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTrips()
  }, [user])

  // Expose refresh function for child components
  useEffect(() => {
    const handleRefresh = () => loadTrips()
    window.addEventListener('refreshTrips', handleRefresh)
    return () => window.removeEventListener('refreshTrips', handleRefresh)
  }, [user])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  const getDuration = (start: string, end: string) => {
    const days = Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24))
    return `${days} days`
  }

  // Get destination-specific photo from Google Places
  const getDestinationPhoto = (destination: string) => {
    // Return Google Places photo if available
    const photo = destinationImages[destination]
    if (photo && photo !== 'null') {
      return photo
    }
    // If no photo available, return null to show placeholder
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
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
            <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer border-0 shadow-md bg-card group/card">
              <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                {(() => {
                  const photoUrl = trip.imageUrl && !trip.imageUrl.startsWith('/trips/') ? trip.imageUrl : getDestinationPhoto(trip.destination)
                  return photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={trip.name}
                      className="w-full h-full object-cover object-center group-hover/card:scale-105 transition-transform duration-700 ease-out"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <MapPin className="w-16 h-16 text-muted-foreground/30" />
                    </div>
                  )
                })()}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-1 group-hover/card:text-primary transition-colors">
                      {trip.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {trip.destination}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover/card:text-primary group-hover/card:translate-x-1 transition-all" />
                </div>
                
                <div className="text-2xl font-bold text-foreground mb-4">
                  ฿{trip.budget.toLocaleString()}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{getDuration(trip.startDate, trip.endDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{trip.travelers} {trip.travelers === 1 ? 'traveler' : 'travelers'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-md bg-primary/10 text-primary text-xs font-medium uppercase tracking-wide">
                    {trip.status}
                  </span>
                  <span className="text-sm text-primary font-medium group-hover/card:underline">View details</span>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      ))}
    </div>
  )
}
