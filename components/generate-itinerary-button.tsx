"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles, Loader2 } from "lucide-react"

export function GenerateItineraryButton({
  tripId,
  destination,
  duration,
}: {
  tripId: string
  destination: string
  duration: string
}) {
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/generate-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId, destination, duration }),
      })

      const data = await response.json()
      console.log("[v0] Generated itinerary:", data)
      // In a real app, this would update the itinerary state
    } catch (error) {
      console.error("Error generating itinerary:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleGenerate} disabled={loading}>
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Sparkles className="w-4 h-4 mr-2" />
          Generate AI Itinerary
        </>
      )}
    </Button>
  )
}
