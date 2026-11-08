import React, { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronDown, ChevronUp, CloudSun, Droplets, LoaderCircle, MapPin, RefreshCw, Sun, Thermometer, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchWeather, packingAdvice, weatherEmoji, weatherLabel, WEATHER_CACHE_MAX_AGE, windDirection } from "@/lib/weather";

const czDay = value => new Intl.DateTimeFormat("cs-CZ", { weekday: "short" }).format(new Date(`${value}T12:00:00`));
const shortDate = value => new Intl.DateTimeFormat("cs-CZ", { day: "numeric", month: "numeric" }).format(new Date(`${value}T12:00:00`));
const updatedLabel = value => value ? new Intl.DateTimeFormat("cs-CZ", { day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value)) : "";

export function WeatherCard({ trip, onUpdate }) {
  const location = trip.destinationLocation;
  const cached = trip.weatherCache;
  const [weather, setWeather] = useState(cached?.data || null);
  const [updatedAt, setUpdatedAt] = useState(cached?.updatedAt || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false);

  const load = async (force = false) => {
    if (!location) return;
    const fresh = cached?.data && Date.now() - new Date(cached.updatedAt).getTime() < WEATHER_CACHE_MAX_AGE;
    if (!force && fresh) { setWeather(cached.data); setUpdatedAt(cached.updatedAt); return; }
    const controller = new AbortController();
    setLoading(true); setError("");
    try {
      const data = await fetchWeather(location, controller.signal);
      const timestamp = new Date().toISOString();
      setWeather(data); setUpdatedAt(timestamp);
      onUpdate({ weatherCache: { updatedAt: timestamp, locationKey: `${location.latitude},${location.longitude}`, data } });
    } catch (err) {
      if (cached?.data) { setWeather(cached.data); setUpdatedAt(cached.updatedAt); setError("Bez připojení zobrazujeme poslední uloženou předpověď."); }
      else setError(err.message || "Počasí se nepodařilo načíst.");
    } finally { setLoading(false); }
    return () => controller.abort();
  };

  useEffect(() => { setWeather(cached?.data || null); setUpdatedAt(cached?.updatedAt || ""); load(false); }, [location?.latitude, location?.longitude]);
  const days = useMemo(() => weather?.daily?.time?.map((date, index) => ({ date, code: weather.daily.weather_code[index], max: Math.round(weather.daily.temperature_2m_max[index]), min: Math.round(weather.daily.temperature_2m_min[index]), rain: Math.round(weather.daily.precipitation_probability_max[index] || 0), uv: weather.daily.uv_index_max[index] })) || [], [weather]);

  if (!location) return <section className="rounded-3xl border border-dashed border-sky-300 bg-sky-50 p-5 text-center text-sky-800"><CloudSun className="mx-auto mb-2 h-8 w-8" /><p className="font-semibold">Vyberte přesnou destinaci</p><p className="mt-1 text-sm text-sky-700">Po výběru města se zde automaticky zobrazí počasí.</p></section>;
  if (loading && !weather) return <section className="flex items-center justify-center gap-3 rounded-3xl bg-white p-8 shadow-sm"><LoaderCircle className="h-5 w-5 animate-spin text-sky-600" />Načítám počasí…</section>;
  if (!weather) return <section className="rounded-3xl bg-white p-5 shadow-sm"><p className="text-sm text-rose-700">{error || "Předpověď není dostupná."}</p><Button variant="outline" size="sm" className="mt-3" onClick={() => load(true)}>Zkusit znovu</Button></section>;

  const current = weather.current;
  const today = days[0];
  const uv = today?.uv ?? 0;
  return <section className="overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-slate-200">
    <button type="button" onClick={() => setExpanded(value => !value)} className="flex w-full items-center justify-between gap-3 p-5 text-left">
      <span className="flex min-w-0 items-center gap-3"><span className="text-4xl">{weatherEmoji(current.weather_code)}</span><span className="min-w-0"><strong className="block truncate text-lg">{location.name}, {location.country}</strong><span className="text-sm text-slate-500">{Math.round(current.temperature_2m)} °C · {weatherLabel(current.weather_code)}</span></span></span>
      <span className="flex items-center gap-2 text-sky-700"><span className="hidden text-xs font-semibold sm:inline">{expanded ? "Skrýt" : "Podrobnosti"}</span>{expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}</span>
    </button>
    {expanded && <div className="border-t border-slate-100 p-5">
      <div className="grid gap-4 md:grid-cols-[1.2fr_1fr_180px]">
        <div className="flex items-center gap-4"><span className="text-6xl">{weatherEmoji(current.weather_code)}</span><div><p className="text-sm text-slate-500">Aktuálně</p><p className="text-4xl font-black text-slate-900">{Math.round(current.temperature_2m)} °C</p><p className="text-slate-600">{weatherLabel(current.weather_code)}</p></div></div>
        <div className="grid gap-2 border-slate-200 text-sm md:border-l md:pl-5"><p className="flex items-center gap-2"><Thermometer className="h-4 w-4 text-rose-500" />Pocitově <strong>{Math.round(current.apparent_temperature)} °C</strong></p><p className="flex items-center gap-2"><Droplets className="h-4 w-4 text-sky-500" />Srážky <strong>{current.precipitation || 0} mm</strong></p><p className="flex items-center gap-2"><Wind className="h-4 w-4 text-teal-600" />Vítr <strong>{Math.round(current.wind_speed_10m)} km/h {windDirection(current.wind_direction_10m)}</strong></p></div>
        <div className="rounded-2xl bg-rose-50 p-4 text-rose-800"><Sun className="mb-1 h-6 w-6" /><p className="text-sm">UV index</p><p className="text-3xl font-black">{Math.round(uv)}</p><p className="text-xs font-semibold">{uv >= 8 ? "Velmi vysoký" : uv >= 6 ? "Vysoký" : uv >= 3 ? "Střední" : "Nízký"}</p></div>
      </div>
      <div className="mt-5 border-t border-slate-100 pt-5"><h3 className="mb-3 font-bold">Předpověď na nejbližší dny</h3><div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">{days.map((day, index) => <div key={day.date} className={`rounded-2xl p-3 text-center ${index === 0 ? "bg-sky-700 text-white" : "bg-slate-50 text-slate-800"}`}><p className="font-bold">{index === 0 ? "Dnes" : czDay(day.date)}</p><p className={`text-xs ${index === 0 ? "text-sky-100" : "text-slate-500"}`}>{shortDate(day.date)}</p><p className="my-2 text-2xl">{weatherEmoji(day.code)}</p><p className="font-bold">{day.max}° / {day.min}°</p><p className="mt-1 text-xs">💧 {day.rain} %</p></div>)}</div></div>
      <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4"><strong className="text-emerald-800">Doporučení pro balení</strong><p className="mt-1 text-sm text-emerald-900">{packingAdvice(weather)}</p></div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500"><span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />Aktualizováno {updatedLabel(updatedAt)}</span><Button variant="ghost" size="sm" onClick={() => load(true)} disabled={loading}><RefreshCw className={`mr-1 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />Aktualizovat</Button></div>
      {error && <p className="mt-2 text-xs text-amber-700">{error}</p>}
    </div>}
  </section>;
}
