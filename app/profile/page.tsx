import { Compass, User, MapPin, Calendar, Settings, LogOut } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ProfilePage() {
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
              <Link href="/explore">Explore</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/trips">My Trips</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/discover">Discover</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/community">Community</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Profile Header */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src="/profile/user-avatar.jpg" />
                  <AvatarFallback className="text-2xl">JD</AvatarFallback>
                </Avatar>
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl font-bold text-foreground mb-2">John Doe</h1>
                  <p className="text-muted-foreground mb-4">
                    Travel enthusiast exploring the world one destination at a time
                  </p>
                  <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>12 Countries Visited</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>5 Upcoming Trips</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>Member since 2024</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                  <Button variant="outline" size="sm">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Tabs */}
          <Tabs defaultValue="trips" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="trips">My Trips</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="trips" className="mt-6">
              <div className="grid gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Trips</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <TripItem
                        title="Tokyo Adventure"
                        date="March 2025"
                        status="Upcoming"
                        image="/trips/tokyo-skyline.jpg"
                      />
                      <TripItem
                        title="Bali Retreat"
                        date="January 2025"
                        status="Completed"
                        image="/trips/bali-beach.jpg"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="stats" className="mt-6">
              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">17</div>
                    <p className="text-xs text-muted-foreground mt-1">+3 this year</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Countries Visited</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">12</div>
                    <p className="text-xs text-muted-foreground mt-1">Across 4 continents</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">$24,500</div>
                    <p className="text-xs text-muted-foreground mt-1">Lifetime spending</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Email</label>
                    <input
                      type="email"
                      className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background"
                      defaultValue="john.doe@example.com"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Display Name</label>
                    <input
                      type="text"
                      className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background"
                      defaultValue="John Doe"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Bio</label>
                    <textarea
                      className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background"
                      rows={3}
                      defaultValue="Travel enthusiast exploring the world one destination at a time"
                    />
                  </div>
                  <Button>Save Changes</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

function TripItem({
  title,
  date,
  status,
  image,
}: {
  title: string
  date: string
  status: string
  image: string
}) {
  return (
    <div className="flex items-center gap-4 p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors">
      <img src={image || "/placeholder.svg"} alt={title} className="w-16 h-16 rounded-lg object-cover" />
      <div className="flex-1">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{date}</p>
      </div>
      <span
        className={`text-xs px-2 py-1 rounded-full ${
          status === "Upcoming" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
        }`}
      >
        {status}
      </span>
    </div>
  )
}
