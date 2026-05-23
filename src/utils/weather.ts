export interface WeatherData {
  city: string
  temperature: number
  code: number
  isNight: boolean
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

const NIGHT_CODES: Record<number, string> = {
  0: '🌙',   // Clear sky - night
  1: '⛅',   // Mainly clear - night
  2: '⛅',   // Partly cloudy
  3: '☁️',   // Overcast
}

export function getWeatherIcon(code: number, isNight: boolean): string {
  if (isNight && NIGHT_CODES[code]) {
    return NIGHT_CODES[code]
  }
  return WMO_CODES[code] || '🌡️'
}

export async function fetchWeather(): Promise<WeatherData | null> {
  try {
    // Step 1: Get location from IP
    const geoRes = await fetch('http://ip-api.com/json/')
    if (!geoRes.ok) return null
    const geo = await geoRes.json()

    const { lat, lon, city } = geo
    if (!lat || !lon) return null

    // Step 2: Get weather from Open-Meteo (include daily for sunrise/sunset)
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=sunrise,sunset&timezone=auto`
    const weatherRes = await fetch(weatherUrl)
    if (!weatherRes.ok) return null
    const weather = await weatherRes.json()

    // Determine if it's currently night time
    const now = Date.now()
    const daily = weather.daily
    let isNight = false
    if (daily?.sunrise && daily?.sunset) {
      const sunrise = new Date(daily.sunrise[0]).getTime()
      const sunset = new Date(daily.sunset[0]).getTime()
      isNight = now < sunrise || now > sunset
    }

    return {
      city: city || 'Unknown',
      temperature: Math.round(weather.current_weather?.temperature ?? 0),
      code: weather.current_weather?.weathercode ?? 0,
      isNight,
    }
  } catch {
    return null
  }
}