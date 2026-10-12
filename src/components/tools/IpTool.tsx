"use client";

import React, { useState } from "react";
import { Search, Globe, MapPin, Building, Server, ShieldCheck, ExternalLink, Loader2 } from "lucide-react";
import { IpResult } from "@/types/osint";

export default function IpTool() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IpResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = async (ipToSearch?: string) => {
    const target = ipToSearch !== undefined ? ipToSearch : query;
    setLoading(true);
    setError(null);

    try {
      const param = target ? `?ip=${encodeURIComponent(target)}` : "";
      const res = await fetch(`/api/ip${param}`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      setResult(data);
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || "Failed to query IP address");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur">
        <h2 className="text-xl font-bold text-sky-400 flex items-center gap-2">
          <Globe className="w-5 h-5" /> IP Geolocation & ASN Intelligence
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Trace any IPv4/IPv6 address to ISP, Autonomous System Number (ASN), coordinates, and geographic city.
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
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. 1.1.1.1, 8.8.8.8 or leave empty for your current IP"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 transition"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Lookup IP
          </button>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              handleLookup("");
            }}
            disabled={loading}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm px-4 py-2.5 rounded-lg transition"
          >
            My IP
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs p-4 rounded-xl font-mono">
          [!] Error: {error}
        </div>
      )}

      {/* Results Display */}
      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Main Info Card */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs uppercase text-slate-500 tracking-wider">Target IP</span>
                <div className="text-2xl font-mono font-bold text-sky-400">{result.ip}</div>
              </div>
              <span className="px-2.5 py-1 text-xs font-mono rounded bg-emerald-950/60 border border-emerald-800 text-emerald-400">
                ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/60">
                <span className="text-slate-500 block mb-1">Country</span>
                <div className="text-slate-200 font-semibold flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-sky-400" />
                  {result.country} {result.countryCode ? `(${result.countryCode})` : ""}
                </div>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/60">
                <span className="text-slate-500 block mb-1">City / Region</span>
                <div className="text-slate-200 font-semibold flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  {result.city}, {result.region}
                </div>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/60">
                <span className="text-slate-500 block mb-1">ISP / Organization</span>
                <div className="text-slate-200 font-semibold truncate flex items-center gap-1.5" title={result.org}>
                  <Building className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">{result.org}</span>
                </div>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/60">
                <span className="text-slate-500 block mb-1">ASN / Route</span>
                <div className="text-slate-200 font-semibold truncate flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span className="truncate">{result.asn || "N/A"}</span>
                </div>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/60">
                <span className="text-slate-500 block mb-1">Coordinates</span>
                <div className="text-slate-200">{result.loc}</div>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/60">
                <span className="text-slate-500 block mb-1">Timezone / Postal</span>
                <div className="text-slate-200">{result.timezone} ({result.postal})</div>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-2">
              <a
                href={`https://www.google.com/maps?q=${encodeURIComponent(result.loc)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-sky-400 px-3 py-1.5 rounded border border-slate-700 transition"
              >
                Google Maps <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href={`https://www.virustotal.com/gui/ip-address/${result.ip}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-amber-400 px-3 py-1.5 rounded border border-slate-700 transition"
              >
                VirusTotal IP <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href={`https://bgp.he.net/ip/${result.ip}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-purple-400 px-3 py-1.5 rounded border border-slate-700 transition"
              >
                Hurricane Electric BGP <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Map Preview or Coordinates Panel */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Geolocation Coordinates
                </h3>
                <span className="text-[11px] font-mono text-slate-500">{result.loc}</span>
              </div>

              {result.lat && result.lon ? (
                <div className="mt-4 rounded-lg overflow-hidden border border-slate-800 bg-slate-950 aspect-video flex items-center justify-center relative">
                  <iframe
                    title="Map Preview"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${result.lon - 0.05}%2C${result.lat - 0.03}%2C${result.lon + 0.05}%2C${result.lat + 0.03}&layer=mapnik&marker=${result.lat}%2C${result.lon}`}
                    className="opacity-80 contrast-125 filter"
                  />
                </div>
              ) : (
                <div className="mt-8 text-center text-xs text-slate-500 p-8 border border-dashed border-slate-800 rounded-lg">
                  No GPS coordinates available for embedded map
                </div>
              )}
            </div>

            <div className="mt-4 p-3 bg-slate-950/50 rounded-lg border border-slate-800 text-[11px] text-slate-400">
              <span className="text-sky-400 font-mono">Edge Note:</span> LittleBrother queries geolocation databases and integrates with Cloudflare edge headers for instant edge-based resolution.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
