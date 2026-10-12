"use client";

import React, { useState } from "react";
import {
  Globe,
  Wifi,
  Mail,
  Camera,
  KeyRound,
  User,
  Network,
  FolderGit2,
  Terminal,
  Cloud,
  ExternalLink,
  ShieldAlert,
  Layers
} from "lucide-react";

import IpTool from "@/components/tools/IpTool";
import BssidTool from "@/components/tools/BssidTool";
import HeaderTool from "@/components/tools/HeaderTool";
import ExifTool from "@/components/tools/ExifTool";
import HashTool from "@/components/tools/HashTool";
import UsernameTool from "@/components/tools/UsernameTool";
import DnsTool from "@/components/tools/DnsTool";
import DossierTool from "@/components/tools/DossierTool";

type TabId = "ip" | "bssid" | "headers" | "exif" | "hash" | "username" | "dns" | "dossier" | "deploy";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("ip");

  const navigation = [
    { id: "ip", label: "IP Geolocation", icon: Globe, badge: "Edge" },
    { id: "bssid", label: "BSSID Wi-Fi", icon: Wifi, badge: "GPS" },
    { id: "headers", label: "Mail-to-IP Headers", icon: Mail, badge: "Hop Trace" },
    { id: "exif", label: "EXIF & Photo GPS", icon: Camera, badge: "Metadata" },
    { id: "hash", label: "Hash Intelligence", icon: KeyRound, badge: "Crypto" },
    { id: "username", label: "Username Recon", icon: User, badge: "Social" },
    { id: "dns", label: "Cloudflare 1.1.1.1 DoH", icon: Network, badge: "Encrypted" },
    { id: "dossier", label: "Dossier Case Files", icon: FolderGit2, badge: "DoxMaker" },
    { id: "deploy", label: "Cloudflare Deploy Guide", icon: Cloud, badge: "Wrangler" },
  ];

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col font-sans">
      {/* Top Banner / Cyber Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold tracking-tight text-white text-base">
                  LITTLEBROTHER
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-950 border border-sky-800 text-sky-400 uppercase font-bold">
                  v2.5 Web Edge
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Open Source Intelligence (OSINT) Suite &bull; Cloudflare Workers & Pages Ready
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-800/60 text-[11px] font-mono text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Cloudflare Runtime Active
            </div>
            <a
              href="https://github.com/AbirHasan2005/LittleBrother"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg transition"
            >
              Original Repo <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="max-w-7xl mx-auto w-full px-4 py-6 flex-1 flex flex-col md:flex-row gap-6">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 shrink-0 space-y-1">
          <div className="text-[11px] font-mono uppercase text-slate-500 px-3 mb-2 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" /> Recon Modules
          </div>

          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id as TabId)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-mono text-xs transition border text-left ${
                  isActive
                    ? "bg-sky-600/15 border-sky-500 text-sky-400 font-bold"
                    : "bg-slate-950/40 border-slate-900 text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-sky-400" : "text-slate-500"}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono shrink-0 ml-1.5 ${
                      isActive
                        ? "bg-sky-950 text-sky-300 border border-sky-800"
                        : "bg-slate-900 text-slate-500"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-6 px-3">
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-900 text-[11px] text-slate-400 space-y-2 font-mono">
              <div className="text-slate-300 font-bold flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> Acceptable Use
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Passive defensive intelligence gathering tool for authorized security assessments, threat research, and education.
              </p>
            </div>
          </div>
        </aside>

        {/* Workspace Panel */}
        <main className="flex-1 min-w-0">
          {activeTab === "ip" && <IpTool />}
          {activeTab === "bssid" && <BssidTool />}
          {activeTab === "headers" && <HeaderTool />}
          {activeTab === "exif" && <ExifTool />}
          {activeTab === "hash" && <HashTool />}
          {activeTab === "username" && <UsernameTool />}
          {activeTab === "dns" && <DnsTool />}
          {activeTab === "dossier" && <DossierTool />}
          {activeTab === "deploy" && <DeployGuide />}
        </main>
      </div>

      {/* Cyber Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-4 text-center text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>LittleBrother Modern Edge OSINT Suite &bull; Powered by Next.js & Cloudflare</span>
          <span>Zero Server Overhead &bull; Distributed Global Edge</span>
        </div>
      </footer>
    </div>
  );
}

function DeployGuide() {
  return (
    <div className="space-y-6 font-mono text-xs">
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-lg space-y-4">
        <h2 className="text-xl font-bold text-sky-400 flex items-center gap-2">
          <Cloud className="w-5 h-5" /> Deploying LittleBrother to Cloudflare
        </h2>
        <p className="text-slate-400 leading-relaxed">
          This web application is configured with the official <strong>@opennextjs/cloudflare</strong> adapter. Cloudflare compiles the Next.js app, static assets, and Route Handlers into a production Cloudflare Worker.
        </p>

        {/* Method 1: Cloudflare Dashboard Git Integration */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="text-sm font-bold text-emerald-400">Method 1: Cloudflare Workers &amp; Pages Git CI/CD</div>
          <ol className="list-decimal list-inside space-y-2 text-slate-300">
            <li>In the <strong>Cloudflare Dashboard</strong>, go to <strong>Workers &amp; Pages</strong> &rarr; <strong>Create application</strong> &rarr; <strong>Workers</strong> or <strong>Pages</strong>.</li>
            <li>Connect your GitHub repository: <code className="text-sky-300">noahoja-commits/littlebrother-web</code>.</li>
            <li>Configure the build settings:
              <div className="bg-slate-900 p-2.5 rounded mt-2 border border-slate-800 font-mono text-[11px] text-sky-300 space-y-1">
                <div>Build command: <span className="text-emerald-400">npx opennextjs-cloudflare build</span></div>
                <div>Deploy command: <span className="text-emerald-400">npx wrangler deploy</span></div>
              </div>
            </li>
            <li>Cloudflare will read <code className="text-slate-200">wrangler.jsonc</code> which points directly to <code className="text-sky-400">.open-next/worker.js</code> and <code className="text-sky-400">.open-next/assets</code>.</li>
            <li>Click <strong>Save and Deploy</strong>.</li>
          </ol>
        </div>

        {/* Method 2: Wrangler CLI */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="text-sm font-bold text-sky-400">Method 2: One-Command CLI Deploy</div>
          <p className="text-slate-400">
            Deploy right from your shell with Wrangler:
          </p>
          <div className="bg-slate-900 p-3 rounded border border-slate-800 text-slate-200 space-y-1">
            <div><span className="text-slate-500"># 1. Authenticate with Cloudflare</span></div>
            <div className="text-emerald-400">npx wrangler login</div>
            <div className="pt-2"><span className="text-slate-500"># 2. Build OpenNext bundle and deploy</span></div>
            <div className="text-emerald-400">npm run deploy</div>
          </div>
        </div>

        {/* Edge feature matrix */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="text-slate-300 font-bold">Cloudflare Edge Features Leveraged:</div>
          <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
            <li><strong>Cloudflare 1.1.1.1 DoH:</strong> Zero-leak encrypted DNS queries across 300+ global edge locations.</li>
            <li><strong>Edge Headers:</strong> Inspects <code className="text-sky-300">CF-Connecting-IP</code> and <code className="text-sky-300">CF-IPCountry</code> for instant zero-latency user telemetry.</li>
            <li><strong>Client-Side Local Storage:</strong> Dossier management encrypts and stores case files safely in the investigator&apos;s browser.</li>
            <li><strong>Browser-side EXIF Extraction:</strong> Image metadata is parsed in WebAssembly/client memory without uploading photos to external servers.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
