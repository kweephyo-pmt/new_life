import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TripsList } from "@/components/trips-list"
import { CreateTripDialog } from "@/components/create-trip-dialog"
import { AppHeader } from "@/components/app-header"

export default function TripsPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">My Trips</h1>
              <p className="text-muted-foreground">Plan and manage your travel adventures</p>
            </div>
            <CreateTripDialog>
              <Button size="lg">
                <Plus className="w-5 h-5 mr-2" />
                New Trip
              </Button>
            </CreateTripDialog>
          </div>

          <TripsList />
        </div>
      </main>
    </div>
  )
}
