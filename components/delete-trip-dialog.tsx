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

interface DeleteTripDialogProps {
  tripId: string
  tripName: string
  redirectAfterDelete?: boolean
}

export function DeleteTripDialog({ tripId, tripName, redirectAfterDelete = false }: DeleteTripDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const handleDelete = () => {
    const success = deleteTrip(tripId)
    if (success) {
      setOpen(false)
      if (redirectAfterDelete) {
        router.push("/trips")
      } else {
        router.refresh()
      }
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="icon">
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
