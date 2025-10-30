import { generateObject } from "ai"
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { z } from "zod"

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
})

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

    if (!prompt) {
      return Response.json({ error: "Prompt is required" }, { status: 400 })
    }

    console.log('Generating recommendations for:', prompt)

    const { object } = await generateObject({
      model: google("gemini-2.0-flash-exp"),
      schema: recommendationSchema,
      prompt: `You are an expert travel advisor. Based on the following travel request, provide 3-5 personalized destination recommendations with detailed information: "${prompt}"
      
      IMPORTANT: All budget amounts MUST be in Thai Baht (THB/฿). Convert any mentioned currencies to THB.
      - Use format: "฿50,000-฿80,000" or "฿2,000 per day"
      - 1 USD ≈ ฿35, 1 EUR ≈ ฿38, 1 GBP ≈ ฿44
      
      Consider factors like:
      - Budget constraints mentioned (convert to THB)
      - Duration of trip
      - Travel style (adventure, relaxation, culture, etc.)
      - Season and weather
      - Activities and experiences
      - Practical considerations
      
      Make recommendations diverse and well-suited to the request.`,
    })

    console.log('Generated recommendations:', object)

    return Response.json({ recommendations: object })
  } catch (error: any) {
    console.error("Error generating recommendations:", error)
    return Response.json({ 
      error: "Failed to generate recommendations", 
      details: error.message 
    }, { status: 500 })
  }
}
