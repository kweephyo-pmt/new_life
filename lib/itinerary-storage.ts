import { db } from './firebase'
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore'

export interface Activity {
  id: string
  time: string
  title: string
  location: string
  description: string
  duration: string
  type: 'attraction' | 'food' | 'transport' | 'accommodation'
  status?: 'on-time' | 'delayed' | 'updated'
  liveUpdate?: string
}

export interface ItineraryDay {
  day: number
  date: string
  activities: Activity[]
}

export interface Itinerary {
  tripId: string
  userId: string
  days: ItineraryDay[]
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

const ITINERARIES_COLLECTION = 'itineraries'

/**
 * Get itinerary for a specific trip
 */
export async function getItinerary(tripId: string, userId: string): Promise<ItineraryDay[]> {
  try {
    console.log('getItinerary called with tripId:', tripId, 'userId:', userId)
    const itineraryRef = doc(db, ITINERARIES_COLLECTION, tripId)
    const itinerarySnap = await getDoc(itineraryRef)
    
    console.log('Itinerary exists:', itinerarySnap.exists())
    
    if (itinerarySnap.exists()) {
      const data = itinerarySnap.data() as Itinerary
      console.log('Itinerary data userId:', data.userId, 'Days count:', data.days?.length || 0)
      // If userId is empty (public access), return the itinerary
      // Otherwise, verify ownership
      if (!userId || data.userId === userId) {
        console.log('Returning itinerary days:', data.days?.length || 0)
        return data.days || []
      } else {
        console.log('User ID mismatch - not returning itinerary')
      }
    }
    // Return empty array if document doesn't exist (not an error)
    console.log('Returning empty array')
    return []
  } catch (error) {
    console.error('Error fetching itinerary:', error)
    // Return empty array - this is normal for new trips without itineraries
    return []
  }
}

/**
 * Save or update itinerary for a trip
 */
export async function saveItinerary(
  tripId: string,
  userId: string,
  days: ItineraryDay[]
): Promise<boolean> {
  try {
    console.log('Saving itinerary:', { tripId, userId, daysCount: days.length })
    const itineraryRef = doc(db, ITINERARIES_COLLECTION, tripId)
    const itinerarySnap = await getDoc(itineraryRef)
    
    if (itinerarySnap.exists()) {
      console.log('Itinerary exists, updating...')
      // Update existing itinerary - verify ownership first
      const existingData = itinerarySnap.data() as Itinerary
      console.log('Existing userId:', existingData.userId, 'Current userId:', userId)
      
      if (existingData.userId !== userId) {
        throw new Error('Unauthorized: Cannot update itinerary for another user')
      }
      
      console.log('Attempting updateDoc...')
      await updateDoc(itineraryRef, {
        days,
        userId, // Include userId in update to satisfy security rules
        updatedAt: serverTimestamp(),
      })
      console.log('Update successful!')
    } else {
      console.log('Itinerary does not exist, creating new...')
      // Create new itinerary
      await setDoc(itineraryRef, {
        tripId,
        userId,
        days,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      console.log('Create successful!')
    }
    
    return true
  } catch (error: any) {
    console.error('Error saving itinerary:', error)
    console.error('Error code:', error.code)
    console.error('Error message:', error.message)
    return false
  }
}

/**
 * Add activity to a specific day
 */
export async function addActivity(
  tripId: string,
  userId: string,
  dayNumber: number,
  activity: Activity
): Promise<boolean> {
  try {
    const days = await getItinerary(tripId, userId)
    const dayIndex = days.findIndex(d => d.day === dayNumber)
    
    if (dayIndex !== -1) {
      days[dayIndex].activities.push(activity)
      return await saveItinerary(tripId, userId, days)
    }
    
    return false
  } catch (error) {
    console.error('Error adding activity:', error)
    return false
  }
}
