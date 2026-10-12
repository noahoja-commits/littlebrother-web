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
  Terminal as TerminalIcon,
  Cloud,
  ExternalLink,
  ShieldAlert,
  Layers,
  Monitor
} from "lucide-react";

import TerminalView from "@/components/TerminalView";
import IpTool from "@/components/tools/IpTool";
import BssidTool from "@/components/tools/BssidTool";
import HeaderTool from "@/components/tools/HeaderTool";
import ExifTool from "@/components/tools/ExifTool";
import HashTool from "@/components/tools/HashTool";
import UsernameTool from "@/components/tools/UsernameTool";
import DnsTool from "@/components/tools/DnsTool";
import DossierTool from "@/components/tools/DossierTool";

type ViewMode = "terminal" | "gui";
type TabId = "ip" | "bssid" | "headers" | "exif" | "hash" | "username" | "dns" | "dossier" | "deploy";

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>("terminal");
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
    <div className="min-h-screen bg-[#020604] text-slate-100 flex flex-col font-mono selection:bg-[#22c55e] selection:text-black">
      {/* Top Bar Switcher between Terminal Mode & GUI Suite Mode */}
      <div className="bg-black/95 border-b border-[#14532d] px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e] animate-pulse"></span>
            <span className="font-bold text-[#22c55e] tracking-wider uppercase text-sm">
              LittleBrother
            </span>
            <span className="text-[10px] text-[#4ade80] bg-[#052e16] px-1.5 py-0.5 rounded border border-[#14532d]">
              v2.5 Python CLI &rarr; Edge Web
            </span>
          </div>
        </div>

        {/* View Mode Toggle: Authentic Terminal CLI vs Web GUI */}
        <div className="flex items-center gap-2 bg-[#052e16]/40 p-1 rounded-lg border border-[#14532d]">
          <button
            type="button"
            onClick={() => setViewMode("terminal")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs transition ${
              viewMode === "terminal"
                ? "bg-[#22c55e] text-black font-bold shadow-sm"
                : "text-[#4ade80] hover:text-white"
            }`}
          >
            <TerminalIcon className="w-3.5 h-3.5" />
            <span>Terminal CLI (Exact)</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("gui")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs transition ${
              viewMode === "gui"
                ? "bg-[#22c55e] text-black font-bold shadow-sm"
                : "text-[#4ade80] hover:text-white"
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>GUI Suite</span>
          </button>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-[#86efac]">
          <a
            href="https://github.com/noahoja-commits/littlebrother-web"
            target="_blank"
            rel="noreferrer"
            className="hover:underline flex items-center gap-1 text-[#4ade80]"
          >
            GitHub Repo <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Render Terminal CLI Mode (Exact 1:1 match to Python original) */}
      {viewMode === "terminal" && (
        <div className="flex-1">
          <TerminalView />
        </div>
      )}

      {/* Render GUI Mode */}
      {viewMode === "gui" && (
        <div className="flex-1 flex flex-col bg-[#070b12]">
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
              <span>LittleBrother Modern Edge OSINT Suite &bull; Powered by Next.js</span>
              <span>Zero Server Overhead &bull; Distributed Edge</span>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}

function DeployGuide() {
  return (
    <div className="space-y-6 font-mono text-xs">
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-lg space-y-4">
        <h2 className="text-xl font-bold text-sky-400 flex items-center gap-2">
          <Cloud className="w-5 h-5" /> Deploying LittleBrother to Cloudflare / Vercel
        </h2>
        <p className="text-slate-400 leading-relaxed">
          This web application is configured with the official <strong>@opennextjs/cloudflare</strong> adapter. You can deploy it to Cloudflare Workers or 1-click import into Vercel.
        </p>

        {/* Method 1: Cloudflare Dashboard Git Integration */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="text-sm font-bold text-emerald-400">Method 1: Cloudflare Workers &amp; Pages Git CI/CD</div>
          <ol className="list-decimal list-inside space-y-2 text-slate-300">
            <li>In the <strong>Cloudflare Dashboard</strong>, go to <strong>Workers &amp; Pages</strong> &rarr; <strong>Create application</strong> &rarr; <strong>Workers</strong> or <strong>Pages</strong>.</li>
            <li>Connect your GitHub repository: <code className="text-sky-300">noahoja-commits/littlebrother-web</code>.</li>
            <li>Configure the build settings:
              <div className="bg-slate-900 p-2.5 rounded mt-2 border border-slate-800 font-mono text-[11px] text-sky-300 space-y-1">
                <div>Build command: <span className="text-emerald-400">npm run build</span></div>
                <div>Deploy command: <span className="text-emerald-400">npx wrangler deploy</span></div>
              </div>
            </li>
            <li>Cloudflare will read <code className="text-slate-200">wrangler.jsonc</code> which points directly to <code className="text-sky-400">.open-next/worker.js</code> and <code className="text-sky-400">.open-next/assets</code>.</li>
            <li>Click <strong>Save and Deploy</strong>.</li>
          </ol>
        </div>

        {/* Method 2: Vercel 1-Click Deploy */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="text-sm font-bold text-sky-400">Method 2: Vercel (Instant Zero-Config Deploy)</div>
          <p className="text-slate-400">
            Since this is built with Next.js 16, importing into Vercel works instantly with zero configuration:
          </p>
          <div className="bg-slate-900 p-3 rounded border border-slate-800 text-slate-200 space-y-1">
            <div>1. Go to <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-sky-400 underline">vercel.com</a> and click <strong>Add New &rarr; Project</strong>.</div>
            <div>2. Import repository <code className="text-emerald-400">noahoja-commits/littlebrother-web</code>.</div>
            <div>3. Click <strong>Deploy</strong>.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
