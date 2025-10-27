'use client'

import { Compass, User, MapPin, Calendar, Settings, LogOut, Mail, Edit2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { updateProfile } from "firebase/auth"
import { MainNav } from "@/components/main-nav"
import { getTrips, type Trip } from "@/lib/trips-storage"
import { getTripsWithCurrentStatus } from "@/lib/trip-utils"

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [trips, setTrips] = useState<Trip[]>([])
  const [tripsLoading, setTripsLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/login')
    } else {
      setDisplayName(user.displayName || '')
      loadTrips()
    }
  }, [user, router])

  const loadTrips = async () => {
    if (!user) return
    setTripsLoading(true)
    try {
      const userTrips = await getTrips(user.uid)
      // Update trip statuses based on current date
      const tripsWithStatus = getTripsWithCurrentStatus(userTrips)
      // Sort by creation date, most recent first
      const sortedTrips = tripsWithStatus.sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt : new Date()
        const dateB = b.createdAt instanceof Date ? b.createdAt : new Date()
        return dateB.getTime() - dateA.getTime()
      })
      setTrips(sortedTrips.slice(0, 5)) // Show only 5 most recent
    } catch (error) {
      console.error('Error loading trips:', error)
    } finally {
      setTripsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logged out successfully')
      router.push('/')
    } catch (error: any) {
      toast.error(error.message || 'Failed to log out')
    }
  }

  const handleUpdateProfile = async () => {
    if (!user) return
    setLoading(true)
    try {
      await updateProfile(user, {
        displayName: displayName,
      })
      toast.success('Profile updated successfully!')
      setIsEditing(false)
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const initials = user.displayName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || user.email?.[0].toUpperCase() || 'U'

  const memberSince = user.metadata.creationTime
    ? new Date(user.metadata.creationTime).getFullYear()
    : new Date().getFullYear()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Compass className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">New Life</span>
          </Link>
          <MainNav />
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
                  <AvatarImage src={user.photoURL || undefined} />
                  <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl font-bold text-foreground mb-2">{user.displayName || 'User'}</h1>
                  <div className="flex items-center gap-2 justify-center md:justify-start text-muted-foreground mb-4">
                    <Mail className="w-4 h-4" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Member since {memberSince}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{user.emailVerified ? 'Verified' : 'Not verified'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
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
                    {tripsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                      </div>
                    ) : trips.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No trips yet. Start planning your first adventure!</p>
                        <Link href="/trips">
                          <Button className="mt-4" size="sm">Create Trip</Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {trips.map((trip) => (
                          <Link key={trip.id} href={`/trips/${trip.id}`}>
                            <TripItem
                              title={trip.name}
                              destination={trip.destination}
                              date={`${new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`}
                              status={trip.status}
                              image={trip.imageUrl}
                            />
                          </Link>
                        ))}
                      </div>
                    )}
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
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user.email || ''}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter your name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Provider</Label>
                    <Input
                      value={user.providerData[0]?.providerId === 'google.com' ? 'Google' : 'Email/Password'}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Status</Label>
                    <Input
                      value={user.emailVerified ? 'Verified' : 'Not Verified'}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  {isEditing && (
                    <div className="flex gap-2">
                      <Button onClick={handleUpdateProfile} disabled={loading}>
                        {loading ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button variant="outline" onClick={() => {
                        setIsEditing(false)
                        setDisplayName(user.displayName || '')
                      }}>
                        Cancel
                      </Button>
                    </div>
                  )}
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
  destination,
  date,
  status,
  image,
}: {
  title: string
  destination: string
  date: string
  status: string
  image: string
}) {
  const statusColors = {
    upcoming: "bg-primary/10 text-primary",
    ongoing: "bg-green-500/10 text-green-600",
    completed: "bg-muted text-muted-foreground"
  }
  
  return (
    <div className="flex items-center gap-4 p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
      {image ? (
        <img src={image} alt={title} className="w-16 h-16 rounded-lg object-cover" />
      ) : (
        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
          <MapPin className="w-8 h-8 text-primary/50" />
        </div>
      )}
      <div className="flex-1">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {destination} • {date}
        </p>
      </div>
      <span
        className={`text-xs px-2 py-1 rounded-full capitalize ${
          statusColors[status as keyof typeof statusColors] || statusColors.upcoming
        }`}
      >
        {status}
      </span>
    </div>
  )
}
