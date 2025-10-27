"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, Search, Navigation, Star, Bookmark, Loader2 } from "lucide-react"

declare global {
  interface Window {
    google: any
    initMap: () => void
  }
}

interface Location {
  id: string
  name: string
  country: string
  lat: number
  lng: number
  rating: number
  description: string
  imageUrl: string
}

export function DestinationMap() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [mapLoading, setMapLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [nearbyPlaces, setNearbyPlaces] = useState<Location[]>([])
  const mapRef = useRef<HTMLDivElement>(null)
  const googleMapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const placesServiceRef = useRef<any>(null)

  const filteredLocations = nearbyPlaces.filter(
    (loc) =>
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.country.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Search for nearby places
  const searchNearbyPlaces = async (map: any, center: { lat: number; lng: number }) => {
    try {
      console.log('Searching for places near:', center)
      
      if (!window.google?.maps?.places?.PlacesService) {
        console.error('Places API not available')
        return
      }
      
      // Use the legacy PlacesService for now (still works)
      const service = new window.google.maps.places.PlacesService(map)
      
      const request = {
        location: center,
        radius: 5000,
        type: ['tourist_attraction'],
      }

      console.log('Making nearbySearch request...')
      
      try {
        service.nearbySearch(request, (results: any, status: any) => {
          console.log('Callback executed!')
          console.log('Places search status:', status)
          console.log('Status values:', window.google.maps.places.PlacesServiceStatus)
          console.log('Places found:', results?.length)
          console.log('Full results:', results)
        
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
          try {
            const places: Location[] = results.slice(0, 20).map((place: any, index: number) => ({
              id: place.place_id || `place-${index}`,
              name: place.name || 'Unknown',
              country: place.vicinity || '',
              lat: place.geometry?.location?.lat() || 0,
              lng: place.geometry?.location?.lng() || 0,
              rating: place.rating || 0,
              description: place.types?.join(', ') || 'Point of interest',
              imageUrl: place.photos?.[0]?.getUrl({ maxWidth: 400 }) || '/placeholder.svg',
            }))

            console.log('Converted places:', places)
            setNearbyPlaces(places)

            // Add markers
            const newMarkers = places.map((location) => {
              const marker = new window.google.maps.Marker({
                position: { lat: location.lat, lng: location.lng },
                map: map,
                title: location.name,
              })

              marker.addListener('click', () => {
                setSelectedLocation(location)
                map.panTo({ lat: location.lat, lng: location.lng })
              })

              return marker
            })

            markersRef.current = newMarkers
            console.log('Added markers:', newMarkers.length)
          } catch (err) {
            console.error('Error processing places:', err)
          }
        } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          console.log('No places found in this area')
          setNearbyPlaces([])
        } else {
          console.error('Places search failed with status:', status)
          setNearbyPlaces([])
        }
        })
      } catch (error) {
        console.error('Error calling nearbySearch:', error)
      }
    } catch (error) {
      console.error('Error searching places:', error)
    }
  }

  // Get user's location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.log('Geolocation error:', error)
          // Fallback to Tokyo if location denied
          setUserLocation({ lat: 35.6762, lng: 139.6503 })
        }
      )
    } else {
      // Fallback to Tokyo if geolocation not supported
      setUserLocation({ lat: 35.6762, lng: 139.6503 })
    }
  }, [])

  // Load Google Maps script
  useEffect(() => {
    if (!userLocation) return // Wait for user location

    const loadGoogleMaps = () => {
      if (window.google?.maps?.Map) {
        initializeMap()
        return
      }

      // Set up callback FIRST
      (window as any).initMap = () => {
        initializeMap()
      }
      
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}&libraries=places&callback=initMap`
      script.setAttribute('async', '')
      script.setAttribute('defer', '')
      
      script.onerror = () => {
        console.error('Failed to load Google Maps')
        setMapLoading(false)
      }
      
      document.head.appendChild(script)
    }

    const initializeMap = () => {
      if (!mapRef.current || !window.google?.maps?.Map || !userLocation) return

      try {
        const map = new window.google.maps.Map(mapRef.current, {
          center: userLocation,
          zoom: 12,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }],
            },
          ],
        })

        googleMapRef.current = map

        // Add user location marker
        new window.google.maps.Marker({
          position: userLocation,
          map: map,
          title: 'Your Location',
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#4285F4',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
        })

        // Search for nearby places using Places API
        searchNearbyPlaces(map, userLocation)
        setMapLoading(false)
      } catch (error) {
        console.error('Error initializing Google Maps:', error)
        setMapLoading(false)
      }
    }

    loadGoogleMaps()

    // Cleanup
    return () => {
      markersRef.current.forEach((marker: any) => marker.setMap(null))
      markersRef.current = []
      // Clean up callback
      delete (window as any).initMap
    }
  }, [userLocation])

  // Update markers when search changes
  useEffect(() => {
    if (!googleMapRef.current) return

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null))

    // Add new markers for filtered locations
    const newMarkers = filteredLocations.map((location) => {
      const marker = new (window as any).google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map: googleMapRef.current,
        title: location.name,
      })

      marker.addListener('click', () => {
        setSelectedLocation(location)
        googleMapRef.current?.panTo({ lat: location.lat, lng: location.lng })
      })

      return marker
    })

    markersRef.current = newMarkers
  }, [searchQuery, filteredLocations])

  const handleMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        googleMapRef.current?.setCenter(pos)
        googleMapRef.current?.setZoom(14)
      })
    }
  }

  const handleResetView = () => {
    if (userLocation) {
      googleMapRef.current?.setCenter(userLocation)
      googleMapRef.current?.setZoom(12)
    }
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Map View */}
      <div className="lg:col-span-2">
        <Card className="p-6">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search destinations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Google Map Container */}
          <div className="relative h-[500px] bg-muted rounded-lg overflow-hidden">
            <div ref={mapRef} className="w-full h-full" />
            
            {mapLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 text-primary mx-auto mb-2 animate-spin" />
                  <p className="text-muted-foreground">Loading map...</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleMyLocation}>
                <Navigation className="w-4 h-4 mr-2" />
                My Location
              </Button>
              <Button variant="outline" size="sm" onClick={handleResetView}>
                Reset View
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              {nearbyPlaces.length} places found
            </div>
          </div>
        </Card>
      </div>

      {/* Location Details */}
      <div>
        <Card className="p-6 sticky top-24">
          {selectedLocation ? (
            <div>
              <div className="h-48 bg-muted rounded-lg overflow-hidden mb-4">
                <img
                  src={selectedLocation.imageUrl || "/placeholder.svg"}
                  alt={selectedLocation.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <h3 className="text-xl font-bold text-foreground mb-2">{selectedLocation.name}</h3>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{selectedLocation.country}</span>
              </div>

              <div className="flex items-center gap-1 mb-4">
                <Star className="w-4 h-4 fill-primary text-primary" />
                <span className="font-semibold text-foreground">{selectedLocation.rating}</span>
                <span className="text-sm text-muted-foreground ml-1">(1,234 reviews)</span>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{selectedLocation.description}</p>

              <div className="flex gap-2">
                <Button className="flex-1">Add to Trip</Button>
                <Button variant="outline" size="icon">
                  <Bookmark className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Select a location on the map to view details</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
