import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  deleteField,
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
    
    // Process data to handle null values (remove fields)
    const processedData: any = { ...data }
    Object.keys(processedData).forEach(key => {
      if (processedData[key] === null) {
        processedData[key] = deleteField()
      }
    })
    
    if (docSnap.exists()) {
      // Update existing profile
      await updateDoc(docRef, {
        ...processedData,
        updatedAt: Timestamp.now()
      })
    } else {
      // Create new profile - remove null values for new documents
      const cleanData: any = {}
      Object.keys(data).forEach(key => {
        if (data[key as keyof typeof data] !== null) {
          cleanData[key] = data[key as keyof typeof data]
        }
      })
      
      await setDoc(docRef, {
        userId,
        ...cleanData,
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
