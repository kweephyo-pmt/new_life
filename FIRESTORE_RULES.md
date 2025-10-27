# Firestore Security Rules

Add these rules to your Firebase Console (Firestore Database → Rules):

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
      allow read: if request.auth != null && 
                     request.auth.uid == resource.data.userId;
      
      // Allow users to create itineraries with their own userId
      allow create: if request.auth != null && 
                       request.auth.uid == request.resource.data.userId;
      
      // Allow users to update their own itineraries
      allow update: if request.auth != null && 
                       request.auth.uid == resource.data.userId;
      
      // Allow users to delete their own itineraries
      allow delete: if request.auth != null && 
                       request.auth.uid == resource.data.userId;
    }
  }
}
```

## How to Apply

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to: **Firestore Database** → **Rules**
4. Replace the existing rules with the rules above
5. Click **Publish**

## What These Rules Do

### Trips Collection
- ✅ Users can only read, create, update, and delete their own trips
- ✅ User ownership is verified through the `userId` field

### Itineraries Collection
- ✅ Users can only read, create, update, and delete their own itineraries
- ✅ User ownership is verified through the `userId` field
- ✅ Itinerary ID matches the trip ID for easy lookup

## Security Features

- **Authentication Required**: All operations require a logged-in user
- **User Isolation**: Users can only access their own data
- **Ownership Verification**: All operations verify the `userId` field matches the authenticated user
