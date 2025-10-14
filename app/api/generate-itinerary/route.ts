import { generateObject } from "ai"
import { z } from "zod"

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
    const { tripId, destination, duration } = await req.json()

    const { object } = await generateObject({
      model: "openai/gpt-5",
      schema: itinerarySchema,
      prompt: `Create a detailed day-by-day itinerary for a trip to ${destination} lasting ${duration}.
      
      Requirements:
      - Include a mix of attractions, dining, and rest time
      - Consider realistic travel times between locations
      - Include breakfast, lunch, and dinner suggestions
      - Balance popular tourist spots with local experiences
      - Provide practical timing (e.g., 09:00 AM, 02:30 PM)
      - Include estimated costs where relevant
      - Make it engaging and well-paced
      
      Create a memorable and practical itinerary that maximizes the experience while being realistic about time and energy.`,
      maxOutputTokens: 4000,
    })

    return Response.json({ itinerary: object })
  } catch (error) {
    console.error("Error generating itinerary:", error)
    return Response.json({ error: "Failed to generate itinerary" }, { status: 500 })
  }
}
