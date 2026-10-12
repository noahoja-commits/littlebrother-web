"use client";

import React, { useState } from "react";
import { User, Search, ExternalLink, Loader2, CheckCircle2, SearchCode } from "lucide-react";
import { UsernameResult } from "@/types/osint";

export default function UsernameTool() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UsernameResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async () => {
    if (!username.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/username?username=${encodeURIComponent(username.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to scan username");
      setResult(data);
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || "Failed to scan username");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur">
        <h2 className="text-xl font-bold text-sky-400 flex items-center gap-2">
          <User className="w-5 h-5" /> Username OSINT & Social Footprint Recon
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Scan usernames across top platforms (GitHub, X/Twitter, Instagram, Reddit, LinkedIn, Telegram, etc.) and generate targeted Google Dorks.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleScan();
          }}
          className="mt-4 flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. torvalds or target_handle"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !username.trim()}
            className="bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 transition"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Scan Username
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs p-4 rounded-xl font-mono">
          [!] Error: {error}
        </div>
      )}

      {result && (
        <div className="space-y-6">
          {/* Target Title */}
          <div className="flex items-center justify-between bg-slate-900/70 border border-slate-800 p-4 rounded-xl">
            <div>
              <span className="text-xs uppercase text-slate-500 font-mono">Target Handle</span>
              <div className="text-xl font-mono font-bold text-sky-400">@{result.username}</div>
            </div>
            <span className="px-3 py-1 rounded bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300">
              {result.profiles.length} Platforms Targeted
            </span>
          </div>

          {/* Social Platforms Grid */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Platform Direct Profiles
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {result.profiles.map((p, idx) => (
                <a
                  key={idx}
                  href={p.url}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-slate-950/80 hover:bg-slate-900 border border-slate-800/80 hover:border-sky-600/50 p-3 rounded-lg flex flex-col justify-between transition group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-slate-200 group-hover:text-sky-400 transition">
                      {p.platform}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-600 group-hover:text-sky-400 transition" />
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 truncate">
                    {p.url.replace("https://", "")}
                  </div>
                  {p.details && (
                    <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-emerald-400 font-mono">
                      ✓ Confirmed Active Profile
                    </div>
                  )}
                </a>
              ))}
            </div>
          </div>

          {/* Google Dorks section */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
              <SearchCode className="w-4 h-4 text-amber-400" /> Automated Google Dorks for @{result.username}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Click each dork to launch tailored search operators across pastes, deep web indexed pages, and forums.
            </p>

            <div className="space-y-2.5 font-mono text-xs">
              {result.googleDorks.map((dork, i) => (
                <div key={i} className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between gap-3">
                  <div className="truncate flex-1">
                    <span className="text-amber-400 font-semibold block text-[11px]">{dork.name}</span>
                    <span className="text-slate-300 text-xs truncate block">{dork.query}</span>
                  </div>
                  <a
                    href={dork.url}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 bg-slate-800 hover:bg-slate-700 text-sky-400 px-3 py-1.5 rounded border border-slate-700 text-xs flex items-center gap-1.5 transition"
                  >
                    Execute Search <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
