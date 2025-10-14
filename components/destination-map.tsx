"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, Search, Navigation, Star, Bookmark } from "lucide-react"

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

  const locations: Location[] = [
    {
      id: "1",
      name: "Tokyo Tower",
      country: "Japan",
      lat: 35.6586,
      lng: 139.7454,
      rating: 4.5,
      description: "Iconic landmark offering panoramic views of Tokyo",
      imageUrl: "/map-locations/tokyo-tower.jpg",
    },
    {
      id: "2",
      name: "Senso-ji Temple",
      country: "Japan",
      lat: 35.7148,
      lng: 139.7967,
      rating: 4.7,
      description: "Ancient Buddhist temple in Asakusa",
      imageUrl: "/map-locations/sensoji-temple.jpg",
    },
    {
      id: "3",
      name: "Shibuya Crossing",
      country: "Japan",
      lat: 35.6595,
      lng: 139.7004,
      rating: 4.6,
      description: "World's busiest pedestrian crossing",
      imageUrl: "/map-locations/shibuya-crossing.jpg",
    },
    {
      id: "4",
      name: "Meiji Shrine",
      country: "Japan",
      lat: 35.6764,
      lng: 139.6993,
      rating: 4.8,
      description: "Serene Shinto shrine in a forested area",
      imageUrl: "/map-locations/meiji-shrine.jpg",
    },
  ]

  const filteredLocations = locations.filter(
    (loc) =>
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.country.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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

          {/* Map Placeholder */}
          <div className="relative h-[500px] bg-muted rounded-lg overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-primary mx-auto mb-2" />
                <p className="text-muted-foreground">Interactive map view</p>
                <p className="text-sm text-muted-foreground">Click on markers to explore destinations</p>
              </div>
            </div>

            {/* Location Markers */}
            {filteredLocations.map((location, index) => (
              <button
                key={location.id}
                onClick={() => setSelectedLocation(location)}
                className="absolute w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground hover:scale-110 transition-transform shadow-lg"
                style={{
                  left: `${20 + index * 15}%`,
                  top: `${30 + index * 10}%`,
                }}
              >
                <MapPin className="w-5 h-5" />
              </button>
            ))}
          </div>

          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm">
              <Navigation className="w-4 h-4 mr-2" />
              My Location
            </Button>
            <Button variant="outline" size="sm">
              Reset View
            </Button>
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
