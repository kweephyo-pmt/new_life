import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  Timestamp 
} from 'firebase/firestore'
import { db } from './firebase'

export interface UserProfile {
  userId: string
  email: string
  displayName: string
  username: string
  bio?: string
  location?: string
  website?: string
  photoURL?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

// Get user profile
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const docRef = doc(db, 'userProfiles', userId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile
    }
    return null
  } catch (error) {
    console.error('Error getting user profile:', error)
    return null
  }
}

// Create or update user profile
export async function saveUserProfile(
  userId: string,
  data: Partial<UserProfile>
): Promise<boolean> {
  try {
    const docRef = doc(db, 'userProfiles', userId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      // Update existing profile
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now()
      })
    } else {
      // Create new profile
      await setDoc(docRef, {
        userId,
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      })
    }
    
    return true
  } catch (error) {
    console.error('Error saving user profile:', error)
    return false
  }
}
