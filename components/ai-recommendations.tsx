"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Sparkles, MapPin, Clock, DollarSign, Loader2 } from "lucide-react"

export function AiRecommendations() {
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [recommendations, setRecommendations] = useState<any>(null)

  const handleGetRecommendations = async () => {
    if (!prompt.trim()) return

    setLoading(true)
    try {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })

      const data = await response.json()
      setRecommendations(data.recommendations)
    } catch (error) {
      console.error("Error getting recommendations:", error)
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
                <div className="w-full md:w-48 h-48 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                  <img
                    src={`/.jpg?height=200&width=200&query=${encodeURIComponent(dest.name + " travel destination")}`}
                    alt={dest.name}
                    className="w-full h-full object-cover"
                  />
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
                      <DollarSign className="w-4 h-4 text-primary" />
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

                  <Button variant="outline">View Details</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Example Prompts */}
      {!recommendations && (
        <div className="mt-12">
          <h3 className="text-lg font-semibold text-foreground mb-4">Try these examples:</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              "Adventure trip in South America for 3 weeks",
              "Romantic getaway in Europe under $2000",
              "Family-friendly beach vacation in Asia",
              "Cultural exploration in the Middle East",
            ].map((example, index) => (
              <button
                key={index}
                onClick={() => setPrompt(example)}
                className="text-left p-4 rounded-lg border border-border hover:border-primary hover:bg-accent/50 transition-colors"
              >
                <p className="text-sm text-foreground">{example}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
