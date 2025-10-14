"use client"

import { Card } from "@/components/ui/card"
import { TrendingUp, MapPin } from "lucide-react"

interface TrendingDestination {
  id: string
  name: string
  country: string
  posts: number
  imageUrl: string
}

export function TrendingDestinations() {
  const destinations: TrendingDestination[] = [
    {
      id: "1",
      name: "Tokyo",
      country: "Japan",
      posts: 12453,
      imageUrl: "Tokyo Japan cityscape",
    },
    {
      id: "2",
      name: "Bali",
      country: "Indonesia",
      posts: 9876,
      imageUrl: "Bali Indonesia beach",
    },
    {
      id: "3",
      name: "Paris",
      country: "France",
      posts: 8234,
      imageUrl: "Paris France Eiffel Tower",
    },
    {
      id: "4",
      name: "Santorini",
      country: "Greece",
      posts: 7654,
      imageUrl: "Santorini Greece sunset",
    },
    {
      id: "5",
      name: "Dubai",
      country: "UAE",
      posts: 6543,
      imageUrl: "Dubai UAE skyline",
    },
  ]

  return (
    <div className="space-y-6 sticky top-24">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Trending Destinations</h3>
        </div>

        <div className="space-y-4">
          {destinations.map((destination, index) => (
            <button
              key={destination.id}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors text-left"
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden">
                  <img
                    src={`/.jpg?height=50&width=50&query=${encodeURIComponent(destination.imageUrl)}`}
                    alt={destination.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
              </div>

              <div className="flex-1">
                <p className="font-semibold text-foreground">{destination.name}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span>{destination.country}</span>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">{destination.posts.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">posts</p>
              </div>
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Suggested Travelers</h3>
        <div className="space-y-4">
          {[
            { name: "Alex Rivera", username: "@alexexplores", followers: "12.5K" },
            { name: "Lisa Park", username: "@lisawanders", followers: "8.3K" },
            { name: "James Wilson", username: "@jamestravel", followers: "6.7K" },
          ].map((user) => (
            <div key={user.username} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">{user.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.username}</p>
                </div>
              </div>
              <button className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                Follow
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
