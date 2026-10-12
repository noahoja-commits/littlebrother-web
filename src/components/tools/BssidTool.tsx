"use client";

import React, { useState } from "react";
import { Wifi, Search, MapPin, ExternalLink, Loader2, Info } from "lucide-react";
import { BssidResult } from "@/types/osint";

export default function BssidTool() {
  const [bssid, setBssid] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BssidResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = async () => {
    if (!bssid.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/bssid?bssid=${encodeURIComponent(bssid.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Lookup failed");
      }
      setResult(data);
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || "Failed to query BSSID");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur">
        <h2 className="text-xl font-bold text-sky-400 flex items-center gap-2">
          <Wifi className="w-5 h-5" /> BSSID / Wi-Fi Geolocation
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Resolve wireless access point MAC addresses (BSSID) into physical GPS coordinates using global beacon datasets.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLookup();
          }}
          className="mt-4 flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={bssid}
              onChange={(e) => setBssid(e.target.value)}
              placeholder="e.g. 00:14:22:01:23:45 or 84:D4:7E:..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !bssid.trim()}
            className="bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 transition"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Locate BSSID
          </button>
        </form>

        <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500">
          <Info className="w-3.5 h-3.5" />
          <span>Supports standard MAC formats: XX:XX:XX:XX:XX:XX or XXXXXXXXXXXX</span>
        </div>
      </div>

      {error && (
        <div className="bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs p-4 rounded-xl font-mono">
          [!] Error: {error}
        </div>
      )}

      {result && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-xs uppercase text-slate-500">Access Point BSSID</span>
              <div className="text-xl font-mono font-bold text-sky-400">{result.bssid}</div>
            </div>
            {result.lat ? (
              <span className="px-2.5 py-1 text-xs font-mono rounded bg-emerald-950/60 border border-emerald-800 text-emerald-400">
                COORDINATES FOUND
              </span>
            ) : (
              <span className="px-2.5 py-1 text-xs font-mono rounded bg-amber-950/60 border border-amber-800 text-amber-400">
                OSINT INTEL READY
              </span>
            )}
          </div>

          {result.lat && result.lon ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3 font-mono text-xs">
                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block mb-1">Estimated Coordinates</span>
                  <div className="text-emerald-400 font-bold text-sm">
                    {result.lat}, {result.lon}
                  </div>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block mb-1">Signal Precision Radius</span>
                  <div className="text-slate-300">~{result.range || 50} meters</div>
                </div>

                <div className="pt-2 flex flex-wrap gap-2">
                  {result.mapsUrl && (
                    <a
                      href={result.mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs bg-sky-700/40 hover:bg-sky-600/60 text-sky-300 px-3 py-1.5 rounded border border-sky-600 transition"
                    >
                      <MapPin className="w-3.5 h-3.5" /> View on Google Maps
                    </a>
                  )}
                  {result.wigleSearchUrl && (
                    <a
                      href={result.wigleSearchUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-purple-300 px-3 py-1.5 rounded border border-slate-700 transition"
                    >
                      WiGLE Wireless Database <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              <div className="rounded-lg overflow-hidden border border-slate-800 bg-slate-950 aspect-video">
                <iframe
                  title="Wi-Fi Map"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${result.lon - 0.02}%2C${result.lat - 0.01}%2C${result.lon + 0.02}%2C${result.lat + 0.01}&layer=mapnik&marker=${result.lat}%2C${result.lon}`}
                  className="opacity-80 contrast-125 filter"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-slate-400 font-mono leading-relaxed">
                {result.message}
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href={`https://wigle.net/search?netid=${encodeURIComponent(result.bssid)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-sky-400 px-3 py-2 rounded-lg border border-slate-700 font-mono transition"
                >
                  Search on WiGLE.net <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <a
                  href={`https://maclookup.app/search/${encodeURIComponent(result.bssid)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-amber-400 px-3 py-2 rounded-lg border border-slate-700 font-mono transition"
                >
                  Lookup Hardware Vendor (OUI) <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
