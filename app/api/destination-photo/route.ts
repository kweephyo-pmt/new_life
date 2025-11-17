import { NextRequest } from "next/server";

const photoCache = new Map<string, string>();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const destination = searchParams.get("destination") || "";

  if (!destination) {
    return Response.json({ error: "Destination is required" }, { status: 400 });
  }

  const cacheKey = destination.toLowerCase();
  if (photoCache.has(cacheKey)) {
    return Response.json({ imageUrl: photoCache.get(cacheKey) });
  }

  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "GOOGLE_PLACES_API_KEY not configured" },
        { status: 500 }
      );
    }

    // -----------------------------------------------------
    // 1. AUTOCOMPLETE — Detect the correct place/country
    // -----------------------------------------------------
    const autoUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
      destination
    )}&types=geocode&key=${apiKey}`;

    const autoRes = await fetch(autoUrl);
    const autoData = await autoRes.json();

    let placeId: string | null = null;

    if (autoData.status === "OK" && autoData.predictions?.length > 0) {
      placeId = autoData.predictions[0].place_id;
    }

    let photoUrl: string | null = null;

    // -----------------------------------------------------
    // 2. PLACE DETAILS → Get official photos (BEST QUALITY)
    // -----------------------------------------------------
    if (placeId) {
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}`;
      const detailsRes = await fetch(detailsUrl);
      const detailsData = await detailsRes.json();

      if (detailsData.status === "OK") {
        const placeDetails = detailsData.result;

        if (placeDetails.photos && placeDetails.photos.length > 0) {
          const photoRef = placeDetails.photos[0].photo_reference;
          photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photoreference=${photoRef}&key=${apiKey}`;
        }
      }
    }

    // -----------------------------------------------------
    // 3. FALLBACK: TEXT SEARCH (Landmarks only)
    // -----------------------------------------------------
    if (!photoUrl) {
      const queries = [
        destination,
        `${destination} landmark`,
        `${destination} temple`,
        `${destination} viewpoint`,
        `${destination} tourist attraction`,
        `${destination} historic site`,
      ];

      let bestPlace = null;
      let bestScore = 0;

      for (const q of queries) {
        const textUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
          q
        )}&key=${apiKey}`;

        const res = await fetch(textUrl);
        const data = await res.json();

        if (data.status !== "OK") continue;

        for (const p of data.results) {
          if (!p.photos) continue;

          const rating = p.rating || 0;
          const reviews = p.user_ratings_total || 0;
          const score = rating * Math.log10(reviews + 10);

          if (score > bestScore) {
            bestScore = score;
            bestPlace = p;
          }
        }
      }

      if (bestPlace?.photos?.length > 0) {
        const ref = bestPlace.photos[0].photo_reference;
        photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photoreference=${ref}&key=${apiKey}`;
      }
    }

    // Still no result
    if (!photoUrl) {
      return Response.json(
        { error: `No photos available for ${destination}` },
        { status: 404 }
      );
    }

    // Save to cache
    photoCache.set(cacheKey, photoUrl);

    return Response.json({ imageUrl: photoUrl });
  } catch (err) {
    console.error("Error fetching destination photo:", err);
    return Response.json(
      { error: "Failed to fetch destination photo" },
      { status: 500 }
    );
  }
}
