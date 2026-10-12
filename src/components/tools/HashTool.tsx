"use client";

import React, { useState } from "react";
import { KeyRound, Search, ExternalLink, Loader2, CheckCircle, ShieldAlert } from "lucide-react";
import { HashResult } from "@/types/osint";

export default function HashTool() {
  const [hash, setHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HashResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInspect = async () => {
    if (!hash.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/hash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hash: hash.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to inspect hash");
      setResult(data);
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || "Failed to inspect hash");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur">
        <h2 className="text-xl font-bold text-sky-400 flex items-center gap-2">
          <KeyRound className="w-5 h-5" /> Cryptographic Hash Identifier & OSINT Search
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Identify algorithm families (MD5, SHA-1, SHA-256, NTLM, bcrypt, Argon2) and query public lookup databases for cracked plaintexts.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleInspect();
          }}
          className="mt-4 flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={hash}
              onChange={(e) => setHash(e.target.value)}
              placeholder="e.g. 5d41402abc4b2a76b9719d911017c592 or e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !hash.trim()}
            className="bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 transition"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Identify & Check
          </button>
        </form>

        <div className="mt-3 flex gap-2 text-xs">
          <span className="text-slate-500">Quick tests:</span>
          <button
            type="button"
            onClick={() => setHash("5d41402abc4b2a76b9719d911017c592")}
            className="text-sky-400 hover:underline font-mono text-[11px]"
          >
            MD5 (&quot;hello&quot;)
          </button>
          <span className="text-slate-600">•</span>
          <button
            type="button"
            onClick={() => setHash("2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824")}
            className="text-sky-400 hover:underline font-mono text-[11px]"
          >
            SHA-256 (&quot;hello&quot;)
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs p-4 rounded-xl font-mono">
          [!] Error: {error}
        </div>
      )}

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Identified types */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs uppercase text-slate-500">Hash Length</span>
                <div className="text-xl font-mono font-bold text-sky-400">{result.length} characters</div>
              </div>
              <span className="px-2 py-0.5 text-xs font-mono rounded bg-slate-800 text-slate-300">
                {result.identifiedTypes.length} Matches Found
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-400 block mb-2">Possible Algorithms:</span>
              <div className="space-y-2">
                {result.identifiedTypes.map((t, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between font-mono text-xs"
                  >
                    <span className="text-sky-400 font-bold">{t.name}</span>
                    <span className="text-slate-500 text-[11px]">
                      {t.bitLength} bits ({t.format})
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {result.lookupResult ? (
              <div className="p-3 bg-emerald-950/40 border border-emerald-800 rounded-lg text-xs font-mono">
                <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" /> Plaintext Match Found!
                </div>
                <div className="text-slate-100 text-sm mt-1 bg-slate-950 p-2 rounded">
                  {result.lookupResult.match}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg text-xs font-mono text-slate-400 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                <span>No instant plaintext found in standard public dictionary. Cross-reference specialized tables below.</span>
              </div>
            )}
          </div>

          {/* External lookup portals */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-300 pb-3 border-b border-slate-800">
              OSINT Hash Threat & Rainbow Table Portals
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <a
                href={result.searchUrls.virusTotal}
                target="_blank"
                rel="noreferrer"
                className="p-3 bg-slate-950 hover:bg-slate-800 rounded-lg border border-slate-800 flex items-center justify-between text-slate-300 transition"
              >
                <div>
                  <div className="text-sky-400 font-bold">VirusTotal Threat Intelligence</div>
                  <div className="text-[11px] text-slate-500">Check malware and binary signature files</div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-500" />
              </a>

              <a
                href={`https://hashes.com/en/decrypt/hash`}
                target="_blank"
                rel="noreferrer"
                className="p-3 bg-slate-950 hover:bg-slate-800 rounded-lg border border-slate-800 flex items-center justify-between text-slate-300 transition"
              >
                <div>
                  <div className="text-emerald-400 font-bold">Hashes.com Rainbow Decrypt</div>
                  <div className="text-[11px] text-slate-500">Query billions of recovered plaintext passwords</div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-500" />
              </a>

              <a
                href={result.searchUrls.google}
                target="_blank"
                rel="noreferrer"
                className="p-3 bg-slate-950 hover:bg-slate-800 rounded-lg border border-slate-800 flex items-center justify-between text-slate-300 transition"
              >
                <div>
                  <div className="text-amber-400 font-bold">Google Dork Query</div>
                  <div className="text-[11px] text-slate-500">Search pastebins, leaks, and forum dumps for this exact hash</div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-500" />
              </a>

              <a
                href={result.searchUrls.hashcatGuide}
                target="_blank"
                rel="noreferrer"
                className="p-3 bg-slate-950 hover:bg-slate-800 rounded-lg border border-slate-800 flex items-center justify-between text-slate-300 transition"
              >
                <div>
                  <div className="text-purple-400 font-bold">Hashcat Mode Reference</div>
                  <div className="text-[11px] text-slate-500">Identify exact mode numbers for GPU cracking</div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-500" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
