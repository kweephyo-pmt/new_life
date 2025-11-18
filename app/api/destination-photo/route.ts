import { NextRequest } from 'next/server'

// Cache to avoid repeated API calls for same destinations
const photoCache = new Map<string, string>()

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const destination = searchParams.get('destination')?.trim() || ''
    const locationHint = searchParams.get('location')?.trim() || ''

    if (!destination) {
        return Response.json({ error: 'Destination is required' }, { status: 400 })
    }

    // Check cache first
    const cacheKey = `${destination}|${locationHint}`.toLowerCase()
    if (photoCache.has(cacheKey)) {
        return Response.json({ imageUrl: photoCache.get(cacheKey) })
    }

    try {
        const apiKey = process.env.GOOGLE_PLACES_API_KEY
        
        if (!apiKey) {
            return Response.json({ error: 'GOOGLE_PLACES_API_KEY not configured' }, { status: 500 })
        }

        // Step 1: Search for famous landmarks/tourist attractions with improved prompts
        const fullLocationQuery = locationHint ? `${destination} ${locationHint}` : destination

        const searchQueries = [
            // 🚨 HIGH-CONFIDENCE GLOBAL QUERIES for iconic images
            `${fullLocationQuery} **main landmark icon view**`,
            `${fullLocationQuery} **most photographed tourist attraction**`,
            `${fullLocationQuery} **famous monument sign**`,
            
            // Original Queries (now as fallbacks)
            `${fullLocationQuery} iconic landmark`,
            `${fullLocationQuery} skyline`,
            `${fullLocationQuery} famous tourist attraction`,
            `${fullLocationQuery} scenic view`,
            `${fullLocationQuery} beach`,
            `${fullLocationQuery} historic center`,
            `${fullLocationQuery} most photographed place`,
            `${fullLocationQuery} main attraction`,
            
            // Fallbacks without the location hint
            `${destination} iconic landmark`,
            `${destination} skyline`,
            `${destination} famous tourist attraction`,
            `${destination} scenic view`,
            `${destination} beach`,
            `${destination} historic center`,
            `${destination} most photographed place`,
            `${destination} main attraction`,
        ].filter((query, index, self) => query.trim() && self.indexOf(query) === index)
        
        let place = null
        let bestPlace = null
        let highestScore = 0
        
        // Try each search query and score results
        for (const query of searchQueries) {
            // Don't restrict to tourist_attraction type for beach/scenic queries
            const typeParam = query.includes('beach') || query.includes('scenic') ? '' : '&type=tourist_attraction'
            const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}${typeParam}&key=${apiKey}`
            const searchResponse = await fetch(searchUrl)
            const searchData = await searchResponse.json()
            
            if (searchData.status === 'OK' && searchData.results && searchData.results.length > 0) {
                
                // Score each place based on popularity and quality
                for (const p of searchData.results) {
                    if (!p.photos || p.photos.length === 0) continue
                    
                    const rating = p.rating || 0
                    const reviews = p.user_ratings_total || 0
                    const photoCount = p.photos.length
                    
                    // 💡 FILTER: Skip places that are low-rated AND unpopular (globally, main sights are highly reviewed)
                    if (reviews < 500 && rating < 4.0) continue; 

                    // Base Score: Prioritizes popularity (log scale) and rating
                    let score = rating * Math.log10(reviews + 10) * Math.min(photoCount, 10)
                    
                    // 🚨 ENHANCED BOOSTING LOGIC
                    
                    // 1. Highest Boost for definitive landmarks/monuments
                    if (p.types?.includes('landmark') || p.types?.includes('monument')) {
                        score *= 2.0 
                    } 
                    // 2. Strong Boost for general tourist attractions
                    else if (p.types?.includes('tourist_attraction') || p.types?.includes('point_of_interest')) {
                        score *= 1.5
                    }
                    
                    // 3. Boost for natural features like beaches (if they're the destination)
                    if (p.types?.includes('natural_feature') || p.name?.toLowerCase().includes('beach')) {
                        score *= 1.6
                    }
                    
                    // 4. Boost if name contains destination (more likely to be THE landmark)
                    if (p.name?.toLowerCase().includes(destination.toLowerCase())) {
                        score *= 1.3
                    }
                    
                    if (score > highestScore) {
                        highestScore = score
                        bestPlace = p
                    }
                }
            }
        }
        
        place = bestPlace

        if (!place) {
            return Response.json({ error: `No high-confidence landmark found for ${destination}` }, { status: 404 })
        }
        
        // Step 2: Get the best photo
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