import { NextRequest } from 'next/server'

// Cache to avoid repeated API calls for same destinations
const photoCache = new Map<string, string>()

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const destination = searchParams.get('destination') || ''
  
  if (!destination) {
    return Response.json({ error: 'Destination is required' }, { status: 400 })
  }

  // Check cache first
  const cacheKey = destination.toLowerCase()
  if (photoCache.has(cacheKey)) {
    return Response.json({ imageUrl: photoCache.get(cacheKey) })
  }

  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY
    
    if (!apiKey) {
      return Response.json({ error: 'GOOGLE_PLACES_API_KEY not configured' }, { status: 500 })
    }

    // Step 1: Search for famous landmarks/tourist attractions
    const searchQueries = [
      `${destination} most famous landmark`,
      `${destination} iconic monument`,
      `${destination} main tourist attraction`,
    ]
    
    let place = null
    let bestPlace = null
    let highestScore = 0
    
    // Try each search query and score results
    for (const query of searchQueries) {
      const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&type=tourist_attraction&key=${apiKey}`
      const searchResponse = await fetch(searchUrl)
      const searchData = await searchResponse.json()
      
      if (searchData.status === 'OK' && searchData.results && searchData.results.length > 0) {
        // Score each place based on popularity and quality
        for (const p of searchData.results) {
          if (!p.photos || p.photos.length === 0) continue
          
          // Calculate score: rating * log(reviews) * photo_count
          const rating = p.rating || 0
          const reviews = p.user_ratings_total || 0
          const photoCount = p.photos.length
          
          // Prioritize places with high ratings and many reviews
          const score = rating * Math.log10(reviews + 1) * Math.min(photoCount, 5)
          
          if (score > highestScore) {
            highestScore = score
            bestPlace = p
          }
        }
      }
    }
    
    place = bestPlace

    if (!place) {
      return Response.json({ error: `No landmark found for ${destination}` }, { status: 404 })
    }
    
    // Step 2: Get the best photo (first photo is usually the main/best one)
    if (place.photos && place.photos.length > 0) {
      const photoReference = place.photos[0].photo_reference
      // Construct Google Places Photo URL with higher quality
      const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photoreference=${photoReference}&key=${apiKey}`
      
      photoCache.set(cacheKey, photoUrl)
      return Response.json({ imageUrl: photoUrl })
    }

    // No photos available
    return Response.json({ error: 'No photos available for this destination' }, { status: 404 })

  } catch (error) {
    console.error('Error fetching destination photo:', error)
    return Response.json({ error: 'Failed to fetch destination photo' }, { status: 500 })
  }
}
