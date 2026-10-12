"use client";

import React, { useState } from "react";
import { Mail, ArrowRight, Server, Shield, Loader2, Copy, Check } from "lucide-react";
import { HeaderResult } from "@/types/osint";

export default function HeaderTool() {
  const [headers, setHeaders] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HeaderResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleAnalyze = async () => {
    if (!headers.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/headers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ headers })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to analyze headers");
      setResult(data);
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const loadSample = () => {
    setHeaders(`Received: from mail-lf1-f41.google.com (mail-lf1-f41.google.com [209.85.167.41])
    by mx.destination.org with ESMTPS id abc123xyz
    for <target@example.com>; Mon, 12 Oct 2026 09:30:00 -0400
Received: by mail-lf1-f41.google.com with SMTP id 12345
    for <target@example.com>; Mon, 12 Oct 2026 09:29:58 -0400
Received: from 198.51.100.45 (client-198-51-100-45.isp.net [198.51.100.45])
    by mail.google.com with HTTP; Mon, 12 Oct 2026 09:29:55 -0400
From: "Sender Name" <sender@example.com>
To: "Recipient" <target@example.com>
Subject: Investigation Report
Date: Mon, 12 Oct 2026 09:29:50 -0400
Message-ID: <CAD1234567890@mail.gmail.com>
Received-SPF: pass (google.com: domain of sender@example.com designates 209.85.167.41 as permitted sender)
DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed; d=example.com; s=20230601`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-sky-400 flex items-center gap-2">
              <Mail className="w-5 h-5" /> Mail-to-IP & Header Analyzer
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Extract real sender originating IPs, MTA hops, relay delays, and authentication records (SPF, DKIM, DMARC) from raw email headers.
            </p>
          </div>
          <button
            type="button"
            onClick={loadSample}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-sky-400 px-3 py-1.5 rounded border border-slate-700 transition"
          >
            Load Sample
          </button>
        </div>

        <div className="mt-4">
          <textarea
            value={headers}
            onChange={(e) => setHeaders(e.target.value)}
            rows={6}
            placeholder="Paste raw email headers here (From:, Received:, Message-ID:)..."
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={loading || !headers.trim()}
            className="bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-lg flex items-center gap-2 transition"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Server className="w-4 h-4" />}
            Analyze Route & Extract IPs
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs p-4 rounded-xl font-mono">
          [!] Error: {error}
        </div>
      )}

      {result && (
        <div className="space-y-5">
          {/* Header Summary */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2 pb-3 border-b border-slate-800">
              <Shield className="w-4 h-4 text-sky-400" /> Header Metadata
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-xs font-mono">
              <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800/70">
                <span className="text-slate-500 block">From:</span>
                <span className="text-slate-200">{result.summary.from}</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800/70">
                <span className="text-slate-500 block">To:</span>
                <span className="text-slate-200">{result.summary.to}</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800/70">
                <span className="text-slate-500 block">Subject:</span>
                <span className="text-slate-200">{result.summary.subject}</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800/70">
                <span className="text-slate-500 block">Date:</span>
                <span className="text-slate-200">{result.summary.date}</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800/70">
                <span className="text-slate-500 block">SPF Status:</span>
                <span className="text-emerald-400">{result.summary.spf}</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800/70">
                <span className="text-slate-500 block">DKIM Signature:</span>
                <span className="text-emerald-400">{result.summary.dkim}</span>
              </div>
            </div>
          </div>

          {/* Discovered Origin IPs */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-400" /> Discovered Public Relay IPs ({result.discoveredPublicIps.length})
              </h3>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(result.discoveredPublicIps.join("\n"));
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-mono"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy All IPs"}
              </button>
            </div>

            {result.discoveredPublicIps.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                {result.discoveredPublicIps.map((ip) => (
                  <div key={ip} className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
                    <span className="font-mono text-xs text-sky-400 font-bold">{ip}</span>
                    <a
                      href={`https://ipinfo.io/${ip}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-slate-400 hover:text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700"
                    >
                      Geolocate
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 font-mono mt-3">No public relay IPv4 addresses detected in Received headers.</p>
            )}
          </div>

          {/* Hops timeline */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2 pb-3 border-b border-slate-800">
              <ArrowRight className="w-4 h-4 text-sky-400" /> Relay Hop Progression ({result.hops.length} hops)
            </h3>
            <div className="mt-4 space-y-3 font-mono text-xs">
              {result.hops.map((hop, i) => (
                <div key={i} className="bg-slate-950/80 p-3 rounded-lg border border-slate-800/80">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="text-sky-400 font-bold">Hop #{i + 1}</span>
                    <span className="text-[11px] text-slate-500">IPs: {hop.ips.join(", ") || "None"}</span>
                  </div>
                  <p className="text-slate-300 break-all text-[11px] leading-relaxed line-clamp-2">
                    {hop.raw}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
