export function getWeatherInfo(code, isDay = true) {
  if (code === 0) return isDay ? { text: "Clear sky", icon: "☀️" } : { text: "Clear night", icon: "🌙" };
  if (code <= 3) return isDay ? { text: "Partly cloudy", icon: "⛅" } : { text: "Partly cloudy", icon: "☁️" };
  if (code <= 48) return { text: "Foggy", icon: "🌫️" };
  if (code <= 57) return { text: "Drizzle", icon: "🌦️" };
  if (code <= 67) return { text: "Rainy", icon: "🌧️" };
  if (code <= 77) return { text: "Snow", icon: "❄️" };
  if (code <= 82) return { text: "Rain showers", icon: "🌦️" };
  if (code <= 86) return { text: "Snow showers", icon: "🌨️" };
  return { text: "Thunderstorm", icon: "⛈️" };
}

export function formatTemp(c, unit) {
  return unit === "C" ? `${Math.round(c)}°C` : `${Math.round((c * 9) / 5 + 32)}°F`;
}

export function formatTime(iso) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function formatHour(iso) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric" });
}

export function aqiInfo(aqi) {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for sensitive";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very unhealthy";
  return "Hazardous";
}

export function uvInfo(uv) {
  if (uv < 3) return "Low";
  if (uv < 6) return "Moderate";
  if (uv < 8) return "High";
  if (uv < 11) return "Very high";
  return "Extreme";
}

export function loadFromStorage(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

export function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}