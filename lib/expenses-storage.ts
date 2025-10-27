import { db } from './firebase'
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'

const EXPENSES_COLLECTION = 'expenses'

export interface Expense {
  id: string
  tripId: string
  userId: string
  category: 'accommodation' | 'food' | 'transportation' | 'activities' | 'other'
  amount: number
  description: string
  date: string
  createdAt?: Timestamp | Date
}

export async function getExpenses(tripId: string, userId: string): Promise<Expense[]> {
  try {
    const q = query(
      collection(db, EXPENSES_COLLECTION),
      where('tripId', '==', tripId),
      where('userId', '==', userId)
    )
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Expense[]
  } catch (error) {
    console.error('Error fetching expenses:', error)
    return []
  }
}

export async function addExpense(
  tripId: string,
  userId: string,
  expenseData: Omit<Expense, 'id' | 'tripId' | 'userId' | 'createdAt'>
): Promise<Expense> {
  try {
    const newExpense = {
      ...expenseData,
      tripId,
      userId,
      createdAt: serverTimestamp(),
    }

    const docRef = await addDoc(collection(db, EXPENSES_COLLECTION), newExpense)
    
    return {
      id: docRef.id,
      ...newExpense,
    } as Expense
  } catch (error) {
    console.error('Error adding expense:', error)
    throw new Error('Failed to add expense')
  }
}

export async function updateExpense(
  id: string,
  userId: string,
  updates: Partial<Omit<Expense, 'id' | 'tripId' | 'userId' | 'createdAt'>>
): Promise<boolean> {
  try {
    const expenseRef = doc(db, EXPENSES_COLLECTION, id)
    await updateDoc(expenseRef, updates)
    return true
  } catch (error) {
    console.error('Error updating expense:', error)
    return false
  }
}

export async function deleteExpense(id: string, userId: string): Promise<boolean> {
  try {
    const expenseRef = doc(db, EXPENSES_COLLECTION, id)
    await deleteDoc(expenseRef)
    return true
  } catch (error) {
    console.error('Error deleting expense:', error)
    return false
  }
}
