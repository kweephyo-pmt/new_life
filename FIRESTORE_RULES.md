
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
  }
}
`
