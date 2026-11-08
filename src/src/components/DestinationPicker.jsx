import React, { useEffect, useRef, useState } from "react";
import { Check, LoaderCircle, MapPin, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { searchLocations } from "@/lib/weather";

const locationTitle = item => [item.name, item.admin1, item.country].filter(Boolean).join(", ");

export function DestinationPicker({ trip, onUpdate }) {
  const [query, setQuery] = useState(trip.destination || "");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => setQuery(trip.destination || ""), [trip.id, trip.destination]);
  useEffect(() => {
    const close = event => { if (!wrapperRef.current?.contains(event.target)) setOpen(false); };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);
  useEffect(() => {
    const text = query.trim();
    if (text.length < 2 || text === trip.destination && trip.destinationLocation) {
      setResults([]); setLoading(false); setError(""); return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true); setError("");
      try { setResults(await searchLocations(text, controller.signal)); setOpen(true); }
      catch (err) { if (err.name !== "AbortError") setError(err.message); }
      finally { setLoading(false); }
    }, 350);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [query, trip.destination, trip.destinationLocation]);

  const choose = item => {
    const destination = locationTitle(item);
    onUpdate({
      destination,
      destinationLocation: {
        id: item.id,
        name: item.name,
        admin1: item.admin1 || "",
        country: item.country || "",
        countryCode: item.country_code || "",
        latitude: item.latitude,
        longitude: item.longitude,
        timezone: item.timezone || "auto",
      },
      weatherCache: null,
    });
    setQuery(destination); setResults([]); setOpen(false);
  };

  const clearLocation = () => {
    setQuery(""); setResults([]); setOpen(false);
    onUpdate({ destination: "", destinationLocation: null, weatherCache: null });
  };

  return <div ref={wrapperRef} className="relative">
    <div className="relative">
      <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-600" />
      <Input
        value={query}
        onFocus={() => results.length && setOpen(true)}
        onChange={event => {
          const value = event.target.value;
          setQuery(value);
          onUpdate({ destination: value, destinationLocation: null, weatherCache: null });
        }}
        placeholder="Začněte psát město nebo oblast…"
        className="pl-10 pr-16"
        autoComplete="off"
      />
      <span className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
        {loading && <LoaderCircle className="h-4 w-4 animate-spin text-sky-600" />}
        {query && <button type="button" onClick={clearLocation} aria-label="Vymazat destinaci" className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X className="h-4 w-4" /></button>}
      </span>
    </div>
    {trip.destinationLocation && <p className="mt-2 flex items-center gap-1 text-xs font-medium text-emerald-700"><Check className="h-3.5 w-3.5" />Vybraná přesná lokalita · {trip.destinationLocation.latitude.toFixed(3)}, {trip.destinationLocation.longitude.toFixed(3)}</p>}
    {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
    {open && <div className="absolute z-40 mt-2 max-h-72 w-full overflow-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
      {results.length ? results.map(item => <button key={`${item.id}-${item.latitude}`} type="button" onClick={() => choose(item)} className="flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left hover:bg-sky-50">
        <span className="mt-0.5 rounded-full bg-sky-100 p-2 text-sky-700"><MapPin className="h-4 w-4" /></span>
        <span><strong className="block text-sm text-slate-900">{item.name}</strong><span className="text-xs text-slate-500">{[item.admin1, item.country].filter(Boolean).join(", ")}</span></span>
      </button>) : !loading && <p className="p-4 text-center text-sm text-slate-500">Žádná odpovídající destinace.</p>}
    </div>}
  </div>;
}
