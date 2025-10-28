import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  Timestamp,
  increment,
  getDoc,
  onSnapshot
} from 'firebase/firestore'
import { db } from './firebase'

export interface Comment {
  id: string
  postId: string
  userId: string
  author: {
    name: string
    username: string
    photoURL?: string
  }
  content: string
  timestamp: Timestamp
}

export interface Post {
  id: string
  userId: string
  author: {
    name: string
    avatar: string
    username: string
    photoURL?: string
  }
  content: string
  location: string
  images: string[]
  likes: number
  comments: number
  likedBy: string[]
  savedBy: string[]
  timestamp: Timestamp
  createdAt: Timestamp
}

// Create a new post
export async function createPost(
  userId: string,
  authorName: string,
  authorUsername: string,
  content: string,
  location: string,
  images: string[] = []
): Promise<string> {
  try {
    const postData = {
      userId,
      author: {
        name: authorName,
        avatar: authorName.split(' ').map(n => n[0]).join('').toUpperCase(),
        username: authorUsername,
      },
      content,
      location,
      images,
      likes: 0,
      comments: 0,
      likedBy: [],
      savedBy: [],
      timestamp: Timestamp.now(),
      createdAt: Timestamp.now(),
    }

    const docRef = await addDoc(collection(db, 'posts'), postData)
    return docRef.id
  } catch (error) {
    console.error('Error creating post:', error)
    throw error
  }
}

// Get all posts (ordered by timestamp)
export async function getAllPosts(): Promise<Post[]> {
  try {
    const q = query(
      collection(db, 'posts'),
      orderBy('timestamp', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    const posts = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Post))
    
    // Enrich posts with user profile data
    const enrichedPosts = await Promise.all(
      posts.map(async (post) => {
        try {
          const userProfileDoc = await getDoc(doc(db, 'userProfiles', post.userId))
          if (userProfileDoc.exists()) {
            const profile = userProfileDoc.data()
            return {
              ...post,
              author: {
                ...post.author,
                name: profile.displayName || post.author.name,
                username: profile.username || post.author.username,
                photoURL: profile.photoURL || undefined
              }
            }
          }
        } catch (error) {
          console.error('Error fetching user profile:', error)
        }
        return post
      })
    )
    
    return enrichedPosts
  } catch (error) {
    console.error('Error getting posts:', error)
    return []
  }
}

// Get posts by user
export async function getUserPosts(userId: string): Promise<Post[]> {
  try {
    const q = query(
      collection(db, 'posts'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Post))
  } catch (error) {
    console.error('Error getting user posts:', error)
    return []
  }
}

// Toggle like on a post
export async function toggleLike(postId: string, userId: string): Promise<boolean> {
  try {
    const postRef = doc(db, 'posts', postId)
    const postDoc = await getDocs(query(collection(db, 'posts'), where('__name__', '==', postId)))
    
    if (postDoc.empty) return false
    
    const postData = postDoc.docs[0].data()
    const likedBy = postData.likedBy || []
    const isLiked = likedBy.includes(userId)
    
    if (isLiked) {
      // Unlike
      await updateDoc(postRef, {
        likes: increment(-1),
        likedBy: likedBy.filter((id: string) => id !== userId)
      })
    } else {
      // Like
      await updateDoc(postRef, {
        likes: increment(1),
        likedBy: [...likedBy, userId]
      })
    }
    
    return true
  } catch (error) {
    console.error('Error toggling like:', error)
    return false
  }
}

// Toggle save on a post
export async function toggleSave(postId: string, userId: string): Promise<boolean> {
  try {
    const postRef = doc(db, 'posts', postId)
    const postDoc = await getDocs(query(collection(db, 'posts'), where('__name__', '==', postId)))
    
    if (postDoc.empty) return false
    
    const postData = postDoc.docs[0].data()
    const savedBy = postData.savedBy || []
    const isSaved = savedBy.includes(userId)
    
    if (isSaved) {
      // Unsave
      await updateDoc(postRef, {
        savedBy: savedBy.filter((id: string) => id !== userId)
      })
    } else {
      // Save
      await updateDoc(postRef, {
        savedBy: [...savedBy, userId]
      })
    }
    
    return true
  } catch (error) {
    console.error('Error toggling save:', error)
    return false
  }
}

// Update a post
export async function updatePost(
  postId: string,
  updates: { content?: string; location?: string }
): Promise<boolean> {
  try {
    const postRef = doc(db, 'posts', postId)
    await updateDoc(postRef, updates)
    return true
  } catch (error) {
    console.error('Error updating post:', error)
    return false
  }
}

// Delete a post
export async function deletePost(postId: string, userId: string): Promise<boolean> {
  try {
    const postDoc = await getDocs(query(collection(db, 'posts'), where('__name__', '==', postId)))
    
    if (postDoc.empty) return false
    
    const postData = postDoc.docs[0].data()
    
    // Only allow deletion if user owns the post
    if (postData.userId !== userId) {
      console.error('User does not own this post')
      return false
    }
    
    await deleteDoc(doc(db, 'posts', postId))
    return true
  } catch (error) {
    console.error('Error deleting post:', error)
    return false
  }
}

// Add a comment to a post
export async function addComment(
  postId: string,
  userId: string,
  authorName: string,
  authorUsername: string,
  content: string,
  photoURL?: string
): Promise<boolean> {
  try {
    const commentData: any = {
      postId,
      userId,
      author: {
        name: authorName,
        username: authorUsername
      },
      content,
      timestamp: Timestamp.now()
    }
    
    // Only add photoURL if it exists
    if (photoURL) {
      commentData.author.photoURL = photoURL
    }
    
    await addDoc(collection(db, 'comments'), commentData)
    
    // Increment comment count on post
    const postRef = doc(db, 'posts', postId)
    await updateDoc(postRef, {
      comments: increment(1)
    })
    
    return true
  } catch (error) {
    console.error('Error adding comment:', error)
    return false
  }
}

// Get comments for a post
export async function getComments(postId: string): Promise<Comment[]> {
  try {
    const q = query(
      collection(db, 'comments'),
      where('postId', '==', postId),
      orderBy('timestamp', 'asc')
    )
    
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Comment))
  } catch (error) {
    console.error('Error getting comments:', error)
    return []
  }
}

// Delete a comment
export async function deleteComment(commentId: string, userId: string, postId: string): Promise<boolean> {
  try {
    const commentDoc = await getDoc(doc(db, 'comments', commentId))
    
    if (!commentDoc.exists()) return false
    
    const commentData = commentDoc.data()
    
    // Only allow deletion if user owns the comment
    if (commentData.userId !== userId) {
      console.error('User does not own this comment')
      return false
    }
    
    await deleteDoc(doc(db, 'comments', commentId))
    
    // Decrement comment count on post
    const postRef = doc(db, 'posts', postId)
    await updateDoc(postRef, {
      comments: increment(-1)
    })
    
    return true
  } catch (error) {
    console.error('Error deleting comment:', error)
    return false
  }
}

// Get saved posts for a user
export async function getSavedPosts(userId: string): Promise<Post[]> {
  try {
    const q = query(
      collection(db, 'posts'),
      where('savedBy', 'array-contains', userId),
      orderBy('timestamp', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    const posts = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Post))

    // Enrich posts with user profile data
    const enrichedPosts = await Promise.all(
      posts.map(async (post) => {
        try {
          const userProfileDoc = await getDoc(doc(db, 'userProfiles', post.userId))
          if (userProfileDoc.exists()) {
            const profile = userProfileDoc.data()
            return {
              ...post,
              author: {
                ...post.author,
                name: profile.displayName || post.author.name,
                username: profile.username || post.author.username,
                photoURL: profile.photoURL || undefined
              }
            }
          }
        } catch (error) {
          console.error('Error fetching user profile:', error)
        }
        return post
      })
    )

    return enrichedPosts
  } catch (error) {
    console.error('Error getting saved posts:', error)
    return []
  }
}

// Real-time listener for posts
export function setupPostsListener(
  callback: (posts: Post[]) => void,
  filterSaved: boolean = false,
  userId?: string
) {
  try {
    const postsRef = collection(db, 'posts')
    let q = query(postsRef, orderBy('timestamp', 'desc'))
    
    if (filterSaved && userId) {
      q = query(postsRef, where('savedBy', 'array-contains', userId), orderBy('timestamp', 'desc'))
    }
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const posts: Post[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Post))
      
      // Enrich posts with user profile data
      const enrichedPosts = await Promise.all(
        posts.map(async (post) => {
          try {
            const userProfileDoc = await getDoc(doc(db, 'userProfiles', post.userId))
            if (userProfileDoc.exists()) {
              const profile = userProfileDoc.data()
              return {
                ...post,
                author: {
                  ...post.author,
                  name: profile.displayName || post.author.name,
                  username: profile.username || post.author.username,
                  photoURL: profile.photoURL || undefined
                }
              }
            }
          } catch (error) {
            console.error('Error fetching user profile:', error)
          }
          return post
        })
      )
      
      callback(enrichedPosts)
    }, (error) => {
      console.error('Error in posts listener:', error)
    })
    
    return unsubscribe
  } catch (error) {
    console.error('Error setting up posts listener:', error)
    return undefined
  }
}

// Real-time listener for comments on a specific post
export function setupCommentsListener(
  postId: string,
  callback: (comments: Comment[]) => void
) {
  try {
    const commentsRef = collection(db, 'comments')
    const q = query(
      commentsRef,
      where('postId', '==', postId),
      orderBy('timestamp', 'asc')
    )
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const comments: Comment[] = []
      
      for (const docSnap of snapshot.docs) {
        const commentData = docSnap.data()
        
        // Enrich with user profile data
        try {
          const userProfileDoc = await getDoc(doc(db, 'userProfiles', commentData.userId))
          if (userProfileDoc.exists()) {
            const profile = userProfileDoc.data()
            comments.push({
              id: docSnap.id,
              ...commentData,
              author: {
                name: profile.displayName || commentData.author.name,
                username: profile.username || commentData.author.username,
                photoURL: profile.photoURL || undefined
              }
            } as Comment)
          } else {
            comments.push({
              id: docSnap.id,
              ...commentData
            } as Comment)
          }
        } catch (error) {
          console.error('Error fetching user profile for comment:', error)
          comments.push({
            id: docSnap.id,
            ...commentData
          } as Comment)
        }
      }
      
      callback(comments)
    }, (error) => {
      console.error('Error in comments listener:', error)
    })
    
    return unsubscribe
  } catch (error) {
    console.error('Error setting up comments listener:', error)
    return undefined
  }
}
