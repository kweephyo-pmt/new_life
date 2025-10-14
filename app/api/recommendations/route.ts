import { generateObject } from "ai"
import { z } from "zod"

const recommendationSchema = z.object({
  destinations: z
    .array(
      z.object({
        name: z.string().describe("Name of the destination"),
        location: z.string().describe("Country or region"),
        description: z.string().describe("Detailed description of why this destination is recommended"),
        bestTime: z.string().describe("Best time to visit"),
        budget: z.string().describe("Estimated budget range"),
        highlights: z.array(z.string()).describe("Top highlights and activities"),
        travelTips: z.array(z.string()).describe("Practical travel tips"),
      }),
    )
    .min(3)
    .max(5),
  summary: z.string().describe("Overall summary of the recommendations"),
})

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()

    const { object } = await generateObject({
      model: "openai/gpt-5",
      schema: recommendationSchema,
      prompt: `You are an expert travel advisor. Based on the following travel request, provide 3-5 personalized destination recommendations with detailed information: "${prompt}"
      
      Consider factors like:
      - Budget constraints mentioned
      - Duration of trip
      - Travel style (adventure, relaxation, culture, etc.)
      - Season and weather
      - Activities and experiences
      - Practical considerations
      
      Make recommendations diverse and well-suited to the request.`,
      maxOutputTokens: 3000,
    })

    return Response.json({ recommendations: object })
  } catch (error) {
    console.error("Error generating recommendations:", error)
    return Response.json({ error: "Failed to generate recommendations" }, { status: 500 })
  }
}
