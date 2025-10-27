import type { Trip } from './trips-storage'

/**
 * Calculate the current status of a trip based on its dates
 */
export function getTripStatus(trip: Trip): 'upcoming' | 'ongoing' | 'completed' {
  const now = new Date()
  now.setHours(0, 0, 0, 0) // Reset to start of day for accurate comparison
  
  const startDate = new Date(trip.startDate)
  startDate.setHours(0, 0, 0, 0)
  
  const endDate = new Date(trip.endDate)
  endDate.setHours(23, 59, 59, 999) // End of day
  
  if (now < startDate) {
    return 'upcoming'
  } else if (now >= startDate && now <= endDate) {
    return 'ongoing'
  } else {
    return 'completed'
  }
}

/**
 * Get trips with updated status based on current date
 */
export function getTripsWithCurrentStatus(trips: Trip[]): Trip[] {
  return trips.map(trip => ({
    ...trip,
    status: getTripStatus(trip)
  }))
}
