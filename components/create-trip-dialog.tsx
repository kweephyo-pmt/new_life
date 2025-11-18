"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { createTrip, updateTrip } from "@/lib/trips-storage"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"

interface CreateTripDialogProps {
  children: React.ReactNode
  initialData?: {
    name?: string
    destination?: string
  }
}

export function CreateTripDialog({ children, initialData }: CreateTripDialogProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    destination: initialData?.destination || "",
    startDate: "",
    endDate: "",
    travelers: "1",
    budget: "",
    preferences: "",
  })

  // Update form when dialog opens with initialData
  useEffect(() => {
    if (open && initialData) {
      setFormData(prev => ({
        ...prev,
        name: initialData.name || prev.name,
        destination: initialData.destination || prev.destination,
      }))
    }
  }, [open, initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error('You must be logged in to create a trip')
      return
    }
    
    setLoading(true)

    try {
      // Calculate initial status based on dates
      const { getTripStatus } = await import('@/lib/trip-utils')
      const tempTrip = {
        name: formData.name,
        destination: formData.destination,
        startDate: formData.startDate,
        endDate: formData.endDate,
        travelers: Number.parseInt(formData.travelers),
        budget: Number.parseFloat(formData.budget),
        preferences: formData.preferences,
        imageUrl: "",
        status: 'upcoming' as const,
        userId: user.uid,
        id: '',
      }
      const initialStatus = getTripStatus(tempTrip as any)
      
      const newTrip = await createTrip(user.uid, {
        name: formData.name,
        destination: formData.destination,
        startDate: formData.startDate,
        endDate: formData.endDate,
        travelers: Number.parseInt(formData.travelers),
        budget: Number.parseFloat(formData.budget),
        preferences: formData.preferences,
        imageUrl: "",
      })
      
      // Update with calculated status if different
      if (initialStatus !== 'upcoming') {
        await updateTrip(newTrip.id, user.uid, { status: initialStatus })
      }

      // Fetch and save Google Places photo
      if (newTrip.id) {
        console.log('Fetching photo for new trip:', newTrip.id, formData.destination)
        try {
          const [primaryDestination, ...locationParts] = formData.destination.split(',')
          const locationParam = locationParts.join(',').trim()
          const params = new URLSearchParams({
            destination: primaryDestination.trim() || formData.destination,
          })
          if (locationParam) {
            params.set('location', locationParam)
          }

          const photoResponse = await fetch(`/api/destination-photo?${params.toString()}`)
          const photoData = await photoResponse.json()
          console.log('Photo response:', photoData)
          
          if (photoData.imageUrl) {
            console.log('Saving photo to trip:', newTrip.id, photoData.imageUrl)
            // Save the photo to Firestore directly (client-side with auth)
            const { updateTrip } = await import('@/lib/trips-storage')
            const success = await updateTrip(newTrip.id, user.uid, { imageUrl: photoData.imageUrl })
            console.log('Photo save result:', success)
          } else {
            console.warn('No photo URL in response:', photoData)
          }
        } catch (error) {
          console.error('Error fetching destination photo:', error)
        }
      }

      toast.success('Trip created successfully!')
      setOpen(false)
      setFormData({
        name: "",
        destination: "",
        startDate: "",
        endDate: "",
        travelers: "1",
        budget: "",
        preferences: "",
      })

      // Trigger refresh of trips list
      window.dispatchEvent(new Event('refreshTrips'))
    } catch (error) {
      console.error("Error creating trip:", error)
      toast.error('Failed to create trip')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[85vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="pb-3 sm:pb-4">
          <DialogTitle className="text-base sm:text-2xl">Create New Trip</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-6 mt-2 sm:mt-4">
          <div className="space-y-2">
            <Label htmlFor="trip-name">Trip Name</Label>
            <Input
              id="trip-name"
              placeholder="e.g., Summer in Europe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="destination">Destination</Label>
            <Input
              id="destination"
              placeholder="e.g., Paris, France"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="travelers">Number of Travelers</Label>
              <Input
                id="travelers"
                type="number"
                min="1"
                value={formData.travelers}
                onChange={(e) => setFormData({ ...formData, travelers: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget">Budget (THB)</Label>
              <Input
                id="budget"
                type="number"
                placeholder="e.g., 50000"
                step="0.01"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferences">Travel Preferences (Optional)</Label>
            <Textarea
              id="preferences"
              placeholder="Tell us about your interests, budget, travel style, must-see places..."
              value={formData.preferences}
              onChange={(e) => setFormData({ ...formData, preferences: e.target.value })}
              rows={4}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Trip...
                </>
              ) : (
                "Create Trip"
              )}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
