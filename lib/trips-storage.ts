export interface Trip {
  id: string
  name: string
  destination: string
  startDate: string
  endDate: string
  travelers: number
  budget: number
  status: "upcoming" | "ongoing" | "completed"
  imageUrl: string
  preferences?: string
}

const TRIPS_STORAGE_KEY = "new-life-trips"

const defaultTrips: Trip[] = [
  {
    id: "1",
    name: "Tokyo Adventure",
    destination: "Tokyo, Japan",
    startDate: "2025-06-15",
    endDate: "2025-06-25",
    travelers: 2,
    budget: 5000,
    status: "upcoming",
    imageUrl: "/trips/tokyo-skyline.jpg",
  },
  {
    id: "2",
    name: "Bali Retreat",
    destination: "Bali, Indonesia",
    startDate: "2025-08-01",
    endDate: "2025-08-14",
    travelers: 4,
    budget: 3500,
    status: "upcoming",
    imageUrl: "/trips/bali-beach.jpg",
  },
]

export function getTrips(): Trip[] {
  if (typeof window === "undefined") return defaultTrips

  const stored = localStorage.getItem(TRIPS_STORAGE_KEY)
  if (!stored) {
    localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(defaultTrips))
    return defaultTrips
  }
  return JSON.parse(stored)
}

export function getTripById(id: string): Trip | undefined {
  const trips = getTrips()
  return trips.find((trip) => trip.id === id)
}

export function createTrip(tripData: Omit<Trip, "id" | "status">): Trip {
  const trips = getTrips()

  const newTrip: Trip = {
    ...tripData,
    id: Date.now().toString(),
    status: "upcoming",
    imageUrl: tripData.imageUrl || "/trips/tokyo-skyline.jpg",
  }

  trips.push(newTrip)
  localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(trips))

  window.dispatchEvent(new Event("storage"))

  return newTrip
}

export function updateTrip(id: string, updates: Partial<Trip>): Trip | null {
  const trips = getTrips()
  const index = trips.findIndex((trip) => trip.id === id)

  if (index === -1) return null

  trips[index] = { ...trips[index], ...updates }
  localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(trips))

  return trips[index]
}

export function deleteTrip(id: string): boolean {
  const trips = getTrips()
  const filtered = trips.filter((trip) => trip.id !== id)

  if (filtered.length === trips.length) return false

  localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(filtered))

  window.dispatchEvent(new Event("storage"))

  return true
}
