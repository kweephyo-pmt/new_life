"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles, Loader2 } from "lucide-react"
import { saveItinerary } from "@/lib/itinerary-storage"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"

interface GenerateItineraryButtonProps {
  tripId: string
  destination: string
  startDate: string
  endDate: string
  travelers: number
  budget: number
  preferences?: string
  onGenerated?: () => void
}

export function GenerateItineraryButton({
  tripId,
  destination,
  startDate,
  endDate,
  travelers,
  budget,
  preferences,
  onGenerated,
}: GenerateItineraryButtonProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    if (!user) {
      toast.error('You must be logged in to generate an itinerary')
      return
    }

    setLoading(true)
    try {
      // Call AI API to generate itinerary
      const response = await fetch("/api/generate-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          destination, 
          startDate,
          endDate,
          travelers,
          budget,
          preferences 
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate itinerary')
      }

      const data = await response.json()
      console.log('Received itinerary data:', data)
      
      // Save itinerary to Firestore
      console.log('Saving itinerary to Firestore...')
      const saved = await saveItinerary(tripId, user.uid, data.itinerary)
      console.log('Save result:', saved)
      
      if (saved) {
        toast.success('Itinerary generated successfully!')
        // Trigger refresh of itinerary component
        if (onGenerated) {
          onGenerated()
        }
      } else {
        toast.error('Failed to save itinerary')
      }
    } catch (error) {
      console.error("Error generating itinerary:", error)
      toast.error('Failed to generate itinerary')
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
