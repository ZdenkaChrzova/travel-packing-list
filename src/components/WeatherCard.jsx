import React, { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Clock3,
  CloudSun,
  Droplets,
  LoaderCircle,
  RefreshCw,
  Sun,
  Thermometer,
  Wind,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  fetchWeather,
  packingAdvice,
  weatherEmoji,
  weatherLabel,
  WEATHER_CACHE_MAX_AGE,
  windDirection,
} from "@/lib/weather";


const day = value =>
  new Intl.DateTimeFormat("cs-CZ", {
    weekday: "short",
  }).format(new Date(`${value}T12:00:00`));

const date = value =>
  new Intl.DateTimeFormat("cs-CZ", {
    day: "numeric",
    month: "numeric",
  }).format(new Date(`${value}T12:00:00`));

const formatTime = (value, timeZone) =>
  new Intl.DateTimeFormat("cs-CZ", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(value);

const timeZoneOffsetMinutes = (value, timeZone) => {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(value)
      .filter(part => part.type !== "literal")
      .map(part => [part.type, part.value])
  );

  const localTimeAsUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second)
  );

  return Math.round((localTimeAsUtc - value.getTime()) / 60000);
};

const differenceText = (minutes, destinationName, homeName) => {
  if (minutes === 0) {
    return `${destinationName}: stejný čas jako ${homeName}`;
  }

  const absoluteMinutes = Math.abs(minutes);
  const hours = Math.floor(absoluteMinutes / 60);
  const remainingMinutes = absoluteMinutes % 60;
  const parts = [];

  if (hours) {
    const hourWord =
      hours === 1
        ? "hodinu"
        : hours >= 2 && hours <= 4
          ? "hodiny"
          : "hodin";

    parts.push(`${hours} ${hourWord}`);
  }

  if (remainingMinutes) {
    const minuteWord =
      remainingMinutes === 1
        ? "minutu"
        : remainingMinutes >= 2 && remainingMinutes <= 4
          ? "minuty"
          : "minut";

    parts.push(`${remainingMinutes} ${minuteWord}`);
  }

  const direction = minutes > 0 ? "více" : "méně";

  return `${destinationName}: o ${parts.join(" ")} ${direction} než ${homeName}`;
};

export function WeatherCard({ trip, onUpdate, homeLocation }) {
  const location = trip.destinationLocation;
  const cached = trip.weatherCache;

  const [weather, setWeather] = useState(cached?.data || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [now, setNow] = useState(() => new Date());

  const timeZone =
    location?.timezone && location.timezone !== "auto"
      ? location.timezone
      : weather?.timezone;

  let destinationTime = "";
  let pragueTime = "";
  let timeDifference = "";

  if (timeZone) {
    try {
      destinationTime = formatTime(now, timeZone);
      pragueTime = formatTime(now, HOME_TIME_ZONE);

      const destinationOffset = timeZoneOffsetMinutes(now, timeZone);
      const pragueOffset = timeZoneOffsetMinutes(now, HOME_TIME_ZONE);

      timeDifference = differenceText(
        destinationOffset - pragueOffset,
        location.name
      );
    } catch {
      destinationTime = "";
      pragueTime = "";
      timeDifference = "";
    }
  }

  const load = async (force = false) => {
    if (!location) {
      return;
    }

    const fresh =
      cached?.data &&
      Date.now() - new Date(cached.updatedAt).getTime() <
        WEATHER_CACHE_MAX_AGE;

    if (!force && fresh) {
      setWeather(cached.data);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await fetchWeather(location);
      const updatedAt = new Date().toISOString();

      setWeather(data);

      onUpdate({
        weatherCache: {
          updatedAt,
          locationKey: `${location.latitude},${location.longitude}`,
          data,
        },
      });
    } catch (error) {
      if (cached?.data) {
        setWeather(cached.data);
        setError(
          "Bez připojení zobrazujeme poslední uloženou předpověď."
        );
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setWeather(cached?.data || null);
    load(false);
  }, [location?.latitude, location?.longitude]);

  useEffect(() => {
    setNow(new Date());

    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 30000);

    return () => {
      window.clearInterval(timer);
    };
  }, [timeZone]);

  const days = useMemo(
    () =>
      weather?.daily?.time?.map((value, index) => ({
        date: value,
        code: weather.daily.weather_code[index],
        max: Math.round(weather.daily.temperature_2m_max[index]),
        min: Math.round(weather.daily.temperature_2m_min[index]),
        rain: Math.round(
          weather.daily.precipitation_probability_max[index] || 0
        ),
        uv: weather.daily.uv_index_max[index],
      })) || [],
    [weather]
  );

  if (!location) {
    return (
      <section className="rounded-3xl border border-dashed border-sky-300 bg-sky-50 p-5 text-center text-sky-800">
        <CloudSun className="mx-auto mb-2 h-8 w-8" />

        <p className="font-semibold">
          Vyberte přesnou destinaci
        </p>

        <p className="mt-1 text-sm">
          Po výběru města se zde zobrazí počasí.
        </p>
      </section>
    );
  }

  if (loading && !weather) {
    return (
      <section className="flex items-center justify-center gap-3 rounded-3xl bg-white p-8 shadow-sm">
        <LoaderCircle className="h-5 w-5 animate-spin text-sky-600" />
        Načítám počasí…
      </section>
    );
  }

  if (!weather) {
    return (
      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <p className="text-sm text-rose-700">
          {error || "Předpověď není dostupná."}
        </p>

        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => load(true)}
        >
          Zkusit znovu
        </Button>
      </section>
    );
  }

  const current = weather.current;
  const uv = days[0]?.uv || 0;

  return (
    <section className="overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-slate-200">
      <button
        type="button"
        onClick={() => setExpanded(value => !value)}
        className="flex w-full items-center justify-between gap-3 p-5 text-left"
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="text-4xl">
            {weatherEmoji(current.weather_code)}
          </span>

          <span className="min-w-0">
            <strong className="block text-lg">
              {location.name}, {location.country}
            </strong>

            {destinationTime && (
              <span className="mt-0.5 block text-sm font-medium text-sky-700">
                <span className="flex flex-wrap items-center gap-x-1 gap-y-0.5">
                  <Clock3 className="h-4 w-4 shrink-0" />

                  <span>
                    {location.name} {destinationTime}
                  </span>

                  <span aria-hidden="true">·</span>

                  <span>
                    Praha {pragueTime}
                  </span>
                </span>

                <span className="block text-xs font-normal text-slate-500">
                  {timeDifference}
                </span>
              </span>
            )}

            <span className="block text-sm text-slate-500">
              {Math.round(current.temperature_2m)} °C ·{" "}
              {weatherLabel(current.weather_code)}
            </span>
          </span>
        </span>

        {expanded ? (
          <ChevronUp className="h-5 w-5 shrink-0 text-sky-700" />
        ) : (
          <ChevronDown className="h-5 w-5 shrink-0 text-sky-700" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-slate-100 p-5">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-4xl font-black">
                {Math.round(current.temperature_2m)} °C
              </p>

              <p>
                {weatherLabel(current.weather_code)}
              </p>
            </div>

            <div className="space-y-2 text-sm">
              <p className="flex gap-2">
                <Thermometer className="h-4 w-4" />
                Pocitově{" "}
                {Math.round(current.apparent_temperature)} °C
              </p>

              <p className="flex gap-2">
                <Droplets className="h-4 w-4" />
                Srážky {current.precipitation || 0} mm
              </p>

              <p className="flex gap-2">
                <Wind className="h-4 w-4" />
                Vítr {Math.round(current.wind_speed_10m)} km/h{" "}
                {windDirection(current.wind_direction_10m)}
              </p>
            </div>

            <div className="rounded-2xl bg-rose-50 p-4 text-rose-800">
              <Sun className="h-5 w-5" />

              <p>UV index</p>

              <strong className="text-3xl">
                {Math.round(uv)}
              </strong>
            </div>
          </div>

          <h3 className="mb-3 mt-5 font-bold">
            Předpověď na nejbližší dny
          </h3>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
            {days.map((item, index) => (
              <div
                key={item.date}
                className={`rounded-2xl p-3 text-center ${
                  index === 0
                    ? "bg-sky-700 text-white"
                    : "bg-slate-50"
                }`}
              >
                <strong>
                  {index === 0 ? "Dnes" : day(item.date)}
                </strong>

                <p className="text-xs">
                  {date(item.date)}
                </p>

                <p className="my-2 text-2xl">
                  {weatherEmoji(item.code)}
                </p>

                <p className="font-bold">
                  {item.max}° / {item.min}°
                </p>

                <p className="text-xs">
                  💧 {item.rain} %
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl bg-emerald-50 p-4 text-emerald-900">
            <strong>
              Doporučení pro balení
            </strong>

            <p className="mt-1 text-sm">
              {packingAdvice(weather)}
            </p>
          </div>

          <div className="mt-4 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => load(true)}
              disabled={loading}
            >
              <RefreshCw
                className={`mr-1 h-4 w-4 ${
                  loading ? "animate-spin" : ""
                }`}
              />

              Aktualizovat
            </Button>
          </div>

          {error && (
            <p className="text-xs text-amber-700">
              {error}
            </p>
          )}
        </div>
      )}
    </section>
  );
}