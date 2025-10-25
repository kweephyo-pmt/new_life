import type React from "react"
import { Compass, Sparkles, MapPin, DollarSign, Users, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="NewLifeLOGO.png" alt="logo" className="w-15 h-15" />
            <span className="text-2xl font-bold text-foreground">New Life</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              How It Works
            </Link>
            <Button variant="outline" size="sm" asChild>
              <Link href="/profile">Sign In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/explore">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/50 text-accent-foreground mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">AI-Powered Travel Planning</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 text-balance leading-tight">
            Your Journey,
            <br />
            <span className="text-primary">Simplified</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto leading-relaxed">
            Experience personalized travel recommendations powered by AI. Plan trips, manage budgets, and share
            adventures with friends—all in one beautiful app.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8" asChild>
              <Link href="/explore">Start Exploring</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">Everything You Need</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to make travel planning effortless and enjoyable
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <FeatureCard
            icon={<Sparkles className="w-6 h-6" />}
            title="AI Recommendations"
            description="Get personalized destination and activity suggestions based on your preferences and travel style"
          />
          <FeatureCard
            icon={<MapPin className="w-6 h-6" />}
            title="Interactive Maps"
            description="Explore destinations with beautiful maps, save locations, and plan your route effortlessly"
          />
          <FeatureCard
            icon={<Calendar className="w-6 h-6" />}
            title="Smart Itineraries"
            description="Create and manage trip itineraries with optimal timing and activity scheduling"
          />
          <FeatureCard
            icon={<DollarSign className="w-6 h-6" />}
            title="Budget Tracking"
            description="Keep your travel expenses in check with real-time budget monitoring and insights"
          />
          <FeatureCard
            icon={<Users className="w-6 h-6" />}
            title="Social Sharing"
            description="Share your travel plans and experiences with friends and the community"
          />
          <FeatureCard
            icon={<Compass className="w-6 h-6" />}
            title="Photo Galleries"
            description="Discover stunning destination photos and create your own travel memories"
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto bg-primary rounded-3xl p-12 text-center">
          <h2 className="text-4xl font-bold text-primary-foreground mb-4">Ready for Your Next Adventure?</h2>
          <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join thousands of travelers who are planning smarter with New Life
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8">
            Get Started Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src="NewLifeLOGO.png" alt="logo" className="w-15 h-15" />
              <span className="font-bold text-foreground">New Life</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2025 New Life. Your AI travel companion.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}
