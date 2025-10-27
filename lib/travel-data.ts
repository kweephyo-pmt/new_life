// Utility functions for fetching real travel data

interface WeatherData {
  score: number
  description: string
  temp: string
  rainfall: string
  avgTemp: number
  conditions: string
}

interface PricingData {
  score: number
  description: string
  flightTrend: 'increasing' | 'decreasing' | 'stable'
  hotelTrend: 'increasing' | 'decreasing' | 'stable'
}

interface CrowdData {
  score: number
  description: string
  level: 'Low' | 'Medium' | 'High'
}

// Get coordinates for a destination using geocoding
async function getCoordinates(destination: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(destination)}&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'NewLifeTravelApp/1.0'
        }
      }
    )
    const data = await response.json()
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon)
      }
    }
    return null
  } catch (error) {
    console.error('Error getting coordinates:', error)
    return null
  }
}

// Get weather data using Open-Meteo (free, no API key needed)
export async function getWeatherData(
  destination: string,
  startDate: string,
  endDate: string
): Promise<WeatherData> {
  try {
    const coords = await getCoordinates(destination)
    if (!coords) {
      return getFallbackWeatherData(destination)
    }

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&timezone=auto&start_date=${startDate}&end_date=${endDate}`
    )
    
    const data = await response.json()
    
    if (data.daily) {
      const temps = data.daily.temperature_2m_max
      const rainfall = data.daily.precipitation_sum
      const avgTemp = Math.round(temps.reduce((a: number, b: number) => a + b, 0) / temps.length)
      const totalRain = rainfall.reduce((a: number, b: number) => a + b, 0)
      
      // Calculate weather score (0-100)
      let score = 100
      if (avgTemp < 10 || avgTemp > 35) score -= 20
      if (totalRain > 50) score -= 20
      if (totalRain > 100) score -= 10
      
      const conditions = totalRain > 50 ? 'Rainy' : totalRain > 20 ? 'Partly Cloudy' : 'Mostly Sunny'
      
      return {
        score: Math.max(0, score),
        description: `${conditions} conditions expected in ${destination}`,
        temp: `${Math.round(temps[0])}°C - ${Math.round(temps[temps.length - 1])}°C`,
        rainfall: `${Math.round(totalRain)}mm total`,
        avgTemp,
        conditions
      }
    }
    
    return getFallbackWeatherData(destination)
  } catch (error) {
    console.error('Error fetching weather data:', error)
    return getFallbackWeatherData(destination)
  }
}

function getFallbackWeatherData(destination: string): WeatherData {
  return {
    score: 75,
    description: `Weather data for ${destination}`,
    temp: 'Check forecast closer to date',
    rainfall: 'Varies by season',
    avgTemp: 20,
    conditions: 'Variable'
  }
}

// Analyze pricing trends based on seasonality
export async function getPricingData(
  destination: string,
  startDate: string,
  endDate: string
): Promise<PricingData> {
  try {
    const start = new Date(startDate)
    const month = start.getMonth() // 0-11
    
    // Peak seasons (higher prices): June-August (summer), December (holidays)
    const isPeakSeason = month >= 5 && month <= 7 || month === 11
    
    // Shoulder seasons (medium prices): March-May, September-November
    const isShoulderSeason = (month >= 2 && month <= 4) || (month >= 8 && month <= 10)
    
    let score = 50
    let flightTrend: 'increasing' | 'decreasing' | 'stable' = 'stable'
    let hotelTrend: 'increasing' | 'decreasing' | 'stable' = 'stable'
    let description = ''
    
    if (isPeakSeason) {
      score = 40
      flightTrend = 'increasing'
      hotelTrend = 'increasing'
      description = 'Peak season - Higher prices expected'
    } else if (isShoulderSeason) {
      score = 70
      flightTrend = 'stable'
      hotelTrend = 'stable'
      description = 'Shoulder season - Moderate prices'
    } else {
      score = 85
      flightTrend = 'decreasing'
      hotelTrend = 'decreasing'
      description = 'Off-peak season - Best prices available'
    }
    
    return {
      score,
      description,
      flightTrend,
      hotelTrend
    }
  } catch (error) {
    console.error('Error analyzing pricing:', error)
    return {
      score: 60,
      description: 'Pricing analysis in progress',
      flightTrend: 'stable',
      hotelTrend: 'stable'
    }
  }
}

// Estimate crowd levels based on seasonality and destination
export async function getCrowdData(
  destination: string,
  startDate: string,
  endDate: string
): Promise<CrowdData> {
  try {
    const start = new Date(startDate)
    const month = start.getMonth()
    
    // Peak tourist months
    const isPeakSeason = month >= 5 && month <= 7 || month === 11
    const isShoulderSeason = (month >= 2 && month <= 4) || (month >= 8 && month <= 10)
    
    let score = 50
    let level: 'Low' | 'Medium' | 'High' = 'Medium'
    let description = ''
    
    if (isPeakSeason) {
      score = 35
      level = 'High'
      description = 'Peak tourist season - Expect large crowds'
    } else if (isShoulderSeason) {
      score = 65
      level = 'Medium'
      description = 'Moderate tourist activity'
    } else {
      score = 85
      level = 'Low'
      description = 'Off-season - Fewer tourists, more peaceful'
    }
    
    return {
      score,
      description,
      level
    }
  } catch (error) {
    console.error('Error analyzing crowds:', error)
    return {
      score: 60,
      description: 'Tourist activity analysis',
      level: 'Medium'
    }
  }
}

// Get all travel data at once
export async function getTravelData(
  destination: string,
  startDate: string,
  endDate: string
) {
  const [weather, pricing, crowds] = await Promise.all([
    getWeatherData(destination, startDate, endDate),
    getPricingData(destination, startDate, endDate),
    getCrowdData(destination, startDate, endDate)
  ])
  
  return {
    weather,
    pricing,
    crowds
  }
}
