export interface WeatherData {
  city: string
  temperature: number
  code: number
}

const WMO_CODES: Record<number, string> = {
  0: '☀️',   // Clear sky
  1: '⛅',   // Mainly clear
  2: '⛅',   // Partly cloudy
  3: '☁️',   // Overcast
  45: '🌫️',  // Fog
  48: '🌫️',  // Depositing rime fog
  51: '🌧️',  // Light drizzle
  53: '🌧️',  // Moderate drizzle
  55: '🌧️',  // Dense drizzle
  61: '🌧️',  // Slight rain
  63: '🌧️',  // Moderate rain
  65: '🌧️',  // Heavy rain
  71: '❄️',   // Slight snow
  73: '❄️',   // Moderate snow
  75: '❄️',   // Heavy snow
  77: '❄️',   // Snow grains
  80: '🌧️',  // Slight rain showers
  81: '🌧️',  // Moderate rain showers
  82: '🌧️',  // Violent rain showers
  85: '❄️',   // Slight snow showers
  86: '❄️',   // Heavy snow showers
  95: '⛈️',  // Thunderstorm
  96: '⛈️',  // Thunderstorm with slight hail
  99: '⛈️',  // Thunderstorm with heavy hail
}

export function getWeatherIcon(code: number): string {
  return WMO_CODES[code] || '🌡️'
}

export async function fetchWeather(): Promise<WeatherData | null> {
  try {
    // Step 1: Get location from IP
    const geoRes = await fetch('https://ipapi.co/json/')
    if (!geoRes.ok) return null
    const geo = await geoRes.json()

    const { latitude, longitude, city } = geo
    if (!latitude || !longitude) return null

    // Step 2: Get weather from Open-Meteo
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
    const weatherRes = await fetch(weatherUrl)
    if (!weatherRes.ok) return null
    const weather = await weatherRes.json()

    return {
      city: city || 'Unknown',
      temperature: Math.round(weather.current_weather?.temperature ?? 0),
      code: weather.current_weather?.weathercode ?? 0,
    }
  } catch {
    return null
  }
}