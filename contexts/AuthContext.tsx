'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { saveUserProfile } from '@/lib/user-profile-storage'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, displayName?: string, username?: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const signUp = async (email: string, password: string, displayName?: string, username?: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName })
      }
      
      // Create initial user profile in Firestore
      if (userCredential.user) {
        const profileData: any = {
          email: userCredential.user.email || email,
          displayName: displayName || email.split('@')[0],
          username: username || email.split('@')[0].toLowerCase(),
        }
        
        if (userCredential.user.photoURL) {
          profileData.photoURL = userCredential.user.photoURL
        }
        
        console.log('Creating user profile:', profileData)
        const success = await saveUserProfile(userCredential.user.uid, profileData)
        console.log('Profile creation success:', success)
        
        if (!success) {
          console.error('Failed to create user profile')
        }
      }
    } catch (error) {
      console.error('Error in signUp:', error)
      throw error
    }
  }

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    const userCredential = await signInWithPopup(auth, provider)
    
    // Create user profile if it's a new user (first time Google sign-in)
    if (userCredential.user) {
      const emailUsername = userCredential.user.email?.split('@')[0].toLowerCase() || 'user'
      const profileData: any = {
        email: userCredential.user.email || '',
        displayName: userCredential.user.displayName || userCredential.user.email?.split('@')[0] || 'User',
        username: emailUsername,
      }
      
      if (userCredential.user.photoURL) {
        profileData.photoURL = userCredential.user.photoURL
      }
      
      await saveUserProfile(userCredential.user.uid, profileData)
    }
  }

  const logout = async () => {
    await signOut(auth)
  }

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email)
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
