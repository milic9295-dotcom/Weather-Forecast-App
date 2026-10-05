import { useState, useEffect } from "react";

function SearchBar({ onSelect, onLocate }) {
  const [text, setText] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (text.trim().length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(text)}&count=5`
        );
        const data = await res.json();
        setResults(data.results || []);
      } catch {
        setResults([]);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [text]);

  function pick(p) {
    onSelect({ lat: p.latitude, lon: p.longitude, name: p.name, country: p.country || "" });
    setText("");
    setResults([]);
  }

  return (
    <div className="search-wrap">
      <div className="input-row">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && results[0] && pick(results[0])}
          placeholder="Search city..."
        />
        <button onClick={onLocate} title="My Location">📍</button>
      </div>

      {results.length > 0 && (
        <ul className="suggestions">
          {results.map((p) => (
            <li key={p.id} onClick={() => pick(p)}>
              {p.name}
              <small>{[p.admin1, p.country].filter(Boolean).join(", ")}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SearchBar;