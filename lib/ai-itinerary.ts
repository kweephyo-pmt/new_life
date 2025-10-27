import { ItineraryDay, Activity } from './itinerary-storage'

interface TripDetails {
  destination: string
  startDate: string
  endDate: string
  travelers: number
  budget: number
  preferences?: string
}

/**
 * Generate itinerary using AI
 */
export async function generateItinerary(tripDetails: TripDetails): Promise<ItineraryDay[]> {
  try {
    const response = await fetch('/api/generate-itinerary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tripDetails),
    })

    if (!response.ok) {
      throw new Error('Failed to generate itinerary')
    }

    const data = await response.json()
    return data.itinerary
  } catch (error) {
    console.error('Error generating itinerary:', error)
    throw error
  }
}

/**
 * Calculate number of days between two dates
 */
export function calculateDays(startDate: string, endDate: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays + 1 // Include both start and end days
}

/**
 * Format date for itinerary display
 */
export function formatItineraryDate(dateString: string, dayOffset: number): string {
  const date = new Date(dateString)
  date.setDate(date.getDate() + dayOffset)
  return date.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  })
}
