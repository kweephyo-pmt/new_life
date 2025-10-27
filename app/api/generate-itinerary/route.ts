import { generateObject } from "ai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { z } from "zod"

// Initialize Google Gemini provider
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
})

const itinerarySchema = z.object({
  days: z.array(
    z.object({
      day: z.number(),
      date: z.string(),
      theme: z.string().describe("Theme or focus of the day"),
      activities: z.array(
        z.object({
          time: z.string().describe("Time in 12-hour format"),
          title: z.string(),
          location: z.string(),
          description: z.string(),
          duration: z.string(),
          type: z.enum(["attraction", "food", "transport", "accommodation"]),
          estimatedCost: z.number().optional(),
        }),
      ),
    }),
  ),
  tips: z.array(z.string()).describe("General travel tips for the destination"),
})

export async function POST(req: Request) {
  try {
    const { destination, startDate, endDate, travelers, budget, preferences } = await req.json()

    // Calculate duration
    const start = new Date(startDate)
    const end = new Date(endDate)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

    const { object } = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: itinerarySchema,
      prompt: `Create a detailed day-by-day itinerary for a ${days}-day trip to ${destination}.
      
      Trip Details:
      - Destination: ${destination}
      - Duration: ${days} days (${startDate} to ${endDate})
      - Number of travelers: ${travelers}
      - Total budget: $${budget}
      ${preferences ? `- Preferences: ${preferences}` : ''}
      
      Requirements:
      - Include a mix of attractions, dining, and rest time
      - Consider realistic travel times between locations
      - Include breakfast, lunch, and dinner suggestions
      - Balance popular tourist spots with local experiences
      - Provide practical timing (e.g., 09:00 AM, 02:30 PM)
      - Include estimated costs that fit within the budget
      - Make it engaging and well-paced
      - Consider the number of travelers when suggesting activities
      
      Create a memorable and practical itinerary that maximizes the experience while being realistic about time, energy, and budget.
      
      IMPORTANT: Keep responses concise. Limit to ${days} days only.`,
    })

    // Transform the response to match our ItineraryDay format
    const itinerary = object.days.map((day: any, index: number) => ({
      day: index + 1,
      date: new Date(new Date(startDate).getTime() + index * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }),
      activities: day.activities.map((activity: any, actIndex: number) => ({
        id: `${index + 1}-${actIndex + 1}`,
        time: activity.time,
        title: activity.title,
        location: activity.location,
        description: activity.description,
        duration: activity.duration,
        type: activity.type,
      }))
    }))

    return Response.json({ itinerary, tips: object.tips })
  } catch (error) {
    console.error("Error generating itinerary:", error)
    // Return detailed error for debugging
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return Response.json({ 
      error: "Failed to generate itinerary", 
      details: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
