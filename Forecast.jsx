import { getWeatherInfo, formatTemp } from "../utils";

function Forecast({ daily, unit }) {
  return (
    <div className="forecast">
      <h3>7-Day Forecast</h3>
      {daily.time.map((date, i) => {
        const info = getWeatherInfo(daily.weather_code[i]);
        const day =
          i === 0
            ? "Today"
            : new Date(date).toLocaleDateString("en-US", { weekday: "short" });

        return (
          <div className="forecast-row" key={date}>
            <span className="f-day">{day}</span>
            <span className="f-icon" title={info.text}>{info.icon}</span>
            <small className="f-rain">💧{daily.precipitation_probability_max[i]}%</small>
            <span className="f-temp">
              {formatTemp(daily.temperature_2m_max[i], unit)} /{" "}
              <small>{formatTemp(daily.temperature_2m_min[i], unit)}</small>
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default Forecast;