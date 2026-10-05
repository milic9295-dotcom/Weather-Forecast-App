import { useMemo } from "react";

export function getScene(code) {
  if (code >= 95) return "storm";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "snow";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "rain";
  if (code === 45 || code === 48) return "fog";
  if (code === 2 || code === 3) return "cloudy";
  return "clear";
}

const rand = (a, b) => a + Math.random() * (b - a);

function WeatherBackground({ code, isDay, wind = 10 }) {
  const scene = getScene(code);
  const speed = 1 / (1 + wind / 25); // more wind = faster clouds

  const clouds = useMemo(
    () =>
      Array.from({ length: 8 }, () => ({
        top: rand(3, 60),
        width: rand(120, 260),
        duration: rand(50, 110),
        delay: -rand(0, 100),
        opacity: rand(0.55, 0.95),
      })),
    []
  );

  const drops = useMemo(
    () =>
      Array.from({ length: 130 }, () => ({
        left: rand(0, 110),
        delay: -rand(0, 2),
        duration: rand(0.45, 0.9),
        height: rand(14, 26),
      })),
    []
  );

  const flakes = useMemo(
    () =>
      Array.from({ length: 80 }, () => ({
        left: rand(0, 100),
        delay: -rand(0, 12),
        duration: rand(7, 14),
        size: rand(4, 10),
      })),
    []
  );

  const stars = useMemo(
    () =>
      Array.from({ length: 90 }, () => ({
        left: rand(0, 100),
        top: rand(0, 75),
        delay: rand(0, 4),
        size: rand(1, 3),
      })),
    []
  );

  const cloudCount = scene === "cloudy" ? 8 : scene === "clear" ? 2 : 5;
  const skyVisible = scene === "clear" || scene === "cloudy";

  return (
    <div className={`weather-bg ${scene} ${isDay ? "day" : "night"}`}>
      {skyVisible && (isDay ? <div className="sun" /> : <div className="moon" />)}

      {skyVisible &&
        !isDay &&
        stars.map((s, i) => (
          <span
            key={i}
            className="star-dot"
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: s.size,
              height: s.size,
              animationDelay: `${s.delay}s`,
            }}
          />
        ))}

      {scene === "clear" && !isDay && <span className="shooting-star" />}

      {clouds.slice(0, cloudCount).map((c, i) => (
        <div
          key={i}
          className="cloud"
          style={{
            top: `${c.top}%`,
            width: c.width,
            height: c.width * 0.28,
            opacity: c.opacity,
            animationDuration: `${c.duration * speed}s`,
            animationDelay: `${c.delay * speed}s`,
          }}
        />
      ))}

      {(scene === "rain" || scene === "storm") &&
        drops.map((d, i) => (
          <span
            key={i}
            className="drop"
            style={{
              left: `${d.left}%`,
              height: d.height,
              animationDelay: `${d.delay}s`,
              animationDuration: `${d.duration}s`,
            }}
          />
        ))}

      {scene === "snow" &&
        flakes.map((f, i) => (
          <span
            key={i}
            className="flake"
            style={{
              left: `${f.left}%`,
              width: f.size,
              height: f.size,
              animationDelay: `${f.delay}s`,
              animationDuration: `${f.duration}s`,
            }}
          />
        ))}

      {scene === "storm" && <div className="lightning" />}

      {scene === "fog" && (
        <>
          <div className="fog-layer f1" />
          <div className="fog-layer f2" />
          <div className="fog-layer f3" />
        </>
      )}
    </div>
  );
}

export default WeatherBackground;