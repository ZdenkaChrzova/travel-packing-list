export const WEATHER_CACHE_MAX_AGE = 3 * 60 * 60 * 1000;

export const weatherLabel = code => {
  if (code === 0) return "Jasno";
  if ([1, 2].includes(code)) return "Polojasno";
  if (code === 3) return "Zataženo";
  if ([45, 48].includes(code)) return "Mlha";
  if ([51, 53, 55, 56, 57].includes(code)) return "Mrholení";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "Déšť";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Sněžení";
  if ([95, 96, 99].includes(code)) return "Bouřky";
  return "Proměnlivo";
};

export const weatherEmoji = code => {
  if (code === 0) return "☀️";
  if ([1, 2].includes(code)) return "🌤️";
  if (code === 3) return "☁️";
  if ([45, 48].includes(code)) return "🌫️";
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "🌧️";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "🌨️";
  if ([95, 96, 99].includes(code)) return "⛈️";
  return "🌥️";
};

export const windDirection = degrees => {
  const names = ["S", "SV", "V", "JV", "J", "JZ", "Z", "SZ"];
  return names[Math.round((Number(degrees) || 0) / 45) % 8];
};

export function packingAdvice(weather) {
  const tips = [];
  const current = weather?.current || {};
  const daily = weather?.daily || {};
  const max = Math.max(...(daily.temperature_2m_max || [current.temperature_2m || 0]));
  const min = Math.min(...(daily.temperature_2m_min || [current.temperature_2m || 0]));
  const rain = Math.max(...(daily.precipitation_probability_max || [0]));
  const uv = Math.max(...(daily.uv_index_max || [0]));
  const wind = Math.max(...(daily.wind_speed_10m_max || [current.wind_speed_10m || 0]));
  if (uv >= 6) tips.push("opalovací krém a pokrývku hlavy");
  if (rain >= 40) tips.push("lehkou nepromokavou vrstvu");
  if (min <= 12) tips.push("teplejší vrstvu na chladnější část dne");
  if (max >= 27) tips.push("lehké a prodyšné oblečení");
  if (wind >= 35) tips.push("vrstvu odolnou proti větru");
  return tips.length
    ? `Podle předpovědi přibalte ${tips.join(", ")}.`
    : "Předpověď nevyžaduje žádné zvláštní doplnění balicího seznamu.";
}

export async function searchLocations(query, signal) {
  const params = new URLSearchParams({ name: query, count: "7", language: "cs", format: "json" });
  const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`, { signal });
  if (!response.ok) throw new Error("Vyhledávání destinace není dostupné.");
  const data = await response.json();
  return data.results || [];
}

export async function fetchWeather(location, signal) {
  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    timezone: location.timezone || "auto",
    forecast_days: "7",
    current: "temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,is_day",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,uv_index_max",
  });
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { signal });
  if (!response.ok) throw new Error("Předpověď počasí není dostupná.");
  return response.json();
}
