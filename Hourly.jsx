import { getWeatherInfo, formatTemp, formatHour } from "../utils";

function Hourly({ hourly, nowTime, unit }) {
  const start = Math.max(
    0,
    hourly.time.findIndex((t) => t >= nowTime.slice(0, 13) + ":00")
  );
  const hours = hourly.time.slice(start, start + 24);

  return (
    <div>
      <h3>Next 24 Hours</h3>
      <div className="hourly">
        {hours.map((t, k) => {
          const i = start + k;
          return (
            <div className="hour" key={t}>
              <small>{k === 0 ? "Now" : formatHour(t)}</small>
              <span className="h-icon">{getWeatherInfo(hourly.weather_code[i]).icon}</span>
              <b>{formatTemp(hourly.temperature_2m[i], unit)}</b>
              <small>💧{hourly.precipitation_probability[i]}%</small>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Hourly;