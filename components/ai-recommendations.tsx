"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Sparkles, MapPin, Clock, DollarSign, Loader2, Plus } from "lucide-react"
import { CreateTripDialog } from "@/components/create-trip-dialog"
import { useRouter } from "next/navigation"

const ALL_PROMPTS = [
  "Adventure hiking trip in Patagonia for 2 weeks under ฿100,000",
  "Romantic wine tour in Tuscany for 10 days around ฿80,000",
  "Island hopping in the Philippines for 3 weeks under ฿60,000",
  "Cultural and historical tour of Egypt for 2 weeks around ฿70,000",
  "Backpacking through Thailand for a month under ฿50,000",
  "Luxury safari experience in Tanzania for 2 weeks around ฿200,000",
  "Food and culture tour of Japan for 10 days under ฿90,000",
  "Northern lights adventure in Iceland for a week around ฿120,000",
  "Beach relaxation in Maldives for a week under ฿150,000",
  "Ancient temples and street food tour in Bangkok for ฿30,000",
  "Surfing and yoga retreat in Bali for 2 weeks around ฿70,000",
  "Wildlife photography safari in Kenya for 10 days around ฿180,000",
  "Mediterranean vacation in Santorini for a week under ฿100,000",
  "Trekking to Machu Picchu in Peru for 2 weeks around ฿90,000",
  "City exploration in Prague for 5 days under ฿50,000",
  "Diving and snorkeling in the Great Barrier Reef around ฿130,000",
  "Desert adventure in Morocco for 10 days under ฿80,000",
  "Mountain trekking in Nepal for 3 weeks around ฿100,000",
  "Beach and culture in Bali for 2 weeks under ฿80,000",
  "Food tour in Vietnam for 2 weeks under ฿60,000",
]

export function AiRecommendations() {
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [recommendations, setRecommendations] = useState<any>(null)
  const [destinationPhotos, setDestinationPhotos] = useState<Record<string, string>>({})
  const [loadingPhotos, setLoadingPhotos] = useState(false)

  // Memoize random prompts so they don't change on every render
  const randomPrompts = useMemo(() => {
    return [...ALL_PROMPTS].sort(() => Math.random() - 0.5).slice(0, 6)
  }, [])

  const handleGetRecommendations = async () => {
    if (!prompt.trim()) return

    setLoading(true)
    try {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        throw new Error('Failed to get recommendations')
      }

      const data = await response.json()
      console.log('Recommendations data:', data)
      setRecommendations(data.recommendations)

      // Fetch photos for each destination
      if (data.recommendations?.destinations) {
        setLoadingPhotos(true)
        console.log('Fetching photos for destinations:', data.recommendations.destinations.map((d: any) => d.name))
        
        const photoPromises = data.recommendations.destinations.map(async (dest: any) => {
          try {
            console.log(`Fetching photo for: ${dest.name}`)
            const params = new URLSearchParams({
              destination: dest.name,
              ...(dest.location ? { location: dest.location } : {}),
            })
            const photoResponse = await fetch(`/api/destination-photo?${params.toString()}`)
            const photoData = await photoResponse.json()
            console.log(`Photo data for ${dest.name}:`, photoData)
            
            if (photoData.error) {
              console.warn(`No photo found for ${dest.name}:`, photoData.error)
              return { name: dest.name, photo: null }
            }
            
            return { name: dest.name, photo: photoData.imageUrl || null }
          } catch (error) {
            console.error(`Error fetching photo for ${dest.name}:`, error)
            return { name: dest.name, photo: null }
          }
        })

        const photos = await Promise.all(photoPromises)
        console.log('All photos fetched:', photos)
        
        const photoMap: Record<string, string> = {}
        photos.forEach(({ name, photo }) => {
          if (photo) photoMap[name] = photo
        })
        console.log('Photo map:', photoMap)
        setDestinationPhotos(photoMap)
        setLoadingPhotos(false)
      }
    } catch (error) {
      console.error("Error getting recommendations:", error)
      alert('Failed to get recommendations. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">AI-Powered</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Discover Your Perfect Trip</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Tell us what you're looking for, and our AI will create personalized travel recommendations just for you
        </p>
      </div>

      {/* Input Section */}
      <Card className="p-6 mb-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="travel-prompt" className="text-sm font-medium text-foreground">
              What kind of trip are you planning?
            </label>
            <Input
              id="travel-prompt"
              placeholder="e.g., A relaxing beach vacation in Southeast Asia for 2 weeks under $3000"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGetRecommendations()}
              className="text-base"
            />
          </div>
          <Button onClick={handleGetRecommendations} disabled={loading || !prompt.trim()} className="w-full sm:w-auto">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Recommendations...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Get AI Recommendations
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Recommendations Display */}
      {recommendations && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Your Personalized Recommendations</h2>

          {recommendations.destinations?.map((dest: any, index: number) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-48 h-48 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center overflow-hidden">
                  {loadingPhotos && !destinationPhotos[dest.name] ? (
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  ) : destinationPhotos[dest.name] ? (
                    <img
                      src={destinationPhotos[dest.name]}
                      alt={dest.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <MapPin className="w-12 h-12 text-primary/50" />
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-foreground mb-2">{dest.name}</h3>
                  <p className="text-muted-foreground mb-4 leading-relaxed">{dest.description}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground">{dest.bestTime}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-primary font-semibold">฿</span>
                      <span className="text-muted-foreground">{dest.budget}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground">{dest.location}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {dest.highlights?.map((highlight: string, i: number) => (
                      <span key={i} className="px-3 py-1 rounded-full bg-accent text-accent-foreground text-sm">
                        {highlight}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <CreateTripDialog
                      initialData={{
                        destination: `${dest.name}, ${dest.location}`,
                        name: `Trip to ${dest.name}`,
                      }}
                    >
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Trip
                      </Button>
                    </CreateTripDialog>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Example Prompts */}
      {!recommendations && (
        <div className="mt-12">
          <h3 className="text-lg font-semibold text-foreground mb-4">Need inspiration? Try these:</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {randomPrompts.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setPrompt(example)}
                  className="text-left p-4 rounded-lg border border-border hover:border-primary hover:bg-accent/50 transition-colors group"
                >
                  <p className="text-sm text-foreground group-hover:text-primary transition-colors">{example}</p>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
