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

        // Step 1: Get geographic location of the destination FIRST
        const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(destination)}&key=${apiKey}`
        const geocodingResponse = await fetch(geocodingUrl)
        const geocodingData = await geocodingResponse.json()

        if (geocodingData.status !== 'OK' || !geocodingData.results || geocodingData.results.length === 0) {
            return Response.json({ error: `Could not find location: ${destination}` }, { status: 404 })
        }

        // Get the bounds of the destination
        const result = geocodingData.results[0]
        const bounds = result.geometry.bounds || result.geometry.viewport
        const center = result.geometry.location

        // Extract country/state from address components
        const addressComponents = result.address_components
        let country = ''
        let state = ''

        for (const component of addressComponents) {
            if (component.types.includes('country')) {
                country = component.long_name
            }
            if (component.types.includes('administrative_area_level_1')) {
                state = component.long_name
            }
        }

        // Build location-specific search queries (narrower, more precise)
        const fullLocationQuery = locationHint ? `${destination} ${locationHint}` : destination

        const searchQueries = [
            // 🎯 LOCATION-SPECIFIC QUERIES (priority)
            `${fullLocationQuery} iconic landmark`,
            `${fullLocationQuery} famous attraction`,
            `${fullLocationQuery} main temple`,
            `${fullLocationQuery} primary tourist site`,
            `${fullLocationQuery} heritage site`,
            `${fullLocationQuery} archaeological site`,
            `${fullLocationQuery} historic monument`,
            
            // Broader destination queries
            `${destination} iconic landmark`,
            `${destination} famous attraction`,
            `${destination} main temple`,
            `${destination} best viewpoint`,
            `${destination} historic center`,
            `${destination} scenic landmark`,
        ].filter((query, index, self) => query.trim() && self.indexOf(query) === index)
        
        let bestPlace = null
        let highestScore = 0
        
        // Try each search query and score results
        for (const query of searchQueries) {
            const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`
            
            try {
                const searchResponse = await fetch(searchUrl)
                const searchData = await searchResponse.json()
                
                if (searchData.status === 'OK' && searchData.results && searchData.results.length > 0) {
                    
                    // Score each place based on relevance and quality
                    for (const p of searchData.results) {
                        if (!p.photos || p.photos.length === 0) continue
                        
                        const rating = p.rating || 3.5
                        const reviews = p.user_ratings_total || 0
                        const photoCount = p.photos.length
                        
                        // CRITICAL FILTER: Must be within destination bounds to avoid wrong locations
                        if (bounds) {
                            const lat = p.geometry.location.lat
                            const lng = p.geometry.location.lng
                            const isWithinBounds = 
                                lat >= bounds.southwest.lat && 
                                lat <= bounds.northeast.lat && 
                                lng >= bounds.southwest.lng && 
                                lng <= bounds.northeast.lng
                            
                            // If not within bounds, give MASSIVE penalty but don't skip entirely
                            if (!isWithinBounds) {
                                continue // Skip places outside the destination bounds entirely
                            }
                        }
                        
                        // Skip places that are too unpopular (likely not main attractions)
                        if (reviews < 100 && rating < 3.8) continue
                        
                        // Base Score: Popularity (log scale) × Rating × Photo availability
                        let score = rating * Math.log10(Math.max(reviews, 10)) * Math.min(photoCount, 10)
                        
                        // BOOSTING LOGIC
                        
                        // 1. Highest Boost for landmarks/monuments/temples
                        if (p.types?.includes('landmark') || 
                            p.types?.includes('monument') || 
                            p.name?.toLowerCase().includes('temple') ||
                            p.name?.toLowerCase().includes('shrine') ||
                            p.name?.toLowerCase().includes('pagoda')) {
                            score *= 3.0
                        } 
                        // 2. Strong Boost for tourist attractions
                        else if (p.types?.includes('tourist_attraction') || p.types?.includes('point_of_interest')) {
                            score *= 2.0
                        }
                        
                        // 3. Boost if name closely matches destination (exact or strong match)
                        const destLower = destination.toLowerCase()
                        const placeName = p.name?.toLowerCase() || ''
                        if (placeName.includes(destLower) || destLower.includes(placeName.split(' ')[0])) {
                            score *= 1.8
                        }
                        
                        // 4. Penalty for generic/ambiguous names
                        if (placeName.includes('restaurant') || placeName.includes('hotel') || placeName.includes('shop')) {
                            score *= 0.3
                        }
                        
                        if (score > highestScore) {
                            highestScore = score
                            bestPlace = p
                        }
                    }
                }
            } catch (queryError) {
                console.error(`Error searching query: ${query}`, queryError)
                continue
            }
        }
        
        if (!bestPlace) {
            return Response.json({ error: `No relevant landmark found for ${destination}` }, { status: 404 })
        }
        
        // Step 2: Get the best photo
        if (bestPlace.photos && bestPlace.photos.length > 0) {
            const photoReference = bestPlace.photos[0].photo_reference
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