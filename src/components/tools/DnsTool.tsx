"use client";

import React, { useState } from "react";
import { Network, Search, Loader2 } from "lucide-react";
import { DnsResult } from "@/types/osint";

export default function DnsTool() {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DnsResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = async () => {
    if (!domain.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/dns?domain=${encodeURIComponent(domain.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lookup failed");
      setResult(data);
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || "DNS query failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur">
        <h2 className="text-xl font-bold text-sky-400 flex items-center gap-2">
          <Network className="w-5 h-5" /> Cloudflare 1.1.1.1 DNS over HTTPS (DoH) Recon
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Perform zero-leak recursive DNS queries over Cloudflare&apos;s encrypted 1.1.1.1 JSON API for A, AAAA, MX, TXT, NS, and SOA records.
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
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="e.g. cloudflare.com, github.com or target domain"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !domain.trim()}
            className="bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 transition"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Resolve Records
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs p-4 rounded-xl font-mono">
          [!] Error: {error}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900/70 border border-slate-800 p-4 rounded-xl">
            <div>
              <span className="text-xs uppercase text-slate-500 font-mono">Target Domain</span>
              <div className="text-xl font-mono font-bold text-sky-400">{result.domain}</div>
            </div>
            <span className="px-3 py-1 rounded bg-sky-950/60 border border-sky-800 text-xs font-mono text-sky-300">
              {result.resolver}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(result.records).map(([type, answers]) => (
              <div key={type} className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
                  <span className="text-xs font-mono font-bold text-sky-400">{type} Records</span>
                  <span className="text-[11px] font-mono text-slate-500">{answers.length} found</span>
                </div>

                {answers.length > 0 ? (
                  <div className="space-y-2 font-mono text-xs">
                    {answers.map((ans, idx) => (
                      <div key={idx} className="bg-slate-950 p-2.5 rounded border border-slate-800/80">
                        <div className="text-slate-200 break-all">{ans.data}</div>
                        <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
                          <span>TTL: {ans.TTL}s</span>
                          <span>{ans.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-600 font-mono py-2 italic">
                    No {type} records returned.
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
