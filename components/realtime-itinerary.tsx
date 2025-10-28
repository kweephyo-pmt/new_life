"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, MapPin, Plus, ChevronDown, ChevronUp, Zap, AlertCircle, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { getItinerary, type ItineraryDay as StoredItineraryDay } from "@/lib/itinerary-storage"
import { useAuth } from "@/contexts/AuthContext"

interface ItineraryDay {
  day: number
  date: string
  activities: Activity[]
}

interface Activity {
  id: string
  time: string
  title: string
  location: string
  description: string
  duration: string
  type: "attraction" | "food" | "transport" | "accommodation"
  status?: "on-time" | "delayed" | "updated"
  liveUpdate?: string
}

export function RealtimeItinerary({ tripId }: { tripId: string }) {
  const { user } = useAuth()
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([])
  const [loading, setLoading] = useState(true)

  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([1]))
  const [showLiveUpdates, setShowLiveUpdates] = useState(true)

  // Load itinerary from Firestore
  const loadItinerary = async () => {
    if (!user) return
    setLoading(true)
    try {
      const days = await getItinerary(tripId, user.uid)
      setItinerary(days)
    } catch (error) {
      console.error('Error loading itinerary:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadItinerary()
  }, [tripId, user])

  // Listen for itinerary generation events
  useEffect(() => {
    const handleRefresh = () => loadItinerary()
    window.addEventListener('refreshItinerary', handleRefresh)
    return () => window.removeEventListener('refreshItinerary', handleRefresh)
  }, [tripId, user])

  const toggleDay = (day: number) => {
    const newExpanded = new Set(expandedDays)
    if (newExpanded.has(day)) {
      newExpanded.delete(day)
    } else {
      newExpanded.add(day)
    }
    setExpandedDays(newExpanded)
  }

  const getActivityIcon = (type: Activity["type"]) => {
    const iconClass = "w-4 h-4"
    switch (type) {
      case "attraction":
        return <MapPin className={iconClass} />
      case "food":
        return <span className={iconClass}>🍽️</span>
      case "transport":
        return <span className={iconClass}>✈️</span>
      case "accommodation":
        return <span className={iconClass}>🏨</span>
    }
  }

  const getStatusBadge = (status?: Activity["status"]) => {
    if (!status) return null

    const variants = {
      "on-time": { label: "On Time", className: "bg-secondary/20 text-secondary" },
      delayed: { label: "Delayed", className: "bg-destructive/20 text-destructive" },
      updated: { label: "Updated", className: "bg-primary/20 text-primary" },
    }

    const variant = variants[status]
    return (
      <Badge variant="outline" className={variant.className}>
        {variant.label}
      </Badge>
    )
  }

  if (itinerary.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No itinerary yet</h3>
          <p className="text-muted-foreground mb-6">
            Generate an AI-powered itinerary
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-foreground">Real-Time Itinerary</h2>
          {showLiveUpdates && (
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              <Zap className="w-3 h-3 mr-1" />
              Live Updates
            </Badge>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : itinerary.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No itinerary yet</h3>
            <p className="text-muted-foreground mb-6">
              Generate an AI-powered itinerary for your trip using the button above
            </p>
          </div>
        </Card>
      ) : (
        <>
          {/* Live Updates Banner */}
          {showLiveUpdates && (
            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-1">Real-time adjustments active</h4>
                  <p className="text-sm text-muted-foreground">
                    Your itinerary is being monitored for weather, traffic, and venue updates
                  </p>
                </div>
              </div>
            </Card>
          )}

          {itinerary.map((day) => (
        <Card key={day.day} className="overflow-hidden">
          <button
            onClick={() => toggleDay(day.day)}
            className="w-full p-6 flex items-center justify-between hover:bg-primary/5 transition-all duration-200 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg font-bold text-primary">{day.day}</span>
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold text-foreground">Day {day.day}</h3>
                <p className="text-sm text-muted-foreground">{day.date}</p>
              </div>
            </div>
            {expandedDays.has(day.day) ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            )}
          </button>

          {expandedDays.has(day.day) && (
            <div className="px-6 pb-6 space-y-4">
              {day.activities.map((activity, index) => (
                <div key={activity.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
                      {getActivityIcon(activity.type)}
                    </div>
                    {index < day.activities.length - 1 && <div className="w-0.5 flex-1 bg-border mt-2" />}
                  </div>

                  <div className="flex-1 pb-6">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium text-muted-foreground">{activity.time}</span>
                          <span className="text-sm text-muted-foreground">• {activity.duration}</span>
                          {getStatusBadge(activity.status)}
                        </div>
                        <h4 className="text-lg font-semibold text-foreground">{activity.title}</h4>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <MapPin className="w-3 h-3" />
                          <span>{activity.location}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{activity.description}</p>

                    {/* Live Update Alert */}
                    {activity.liveUpdate && (
                      <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                        <div className="flex items-start gap-2">
                          <Zap className="w-4 h-4 text-primary mt-0.5" />
                          <p className="text-sm text-foreground">{activity.liveUpdate}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      ))}
        </>
      )}
    </div>
  )
}
