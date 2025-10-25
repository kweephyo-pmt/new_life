import { AppHeader } from "@/components/app-header"
import { AiRecommendations } from "@/components/ai-recommendations"

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <AiRecommendations />
      </main>
    </div>
  )
}
