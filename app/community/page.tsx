import { TravelFeed } from "@/components/travel-feed"
import { TrendingDestinations } from "@/components/trending-destinations"
import { AppHeader } from "@/components/app-header"

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Travel Community</h1>
            <p className="text-muted-foreground">Share your adventures and get inspired by fellow travelers</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TravelFeed />
            </div>
            <div>
              <TrendingDestinations />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
