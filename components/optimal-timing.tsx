"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sun, DollarSign, Users, Calendar, TrendingDown, CloudRain, TrendingUp, Loader2 } from "lucide-react"
import { getTravelData } from "@/lib/travel-data"

interface OptimalTimingProps {
  destination: string
  startDate: string
  endDate: string
}

export function OptimalTiming({ destination, startDate, endDate }: OptimalTimingProps) {
  const [timing, setTiming] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadTravelData() {
      setLoading(true)
      try {
        const data = await getTravelData(destination, startDate, endDate)
        setTiming(data)
      } catch (error) {
        console.error('Error loading travel data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadTravelData()
  }, [destination, startDate, endDate])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Optimal Timing Analysis</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  if (!timing) {
    return null
  }

  const betterDates = [
    {
      month: "Alternative dates",
      reason: "Weather and pricing optimization coming soon",
      savings: 0,
      weatherScore: 85,
    },
  ]

  return (
    <div className="space-y-6 pb-12">
      {/* Current Timing Analysis */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Sun className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Weather</div>
              <div className="text-lg font-bold text-foreground">{timing.weather.score}/100</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-2">{timing.weather.description}</p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>{timing.weather.temp}</span>
            <span>•</span>
            <span>{timing.weather.rainfall} rain</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Pricing</div>
              <div className="text-lg font-bold text-foreground">{timing.pricing.score}/100</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-2">{timing.pricing.description}</p>
          <div className="flex gap-2 text-xs">
            <span className="flex items-center gap-1 text-muted-foreground">
              Flights {timing.pricing.flightTrend === "stable" ? "→" : "↑"}
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              Hotels {timing.pricing.hotelTrend === "increasing" ? "↑" : "→"}
            </span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
              <Users className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Crowds</div>
              <div className="text-lg font-bold text-foreground">{timing.crowds.score}/100</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-2">{timing.crowds.description}</p>
          <div className="text-xs text-muted-foreground">{timing.crowds.level} tourist activity</div>
        </Card>
      </div>

      {/* Alternative Dates */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Better Travel Dates</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">AI-recommended alternative dates for optimal experience</p>

        <div className="space-y-3">
          {betterDates.map((date, index) => (
            <div key={index} className="p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-foreground">{date.month} 2025</h4>
                  <p className="text-sm text-muted-foreground mt-1">{date.reason}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm font-medium text-foreground mb-1">
                    <Sun className="w-4 h-4 text-primary" />
                    {date.weatherScore}/100
                  </div>
                  {date.savings > 0 && (
                    <div className="flex items-center gap-1 text-sm font-medium text-secondary">
                      <TrendingDown className="w-4 h-4" />
                      Save ฿{date.savings}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
