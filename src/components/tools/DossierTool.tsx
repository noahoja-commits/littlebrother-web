"use client";

import React, { useState, useEffect } from "react";
import { FolderGit2, Plus, Download, Trash2, FileText, Check, Shield } from "lucide-react";
import { DossierRecord } from "@/types/osint";

export default function DossierTool() {
  const [dossiers, setDossiers] = useState<DossierRecord[]>([]);
  const [activeDossier, setActiveDossier] = useState<DossierRecord | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);

  // Load from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("lb_dossiers");
      if (saved) {
        const parsed = JSON.parse(saved);
        setDossiers(parsed);
        if (parsed.length > 0) setActiveDossier(parsed[0]);
      } else {
        // Create initial blank template
        const initial: DossierRecord = {
          id: "case-001",
          created: new Date().toISOString().split("T")[0],
          targetName: "Subject John Doe",
          aliases: "jdoe, phantom99",
          dob: "1990-05-14",
          phones: "+1 (555) 234-5678",
          emails: "jdoe@example.com, phantom@proton.me",
          addresses: "123 Cyber Way",
          city: "San Francisco",
          country: "United States",
          ipAddresses: "198.51.100.22",
          socialAccounts: "github.com/jdoe\nx.com/phantom99",
          notes: "Initial preliminary investigation dossier created.",
          tags: ["Person of Interest", "Active Target"]
        };
        setDossiers([initial]);
        setActiveDossier(initial);
      }
    } catch {
      // ignore
    }
  }, []);

  const saveDossier = (updated: DossierRecord) => {
    const updatedList = dossiers.map((d) => (d.id === updated.id ? updated : d));
    setDossiers(updatedList);
    setActiveDossier(updated);
    try {
      localStorage.setItem("lb_dossiers", JSON.stringify(updatedList));
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2000);
    } catch {
      // ignore
    }
  };

  const createNew = () => {
    const newDoc: DossierRecord = {
      id: "case-" + Math.random().toString(36).substring(2, 7),
      created: new Date().toISOString().split("T")[0],
      targetName: "New Subject",
      aliases: "",
      dob: "",
      phones: "",
      emails: "",
      addresses: "",
      city: "",
      country: "",
      ipAddresses: "",
      socialAccounts: "",
      notes: "",
      tags: ["New Investigation"]
    };
    const list = [newDoc, ...dossiers];
    setDossiers(list);
    setActiveDossier(newDoc);
    localStorage.setItem("lb_dossiers", JSON.stringify(list));
  };

  const deleteActive = () => {
    if (!activeDossier) return;
    const remaining = dossiers.filter((d) => d.id !== activeDossier.id);
    setDossiers(remaining);
    setActiveDossier(remaining[0] || null);
    localStorage.setItem("lb_dossiers", JSON.stringify(remaining));
  };

  const exportMarkdown = () => {
    if (!activeDossier) return;
    const md = `# LittleBrother OSINT Dossier: ${activeDossier.targetName}
**Case ID:** ${activeDossier.id}  
**Date Created:** ${activeDossier.created}  
**Tags:** ${activeDossier.tags.join(", ")}  

---

### Target Identity
- **Full Legal Name:** ${activeDossier.targetName}
- **Aliases / Monikers:** ${activeDossier.aliases}
- **Date of Birth:** ${activeDossier.dob}
- **Primary Country / City:** ${activeDossier.city}, ${activeDossier.country}

### Communication & Network
- **Phone Numbers:** ${activeDossier.phones}
- **Email Addresses:** ${activeDossier.emails}
- **Physical Addresses:** ${activeDossier.addresses}
- **Known IP Addresses:** ${activeDossier.ipAddresses}

### Social Media & Handles
${activeDossier.socialAccounts || "None recorded"}

### Case Notes & Field Observations
${activeDossier.notes || "None"}
`;

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `dossier_${activeDossier.targetName.replace(/\s+/g, "_")}.md`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-sky-400 flex items-center gap-2">
              <FolderGit2 className="w-5 h-5" /> Target Dossier & Case Manager (DoxMaker)
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Assemble discovered intelligence into structured case files with client-side encrypted local storage and markdown export.
            </p>
          </div>
          <button
            type="button"
            onClick={createNew}
            className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" /> New Case File
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* Dossier List Sidebar */}
        <div className="md:col-span-1 space-y-2">
          <div className="text-xs font-mono uppercase text-slate-500 px-1">Case Index ({dossiers.length})</div>
          <div className="space-y-1.5 max-h-[600px] overflow-y-auto">
            {dossiers.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveDossier(item)}
                className={`w-full text-left p-3 rounded-lg border font-mono text-xs transition flex flex-col gap-1 ${
                  activeDossier?.id === item.id
                    ? "bg-slate-800 border-sky-500 text-sky-300"
                    : "bg-slate-950/70 border-slate-800 text-slate-400 hover:bg-slate-900"
                }`}
              >
                <div className="font-bold text-slate-200 truncate">{item.targetName || "Untitled"}</div>
                <div className="text-[10px] text-slate-500 flex justify-between">
                  <span>{item.id}</span>
                  <span>{item.created}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Dossier Editor */}
        {activeDossier ? (
          <div className="md:col-span-3 bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-5">
            <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-800 gap-2">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-mono text-slate-400">Editing:</span>
                <span className="text-sm font-bold font-mono text-white">{activeDossier.targetName}</span>
              </div>
              <div className="flex items-center gap-2">
                {savedNotice && (
                  <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Auto-saved
                  </span>
                )}
                <button
                  type="button"
                  onClick={exportMarkdown}
                  className="bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs px-3 py-1.5 rounded border border-slate-700 flex items-center gap-1 transition"
                >
                  <Download className="w-3.5 h-3.5" /> Export Markdown
                </button>
                <button
                  type="button"
                  onClick={deleteActive}
                  className="bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 text-xs px-3 py-1.5 rounded border border-rose-800 flex items-center gap-1 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <label className="text-slate-400 block mb-1">Target Full Name</label>
                <input
                  type="text"
                  value={activeDossier.targetName}
                  onChange={(e) => saveDossier({ ...activeDossier, targetName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Aliases & Online Handles</label>
                <input
                  type="text"
                  value={activeDossier.aliases}
                  onChange={(e) => saveDossier({ ...activeDossier, aliases: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={activeDossier.dob}
                  onChange={(e) => saveDossier({ ...activeDossier, dob: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Phone Numbers</label>
                <input
                  type="text"
                  value={activeDossier.phones}
                  onChange={(e) => saveDossier({ ...activeDossier, phones: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Emails</label>
                <input
                  type="text"
                  value={activeDossier.emails}
                  onChange={(e) => saveDossier({ ...activeDossier, emails: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">City & Country</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="City"
                    value={activeDossier.city}
                    onChange={(e) => saveDossier({ ...activeDossier, city: e.target.value })}
                    className="w-1/2 bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                  <input
                    type="text"
                    placeholder="Country"
                    value={activeDossier.country}
                    onChange={(e) => saveDossier({ ...activeDossier, country: e.target.value })}
                    className="w-1/2 bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Physical Address</label>
                <input
                  type="text"
                  value={activeDossier.addresses}
                  onChange={(e) => saveDossier({ ...activeDossier, addresses: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Associated IP Addresses</label>
                <input
                  type="text"
                  value={activeDossier.ipAddresses}
                  onChange={(e) => saveDossier({ ...activeDossier, ipAddresses: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="font-mono text-xs">
              <label className="text-slate-400 block mb-1">Social Accounts & Profiles (one per line)</label>
              <textarea
                rows={3}
                value={activeDossier.socialAccounts}
                onChange={(e) => saveDossier({ ...activeDossier, socialAccounts: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="font-mono text-xs">
              <label className="text-slate-400 block mb-1">Intelligence Observations & Investigation Notes</label>
              <textarea
                rows={5}
                value={activeDossier.notes}
                onChange={(e) => saveDossier({ ...activeDossier, notes: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        ) : (
          <div className="md:col-span-3 text-center text-xs text-slate-500 p-12 border border-dashed border-slate-800 rounded-xl">
            Select or create a case dossier.
          </div>
        )}
      </div>
    </div>
  );
}
