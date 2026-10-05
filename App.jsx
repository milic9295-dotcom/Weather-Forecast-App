import { useState, useEffect } from "react";
import SearchBar from "./components/SearchBar";
import Hourly from "./components/Hourly";
import Forecast from "./components/Forecast";
import WeatherBackground from "./components/WeatherBackground";
import {
  getWeatherInfo, formatTemp, formatTime, aqiInfo, uvInfo,
  loadFromStorage, saveToStorage,
} from "./utils";
import "./App.css";

const DEFAULT_PLACE = { lat: 31.5497, lon: 74.3436, name: "Lahore", country: "Pakistan" };

// Ignore old/invalid saved entries (e.g. plain strings from the older version)
const validPlaces = (list) =>
  Array.isArray(list)
    ? list.filter((p) => p && typeof p === "object" && p.name && p.lat != null)
    : [];

function App() {
  const [place, setPlace] = useState(null);
  const [weather, setWeather] = useState(null);
  const [air, setAir] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [unit, setUnit] = useState(() => loadFromStorage("unit", "C"));
  const [recent, setRecent] = useState(() => validPlaces(loadFromStorage("recent", [])));
  const [favorites, setFavorites] = useState(() => validPlaces(loadFromStorage("favorites", [])));

  async function loadPlace(p, addToRecent = true) {
    setLoading(true);
    setError("");
    setPlace(p);

    const weatherUrl =
      `https://api.open-meteo.com/v1/forecast?latitude=${p.lat}&longitude=${p.lon}` +
      `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day,surface_pressure,visibility` +
      `&hourly=temperature_2m,weather_code,precipitation_probability` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max` +
      `&timezone=auto`;
    const airUrl =
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${p.lat}&longitude=${p.lon}&current=us_aqi,pm2_5`;

    try {
      const [wRes, aRes] = await Promise.all([fetch(weatherUrl), fetch(airUrl)]);
      if (!wRes.ok) throw new Error("weather failed");
      setWeather(await wRes.json());
      setAir(aRes.ok ? (await aRes.json()).current : null);

      if (addToRecent) {
        setRecent((prev) => {
          const updated = [p, ...prev.filter((r) => r.name !== p.name)].slice(0, 5);
          saveToStorage("recent", updated);
          return updated;
        });
        saveToStorage("lastPlace", p);
      }
    } catch {
      setError("Data load nahi ho saka. Internet check karein.");
    }
    setLoading(false);
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setError("Aapka browser location support nahi karta.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        loadPlace(
          { lat: pos.coords.latitude, lon: pos.coords.longitude, name: "My Location", country: "" },
          false
        ),
      () => setError("Location ki ijazat nahi mili.")
    );
  }

  function toggleUnit() {
    const next = unit === "C" ? "F" : "C";
    setUnit(next);
    saveToStorage("unit", next);
  }

  const isFav = place && favorites.some((f) => f.name === place.name);

  function toggleFavorite() {
    const updated = isFav
      ? favorites.filter((f) => f.name !== place.name)
      : [...favorites, place];
    setFavorites(updated);
    saveToStorage("favorites", updated);
  }

  function clearRecent() {
    setRecent([]);
    saveToStorage("recent", []);
  }

  useEffect(() => {
    const saved = loadFromStorage("lastPlace", DEFAULT_PLACE);
    loadPlace(saved && saved.lat != null ? saved : DEFAULT_PLACE);
  }, []);

  const cur = weather?.current;
  const isDay = cur ? cur.is_day === 1 : true;
  const info = cur ? getWeatherInfo(cur.weather_code, isDay) : null;

  return (
    <div className="app">
      {/* Full page animated scene */}
      <WeatherBackground
        code={cur ? cur.weather_code : 0}
        isDay={isDay}
        wind={cur ? cur.wind_speed_10m : 10}
      />

      <div className="container">
        <div className="top-bar">
          <h1>Weather Forecast</h1>
          <button onClick={toggleUnit}>°{unit}</button>
        </div>

        <SearchBar onSelect={loadPlace} onLocate={useMyLocation} />

        {favorites.length > 0 && (
          <div className="chips">
            {favorites.map((f) => (
              <button key={f.name} className="chip fav" onClick={() => loadPlace(f)}>
                ⭐ {f.name}
              </button>
            ))}
          </div>
        )}

        {recent.length > 0 && (
          <div className="chips">
            {recent.map((r) => (
              <button key={r.name} className="chip" onClick={() => loadPlace(r)}>
                {r.name}
              </button>
            ))}
            <button className="chip" onClick={clearRecent}>Clear</button>
          </div>
        )}

        {loading && <p className="status">Loading...</p>}
        {error && (
          <div className="status error">
            {error} <button onClick={() => loadPlace(place || DEFAULT_PLACE)}>Retry</button>
          </div>
        )}

        {weather && (
          <div className={loading ? "content dim" : "content"}>
            <div className="card main-card">
              <div className="place-row">
                <h2>
                  {place.name}
                  {place.country && `, ${place.country}`}
                </h2>
                <button className="star" onClick={toggleFavorite} title="Favorite">
                  {isFav ? "⭐" : "☆"}
                </button>
              </div>
              <p className="temp">{formatTemp(cur.temperature_2m, unit)}</p>
              <p className="desc">
                {info.icon} {info.text}
              </p>
              <small>
                H: {formatTemp(weather.daily.temperature_2m_max[0], unit)} &nbsp; L:{" "}
                {formatTemp(weather.daily.temperature_2m_min[0], unit)}
              </small>
            </div>

            <div className="card">
              <Hourly hourly={weather.hourly} nowTime={cur.time} unit={unit} />
            </div>

            <div className="card details">
              <div><small>Feels like</small><b>{formatTemp(cur.apparent_temperature, unit)}</b></div>
              <div><small>Humidity</small><b>{cur.relative_humidity_2m}%</b></div>
              <div><small>Wind</small><b>{cur.wind_speed_10m} km/h</b></div>
              <div><small>Pressure</small><b>{Math.round(cur.surface_pressure)} hPa</b></div>
              <div><small>Visibility</small><b>{(cur.visibility / 1000).toFixed(1)} km</b></div>
              <div>
                <small>UV Index</small>
                <b>{Math.round(weather.daily.uv_index_max[0])} ({uvInfo(weather.daily.uv_index_max[0])})</b>
              </div>
              <div><small>Sunrise</small><b>{formatTime(weather.daily.sunrise[0])}</b></div>
              <div><small>Sunset</small><b>{formatTime(weather.daily.sunset[0])}</b></div>
              <div>
                <small>Air Quality</small>
                <b>{air ? `${air.us_aqi} (${aqiInfo(air.us_aqi)})` : "N/A"}</b>
              </div>
            </div>

            <div className="card">
              <Forecast daily={weather.daily} unit={unit} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;