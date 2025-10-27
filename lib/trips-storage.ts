import { db } from './firebase'
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore'

export interface Trip {
  id: string
  userId: string
  name: string
  destination: string
  startDate: string
  endDate: string
  travelers: number
  budget: number
  status: "upcoming" | "ongoing" | "completed"
  imageUrl: string
  preferences?: string
  createdAt?: any
  updatedAt?: any
}

const TRIPS_COLLECTION = 'trips'

export async function getTrips(userId: string): Promise<Trip[]> {
  try {
    const tripsRef = collection(db, TRIPS_COLLECTION)
    const q = query(
      tripsRef,
      where('userId', '==', userId)
    )
    const querySnapshot = await getDocs(q)
    
    const trips: Trip[] = []
    querySnapshot.forEach((doc) => {
      trips.push({ id: doc.id, ...doc.data() } as Trip)
    })
    
    // Sort by createdAt on the client side
    trips.sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0
      const bTime = b.createdAt?.seconds || 0
      return bTime - aTime
    })
    
    return trips
  } catch (error) {
    console.error('Error fetching trips:', error)
    return []
  }
}

export async function getTripById(id: string, userId: string): Promise<Trip | null> {
  try {
    const tripRef = doc(db, TRIPS_COLLECTION, id)
    const tripSnap = await getDoc(tripRef)
    
    if (tripSnap.exists()) {
      const tripData = { id: tripSnap.id, ...tripSnap.data() } as Trip
      // Verify the trip belongs to the user
      if (tripData.userId === userId) {
        return tripData
      }
    }
    return null
  } catch (error) {
    console.error('Error fetching trip:', error)
    return null
  }
}

export async function createTrip(
  userId: string,
  tripData: Omit<Trip, 'id' | 'userId' | 'status' | 'createdAt' | 'updatedAt'>
): Promise<Trip> {
  try {
    const newTripData = {
      ...tripData,
      userId,
      status: 'upcoming' as const,
      imageUrl: tripData.imageUrl || '/trips/tokyo-skyline.jpg',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    const docRef = await addDoc(collection(db, TRIPS_COLLECTION), newTripData)
    
    return {
      id: docRef.id,
      ...newTripData,
    } as Trip
  } catch (error) {
    console.error('Error creating trip:', error)
    throw new Error('Failed to create trip')
  }
}

export async function updateTrip(
  id: string,
  userId: string,
  updates: Partial<Omit<Trip, 'id' | 'userId' | 'createdAt'>>
): Promise<boolean> {
  try {
    const tripRef = doc(db, TRIPS_COLLECTION, id)
    const tripSnap = await getDoc(tripRef)
    
    if (!tripSnap.exists()) return false
    
    const tripData = tripSnap.data() as Trip
    if (tripData.userId !== userId) return false
    
    await updateDoc(tripRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    })
    
    return true
  } catch (error) {
    console.error('Error updating trip:', error)
    return false
  }
}

export async function deleteTrip(id: string, userId: string): Promise<boolean> {
  try {
    const tripRef = doc(db, TRIPS_COLLECTION, id)
    const tripSnap = await getDoc(tripRef)
    
    if (!tripSnap.exists()) return false
    
    const tripData = tripSnap.data() as Trip
    if (tripData.userId !== userId) return false
    
    // Delete the trip
    await deleteDoc(tripRef)
    
    // Also delete the associated itinerary if it exists
    try {
      const itineraryRef = doc(db, 'itineraries', id)
      const itinerarySnap = await getDoc(itineraryRef)
      if (itinerarySnap.exists()) {
        await deleteDoc(itineraryRef)
      }
    } catch (itineraryError) {
      // Log but don't fail the trip deletion if itinerary deletion fails
      console.warn('Error deleting itinerary:', itineraryError)
    }
    
    return true
  } catch (error) {
    console.error('Error deleting trip:', error)
    return false
  }
}
