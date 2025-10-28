"use client"

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { deleteTrip } from "@/lib/trips-storage"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"

interface DeleteTripDialogProps {
  tripId: string
  tripName: string
  redirectAfterDelete?: boolean
}

export function DeleteTripDialog({ tripId, tripName, redirectAfterDelete = false }: DeleteTripDialogProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!user) {
      toast.error('You must be logged in to delete a trip')
      return
    }
    
    setLoading(true)
    try {
      const success = await deleteTrip(tripId, user.uid)
      if (success) {
        toast.success('Trip deleted successfully')
        setOpen(false)
        if (redirectAfterDelete) {
          router.push("/trips")
        } else {
          // Trigger refresh of trips list
          window.dispatchEvent(new Event('refreshTrips'))
        }
      } else {
        toast.error('Failed to delete trip')
      }
    } catch (error) {
      console.error('Error deleting trip:', error)
      toast.error('Failed to delete trip')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button 
          variant="destructive" 
          size="icon"
          className="h-10 w-10 hover:bg-destructive/90 transition-all"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Trip</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{tripName}"? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
