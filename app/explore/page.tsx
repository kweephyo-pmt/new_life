import { Compass } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AiRecommendations } from "@/components/ai-recommendations"

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Compass className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">New Life</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/trips">My Trips</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/budget">Budget</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/discover">Discover</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/community">Community</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/profile">Profile</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <AiRecommendations />
      </main>
    </div>
  )
}
