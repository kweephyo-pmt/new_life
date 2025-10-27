
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Trips collection rules
    match /trips/{tripId} {
      // Allow users to read their own trips
      allow read: if request.auth != null && 
                     request.auth.uid == resource.data.userId;
      
      // Allow users to create trips with their own userId
      allow create: if request.auth != null && 
                       request.auth.uid == request.resource.data.userId;
      
      // Allow users to update their own trips
      allow update: if request.auth != null && 
                       request.auth.uid == resource.data.userId;
      
      // Allow users to delete their own trips
      allow delete: if request.auth != null && 
                       request.auth.uid == resource.data.userId;
    }
    
    // Itineraries collection rules
    match /itineraries/{itineraryId} {
      // Allow users to read their own itineraries
      // Also allow read if document doesn't exist (for checking before create)
      allow read: if request.auth != null && 
                     (resource == null || request.auth.uid == resource.data.userId);
      
      // Allow users to create itineraries with their own userId
      allow create: if request.auth != null && 
                       request.auth.uid == request.resource.data.userId;
      
      // Allow users to update their own itineraries
      // Check both existing and new data to ensure userId matches
      allow update: if request.auth != null && 
                       request.auth.uid == resource.data.userId &&
                       request.auth.uid == request.resource.data.userId;
      
      // Allow users to delete their own itineraries
      allow delete: if request.auth != null && 
                       request.auth.uid == resource.data.userId;
    }
    
    // Expenses collection rules
    match /expenses/{expenseId} {
      // Allow users to read their own expenses
      allow read: if request.auth != null && 
                     request.auth.uid == resource.data.userId;
      
      // Allow users to create expenses with their own userId
      allow create: if request.auth != null && 
                       request.auth.uid == request.resource.data.userId;
      
      // Allow users to update their own expenses
      allow update: if request.auth != null && 
                       request.auth.uid == resource.data.userId;
      
      // Allow users to delete their own expenses
      allow delete: if request.auth != null && 
                       request.auth.uid == resource.data.userId;
    }
    
    // Posts collection rules (Community)
    match /posts/{postId} {
      // Allow all authenticated users to read posts
      allow read: if request.auth != null;
      
      // Allow users to create posts with their own userId
      allow create: if request.auth != null && 
                       request.auth.uid == request.resource.data.userId;
      
      // Allow users to update their own posts
      // Also allow any authenticated user to update likes/saves
      allow update: if request.auth != null && 
                       (request.auth.uid == resource.data.userId ||
                        onlyUpdatingLikesOrSavesOrComments());
      
      // Allow users to delete their own posts
      allow delete: if request.auth != null && 
                       request.auth.uid == resource.data.userId;
    }
    
    // Comments collection rules
    match /comments/{commentId} {
      // Allow all authenticated users to read comments
      allow read: if request.auth != null;
      
      // Allow users to create comments with their own userId
      allow create: if request.auth != null && 
                       request.auth.uid == request.resource.data.userId;
      
      // Allow users to delete their own comments
      allow delete: if request.auth != null && 
                       request.auth.uid == resource.data.userId;
    }
    
    // Helper function to check if only likes/saves are being updated
    function onlyUpdatingLikesOrSavesOrComments() {
      let affectedKeys = request.resource.data.diff(resource.data).affectedKeys();
      return affectedKeys.hasOnly(['likes', 'likedBy', 'savedBy', 'comments']);
    }
    
    // User Profiles collection rules
    match /userProfiles/{userId} {
      // Allow users to read any profile (for viewing other users)
      allow read: if request.auth != null;
      
      // Allow users to create/update their own profile
      allow create, update: if request.auth != null && 
                               request.auth.uid == userId;
      
      // Don't allow profile deletion
      allow delete: if false;
    }
  }
}
`
