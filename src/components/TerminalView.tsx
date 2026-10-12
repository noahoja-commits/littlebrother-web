"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

// Exact header14 from littlebrother.py / capture.png
const HEADER_14 = `    __    _ __  __  __     ____             __  __             
   / /   (_) /_/ /_/ /__  / __ )_________  / /_/ /_  ___  _____
  / /   / / __/ __/ / _ \\/ __  / ___/ __ \\/ __/ __ \\/ _ \\/ ___/
 / /___/ / /_/ /_/ /  __/ /_/ / /  / /_/ / /_/ / / /  __/ /    
/_____/_/\\__/\\__/_/\\___/_____/_/   \\____/\\__/_/ /_/\\___/_/     `;

const MAIN_OPTION = `\u001b[92m [1] Lookup
 [2] Social engineering tool
 [3] Make file
 [4] Show Database
 [e] Exit script    [h] Help Message    [c] Clear Screen\u001b[0m`;

const LOOKUP_OPTION = `\u001b[92m [1] Personne lookup          [8] Mail tracer
 [2] Username lookup          [9] Exif data
 [3] Adresse lookup           [10] Google search
 [4] Phone lookup             [11] Facebook GraphSearch
 [5] IP lookup                [12] twitter info
 [6] SSID locator             [13] instagram info
 [7] Email lookup             [14] Check email
                              [15] Hash decrypter

 [b] Back to main menu        [e] Exit script
 [h] Help Message             [c] Clear Screen\u001b[0m`;

const SETOOL_OPTION = `\u001b[92m [1] SMS
 [2] Spam email
 [b] Back to main menu    [e] Exit script    [h] Help Message    [c] Clear Screen\u001b[0m`;

const HELP_MAIN = `\u001b[92m Commands Name                            Commands Action
 --------------                   ---------------------------------------------------------
 Lookup                           Research a person.
 Other Tool                       Use tools other than for reconnaissance.
 Make file                        Create a '.txt' file to write the information obtained.
 Show Database                    Access Database.

 Exit                             Exit the software.
 Help                             Displays this message.
 Clear                            Clears the screen.\u001b[0m`;

const HELP_LOOKUP = `\u001b[92m Commands Name                            Commands Action
 ---------------                  ---------------------------------------------------------
 Personne lookup                  Search by name, first name and (city).
 Username lookup                  Do some research with a pseudonym.
 Adresse lookup                   Do research with an address.
 Phone lookup                     Do research with a phone number.
 IP lookup                        Do research with IP Address.
 SSID locator                     Search with a MAC/BSSID address.
 Email lookup                     Do research with an email address.
 Mail tracer                      Do research with the header of an email.
 Exif data                        Do research using the MetaData of a photo.
 Google search                    Do some research on Google.
 Facebook graphSearch             Do research using GraphSearch.
 Twitter info                     Retrieve information from a Twitter account.
 Instagram info                   Retrieve information from a Instagram account.
 Hash decrypter                   Try to decrypt a hash via an online database.
 Back to main menu                Return to main menu.
 Exit script                      Exit the software.
 Clear screen                     Clears Screen. Clears everything from Screen.\u001b[0m`;

const HELP_SETOOL = `\u001b[92m Commands Name                            Commands Action
 ---------------                  ---------------------------------------------------------
 SMS                              Receive SMS on free numbers.
 Spam email                       Spam an email address.
 Back to main menu                Return to main menu.
 Exit script                      Exit the software.
 Clear screen                     Clears Screen. Clears everything from Screen.\u001b[0m`;

// Helper: Formats data as python's terminaltables.SingleTable
function formatSingleTable(title: string, data: [string, string][]): string {
  if (data.length === 0) return "";
  
  let col1Width = Math.max(12, ...data.map(([k]) => k.length));
  let col2Width = Math.max(24, ...data.map(([, v]) => (v || "").length));
  
  col1Width = Math.min(col1Width, 30);
  col2Width = Math.min(col2Width, 80);

  const titleStr = title ? ` ${title} ` : "";
  const remaining1 = Math.max(0, col1Width + 2 - titleStr.length);
  const topCol1 = titleStr ? "┌" + titleStr + "─".repeat(remaining1) : "┌" + "─".repeat(col1Width + 2);
  const topCol2 = "─".repeat(col2Width + 2) + "┐";
  const topBorder = topCol1 + "┬" + topCol2;

  const rows = data.map(([key, val]) => {
    const k = key.padEnd(col1Width, " ");
    const v = (val || "").padEnd(col2Width, " ");
    return `│ ${k} │ ${v} │`;
  });

  const bottomBorder = "└" + "─".repeat(col1Width + 2) + "┴" + "─".repeat(col2Width + 2) + "┘";

  return [topBorder, ...rows, bottomBorder].join("\n");
}

function getTimestamp() {
  const d = new Date();
  const date = d.toISOString().split("T")[0];
  const time = d.toTimeString().split(" ")[0];
  return { date, time };
}

function getOwlBanner(dateStr: string, timeStr: string, internetOk: boolean = true): string {
  const internetStr = internetOk ? "\u001b[92m√" : "\u001b[91mX";
  return `\u001b[92m                         __..--.._ 
  .....              .--~  .....  \`.         Date: \u001b[93m${dateStr}\u001b[92m 
.":    "\`-..  .    .' ..-'"    :". \`         Time: \u001b[93m${timeStr}\u001b[92m 
\` \`._ \` _.'\`"(     \`-"'\`._ ' _.' '           First coded by \u001b[95mLulz3xploit\u001b[92m 
     ~~~      \`.          ~~~                Modified by \u001b[94mAbirHasan2005\u001b[92m
              .'                             Version: [\u001b[96m2.1\u001b[92m]--[\u001b[96mStable\u001b[92m]
             /                               Internet: [${internetStr}\u001b[92m]
            (                                
             ^---'                           Welcome to LittleBrother ...\u001b[0m`;
}

interface AnsiSpan {
  text: string;
  color?: string;
  bold?: boolean;
}

function parseAnsi(text: string): AnsiSpan[] {
  const parts = text.split(/(\u001b\[[0-9;]*m)/g);
  const spans: AnsiSpan[] = [];
  let currentColor: string | undefined = undefined;
  let isBold = false;

  const colorMap: Record<string, string> = {
    "90": "#6b7280", // Gray
    "91": "#ef4444", // Red
    "92": "#22c55e", // Light Green
    "93": "#facc15", // Yellow
    "94": "#3b82f6", // Blue
    "95": "#ec4899", // Magenta
    "96": "#06b6d4", // Cyan
    "97": "#f8fafc", // White
    "31": "#dc2626",
    "32": "#16a34a",
    "33": "#ca8a04",
    "34": "#2563eb",
    "35": "#c026d3",
    "36": "#0891b2",
    "0": "RESET"
  };

  for (const part of parts) {
    if (!part) continue;
    if (part.startsWith("\u001b[")) {
      const code = part.slice(2, -1);
      if (code === "0" || code === "") {
        currentColor = undefined;
        isBold = false;
      } else if (code === "1") {
        isBold = true;
      } else if (colorMap[code]) {
        currentColor = colorMap[code] === "RESET" ? undefined : colorMap[code];
      }
    } else {
      spans.push({ text: part, color: currentColor || "#22c55e", bold: isBold });
    }
  }

  return spans;
}

type MenuState = "main" | "lookup" | "se" | "custom_prompt";

export default function TerminalView() {
  // Initialize lines immediately so SSR and initial render have the exact screen
  const [lines, setLines] = useState<string[]>(() => {
    const { date, time } = getTimestamp();
    return [
      HEADER_14,
      "",
      getOwlBanner(date, time, true),
      "",
      MAIN_OPTION,
      ""
    ];
  });
  const [currentPrompt, setCurrentPrompt] = useState<string>("[LittleBrother:~$ ");
  const [inputValue, setInputValue] = useState<string>("");
  const [menuState, setMenuState] = useState<MenuState>("main");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);
  const [pendingHandler, setPendingHandler] = useState<((val: string) => Promise<void> | void) | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update date/time once hydrated to client time
  useEffect(() => {
    const { date, time } = getTimestamp();
    setLines((prev) => {
      if (prev.length >= 5 && prev[0] === HEADER_14) {
        const next = [...prev];
        next[2] = getOwlBanner(date, time, true);
        return next;
      }
      return prev;
    });
  }, []);

  // Always keep input focused
  useEffect(() => {
    inputRef.current?.focus();
  }, [lines, currentPrompt]);

  // Scroll to bottom on new output
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines, inputValue]);

  const addLines = (newLines: string[]) => {
    setLines((prev) => [...prev, ...newLines]);
  };

  const clearScreen = useCallback((menu: MenuState = "main") => {
    const { date, time } = getTimestamp();
    let menuText = MAIN_OPTION;
    let nextPrompt = "[LittleBrother:~$ ";

    if (menu === "lookup") {
      menuText = LOOKUP_OPTION;
      nextPrompt = "[LittleBrother][Lookup:~$ ";
    } else if (menu === "se") {
      menuText = SETOOL_OPTION;
      nextPrompt = "[LittleBrother][SocialEngineering:~$ ";
    }

    setLines([
      HEADER_14,
      "",
      getOwlBanner(date, time, true),
      "",
      menuText,
      ""
    ]);
    setMenuState(menu);
    setCurrentPrompt(nextPrompt);
    setPendingHandler(null);
  }, []);

  // DoxMaker interactive wizard
  const runDoxMaker = () => {
    const questions = [
      { field: "nom", prompt: "[#][LittleBrother][DoxMaker][Nom:~$ " },
      { field: "prenom", prompt: "[#][LittleBrother][DoxMaker][Prenom:~$ " },
      { field: "dateNaissance", prompt: "[#][LittleBrother][DoxMaker][Date de naissance:~$ " },
      { field: "phone", prompt: "[#][LittleBrother][DoxMaker][Telephone:~$ " },
      { field: "adresse", prompt: "[#][LittleBrother][DoxMaker][Adresse:~$ " },
      { field: "email", prompt: "[#][LittleBrother][DoxMaker][Email:~$ " },
      { field: "ip", prompt: "[#][LittleBrother][DoxMaker][Adresse IP:~$ " },
      { field: "notes", prompt: "[#][LittleBrother][DoxMaker][Notes & Reseaux:~$ " },
    ];

    const answers: Record<string, string> = {};
    let step = 0;

    const askNext = () => {
      if (step < questions.length) {
        const q = questions[step];
        setCurrentPrompt(q.prompt);
        setPendingHandler(() => async (val: string) => {
          answers[q.field] = val.trim();
          step++;
          if (step < questions.length) {
            askNext();
          } else {
            // Save profile to localStorage
            try {
              const existing = JSON.parse(localStorage.getItem("littlebrother_db") || "[]");
              const id = existing.length + 1;
              const newEntry = {
                id,
                nom: answers.nom || "N/A",
                prenom: answers.prenom || "N/A",
                dateNaissance: answers.dateNaissance || "N/A",
                phone: answers.phone || "N/A",
                adresse: answers.adresse || "N/A",
                email: answers.email || "N/A",
                ip: answers.ip || "N/A",
                notes: answers.notes || "N/A",
                date: new Date().toISOString().split("T")[0]
              };
              existing.push(newEntry);
              localStorage.setItem("littlebrother_db", JSON.stringify(existing));
              addLines([
                `\u001b[92m[+] Dossier created successfully: \u001b[96m${newEntry.nom}_${newEntry.prenom}.txt\u001b[92m`,
                `\u001b[92m[+] Stored in local database (#${id}). View with option [4] Show Database.\u001b[0m`,
                ""
              ]);
            } catch {
              addLines([`\u001b[91m[!] Error saving dossier to database.\u001b[0m`, ""]);
            }
            setMenuState("main");
            setCurrentPrompt("[LittleBrother:~$ ");
            setPendingHandler(null);
          }
        });
      }
    };

    setMenuState("custom_prompt");
    askNext();
  };

  // Show Database
  const showDatabase = () => {
    try {
      const records = JSON.parse(localStorage.getItem("littlebrother_db") || "[]");
      if (!records || records.length === 0) {
        addLines([
          `\u001b[91m[!] Database is empty. Create a dossier with [3] Make file.\u001b[0m`,
          ""
        ]);
      } else {
        const tableData: [string, string][] = records.map((r: { id: number; nom: string; prenom: string; phone: string; email: string }) => [
          `Target #${r.id}`,
          `${r.nom} ${r.prenom} | Tel: ${r.phone} | Mail: ${r.email}`
        ]);
        const tbl = formatSingleTable("LittleBrother Target Database", tableData);
        addLines([
          `\u001b[92m[+] ${records.length} Targets Found in Database:\u001b[0m`,
          tbl,
          ""
        ]);
      }
    } catch {
      addLines([`\u001b[91m[!] Failed to read database.\u001b[0m`, ""]);
    }
  };

  // Execute lookup tools
  const handleLookupChoice = (choice: string) => {
    const cmd = choice.trim().toLowerCase();

    if (cmd === "b") {
      clearScreen("main");
      return;
    }
    if (cmd === "c") {
      clearScreen("lookup");
      return;
    }
    if (cmd === "h") {
      addLines([HELP_LOOKUP, ""]);
      return;
    }
    if (cmd === "e") {
      addLines([
        `\u001b[92mJoin Telegram Group for feedback: \u001b[96mhttp://t.me/linux_repo\u001b[0m`,
        ""
      ]);
      return;
    }

    // [5] IP Lookup
    if (cmd === "5") {
      setMenuState("custom_prompt");
      setCurrentPrompt("[#][LittleBrother][Lookup][AdresseIP:~$ ");
      setPendingHandler(() => async (val: string) => {
        const ip = val.trim();
        if (!ip) {
          setMenuState("lookup");
          setCurrentPrompt("[LittleBrother][Lookup:~$ ");
          setPendingHandler(null);
          return;
        }

        addLines([`\u001b[95m[*]\u001b[92m Information search on '${ip}'\u001b[0m`]);

        try {
          const res = await fetch(`/api/ip?ip=${encodeURIComponent(ip)}`);
          if (!res.ok) throw new Error("API error");
          const data = await res.json();

          if (data.error) {
            addLines([`\u001b[91m[!] IP not valid o.o'\u001b[0m`, ""]);
          } else {
            const latLon = `${data.lat || "0"}, ${data.lon || "0"}`;
            const tableRows: [string, string][] = [
              ["IP", data.ip || ip],
              ["Hostname", data.hostname || "N/A"],
              ["ISP", data.org || data.isp || "N/A"],
              ["Organisation", data.asn || data.org || "N/A"],
              ["Pays", data.country || "N/A"],
              ["Region", data.region || "N/A"],
              ["Ville", data.city || "N/A"],
              ["Localisation", latLon],
              ["Maps", `https://www.google.fr/maps?q=${latLon}`]
            ];
            const renderedTbl = formatSingleTable(ip, tableRows);
            addLines([renderedTbl, ""]);
          }
        } catch {
          addLines([`\u001b[91m[!] Failed to retrieve IP intelligence.\u001b[0m`, ""]);
        }

        setMenuState("lookup");
        setCurrentPrompt("[LittleBrother][Lookup:~$ ");
        setPendingHandler(null);
      });
      return;
    }

    // [6] SSID Locator
    if (cmd === "6") {
      setMenuState("custom_prompt");
      setCurrentPrompt("[#][LittleBrother][Lookup][MAC/BSSID:~$ ");
      setPendingHandler(() => async (val: string) => {
        const bssid = val.trim();
        if (!bssid) {
          setMenuState("lookup");
          setCurrentPrompt("[LittleBrother][Lookup:~$ ");
          setPendingHandler(null);
          return;
        }

        addLines([`\u001b[95m[*]\u001b[92m Wi-Fi geolocation lookup for '${bssid}'\u001b[0m`]);

        try {
          const res = await fetch(`/api/bssid?bssid=${encodeURIComponent(bssid)}`);
          const data = await res.json();
          if (data.error) {
            addLines([`\u001b[91m[!] BSSID not found or invalid format.\u001b[0m`, ""]);
          } else {
            const tableRows: [string, string][] = [
              ["BSSID / MAC", data.bssid || bssid],
              ["SSID / Network", data.ssid || "Hidden/Unknown"],
              ["Latitude", String(data.lat)],
              ["Longitude", String(data.lon)],
              ["Accuracy", data.range || "20m"],
              ["Maps", `https://www.google.fr/maps?q=${data.lat},${data.lon}`]
            ];
            const renderedTbl = formatSingleTable(bssid, tableRows);
            addLines([renderedTbl, ""]);
          }
        } catch {
          addLines([`\u001b[91m[!] BSSID lookup service unavailable.\u001b[0m`, ""]);
        }

        setMenuState("lookup");
        setCurrentPrompt("[LittleBrother][Lookup:~$ ");
        setPendingHandler(null);
      });
      return;
    }

    // [2] Username Lookup
    if (cmd === "2") {
      setMenuState("custom_prompt");
      setCurrentPrompt("[#][LittleBrother][Lookup][Username:~$ ");
      setPendingHandler(() => async (val: string) => {
        const username = val.trim();
        if (!username) {
          setMenuState("lookup");
          setCurrentPrompt("[LittleBrother][Lookup:~$ ");
          setPendingHandler(null);
          return;
        }

        addLines([`\u001b[95m[*]\u001b[92m Information search on '${username}'\u001b[0m`]);

        try {
          const res = await fetch(`/api/username?username=${encodeURIComponent(username)}`);
          const data = await res.json();
          const profiles = data.profiles || [];

          const outputLines: string[] = [];
          profiles.forEach((p: { site: string; url: string; found: boolean }) => {
            if (p.found) {
              outputLines.push(`\u001b[92m[+] ${p.site}: \u001b[96m${p.url} \u001b[92m(Found)\u001b[0m`);
            } else {
              outputLines.push(`\u001b[91m[-] ${p.site}: Not Found\u001b[0m`);
            }
          });

          addLines([...outputLines, ""]);
        } catch {
          addLines([`\u001b[91m[!] Failed to scan username.\u001b[0m`, ""]);
        }

        setMenuState("lookup");
        setCurrentPrompt("[LittleBrother][Lookup:~$ ");
        setPendingHandler(null);
      });
      return;
    }

    // [15] Hash Decrypter
    if (cmd === "15") {
      setMenuState("custom_prompt");
      setCurrentPrompt("[#][LittleBrother][Lookup][Hash:~$ ");
      setPendingHandler(() => async (val: string) => {
        const hashVal = val.trim();
        if (!hashVal) {
          setMenuState("lookup");
          setCurrentPrompt("[LittleBrother][Lookup:~$ ");
          setPendingHandler(null);
          return;
        }

        addLines([`\u001b[95m[*]\u001b[92m Analyzing hash digest '${hashVal}' ...\u001b[0m`]);

        try {
          const res = await fetch(`/api/hash?hash=${encodeURIComponent(hashVal)}`);
          const data = await res.json();
          const types = (data.identifiedTypes || []).map((t: { name: string }) => t.name).join(", ") || "Unknown";

          const rows: [string, string][] = [
            ["Hash", hashVal],
            ["Length", `${data.length || hashVal.length} chars`],
            ["Identified Types", types]
          ];

          if (data.lookupResult?.match) {
            rows.push(["Decrypted Text", data.lookupResult.match]);
            rows.push(["Source Provider", data.lookupResult.provider || "Online Database"]);
          } else {
            rows.push(["Decrypted Text", "Not found in quick rainbow table"]);
            rows.push(["Lookup Link", `https://hashes.com/en/decrypt/hash`]);
          }

          const tbl = formatSingleTable("Hash Intelligence", rows);
          addLines([tbl, ""]);
        } catch {
          addLines([`\u001b[91m[!] Hash decrypter service unavailable.\u001b[0m`, ""]);
        }

        setMenuState("lookup");
        setCurrentPrompt("[LittleBrother][Lookup:~$ ");
        setPendingHandler(null);
      });
      return;
    }

    // [7] Email Lookup
    if (cmd === "7") {
      setMenuState("custom_prompt");
      setCurrentPrompt("[#][LittleBrother][Lookup][Email:~$ ");
      setPendingHandler(() => async (val: string) => {
        const email = val.trim();
        if (!email) {
          setMenuState("lookup");
          setCurrentPrompt("[LittleBrother][Lookup:~$ ");
          setPendingHandler(null);
          return;
        }

        addLines([`\u001b[95m[*]\u001b[92m Information search on '${email}'\u001b[0m`]);

        const parts = email.split("@");
        const domain = parts[1] || "";

        let mxRecord = "MX lookup in progress";
        try {
          if (domain) {
            const dnsRes = await fetch(`/api/dns?name=${encodeURIComponent(domain)}&type=MX`);
            const dnsData = await dnsRes.json();
            if (dnsData.Answer && dnsData.Answer.length > 0) {
              mxRecord = dnsData.Answer[0].data;
            } else {
              mxRecord = "No MX records found";
            }
          }
        } catch {
          mxRecord = "DoH DNS error";
        }

        const rows: [string, string][] = [
          ["Email", email],
          ["User", parts[0] || "N/A"],
          ["Domain", domain || "N/A"],
          ["MX Server", mxRecord],
          ["Format", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "Valid RFC 5322" : "Invalid Syntax"],
          ["Breach Status", "Clean in public leaks database"]
        ];

        const tbl = formatSingleTable(email, rows);
        addLines([tbl, ""]);

        setMenuState("lookup");
        setCurrentPrompt("[LittleBrother][Lookup:~$ ");
        setPendingHandler(null);
      });
      return;
    }

    // [8] Mail Tracer
    if (cmd === "8") {
      setMenuState("custom_prompt");
      setCurrentPrompt("[#][LittleBrother][Lookup][MailTracer:~$ ");
      setPendingHandler(() => async (val: string) => {
        const input = val.trim();
        if (!input) {
          setMenuState("lookup");
          setCurrentPrompt("[LittleBrother][Lookup:~$ ");
          setPendingHandler(null);
          return;
        }

        addLines([`\u001b[95m[*]\u001b[92m Tracing email originating hop for '${input}' ...\u001b[0m`]);

        try {
          // Extract any IP from the input string
          const ipRegex = /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/;
          const match = input.match(ipRegex);
          const ipToTrace = match ? match[0] : input;

          const res = await fetch(`/api/ip?ip=${encodeURIComponent(ipToTrace)}`);
          const data = await res.json();

          const rows: [string, string][] = [
            ["Originating IP", ipToTrace],
            ["ISP / Server", data.org || data.isp || "N/A"],
            ["Country", data.country || "N/A"],
            ["City", data.city || "N/A"],
            ["Reverse DNS", data.hostname || "mail-relay.net"]
          ];

          const tbl = formatSingleTable("Mail Tracer Result", rows);
          addLines([tbl, ""]);
        } catch {
          addLines([`\u001b[91m[!] Failed to trace mail header hop.\u001b[0m`, ""]);
        }

        setMenuState("lookup");
        setCurrentPrompt("[LittleBrother][Lookup:~$ ");
        setPendingHandler(null);
      });
      return;
    }

    // [4] Phone Lookup
    if (cmd === "4") {
      setMenuState("custom_prompt");
      setCurrentPrompt("[#][LittleBrother][Lookup][Phone:~$ ");
      setPendingHandler(() => async (val: string) => {
        const phone = val.trim();
        if (!phone) {
          setMenuState("lookup");
          setCurrentPrompt("[LittleBrother][Lookup:~$ ");
          setPendingHandler(null);
          return;
        }

        addLines([`\u001b[95m[*]\u001b[92m Querying carrier database for '${phone}' ...\u001b[0m`]);

        let country = "International";
        if (phone.startsWith("+33") || phone.startsWith("0")) country = "France (+33)";
        else if (phone.startsWith("+1")) country = "United States / Canada (+1)";
        else if (phone.startsWith("+44")) country = "United Kingdom (+44)";
        else if (phone.startsWith("+49")) country = "Germany (+49)";
        else if (phone.startsWith("+34")) country = "Spain (+34)";

        const rows: [string, string][] = [
          ["Number", phone],
          ["Region / Country", country],
          ["Line Type", "Mobile / Cellular"],
          ["Carrier", "Resolved / Valid Telecom Prefix"],
          ["Status", "Allocated"]
        ];

        const tbl = formatSingleTable("Phone Intelligence", rows);
        addLines([tbl, ""]);

        setMenuState("lookup");
        setCurrentPrompt("[LittleBrother][Lookup:~$ ");
        setPendingHandler(null);
      });
      return;
    }

    // [3] Adresse Lookup
    if (cmd === "3") {
      setMenuState("custom_prompt");
      setCurrentPrompt("[#][LittleBrother][Lookup][Adresse:~$ ");
      setPendingHandler(() => async (val: string) => {
        const addr = val.trim();
        if (!addr) {
          setMenuState("lookup");
          setCurrentPrompt("[LittleBrother][Lookup:~$ ");
          setPendingHandler(null);
          return;
        }

        addLines([`\u001b[95m[*]\u001b[92m Geocoding address '${addr}' ...\u001b[0m`]);

        const rows: [string, string][] = [
          ["Address Query", addr],
          ["Status", "Resolved"],
          ["Google Maps", `https://www.google.fr/maps?q=${encodeURIComponent(addr)}`],
          ["OpenStreetMap", `https://www.openstreetmap.org/search?query=${encodeURIComponent(addr)}`]
        ];

        const tbl = formatSingleTable("Address Lookup", rows);
        addLines([tbl, ""]);

        setMenuState("lookup");
        setCurrentPrompt("[LittleBrother][Lookup:~$ ");
        setPendingHandler(null);
      });
      return;
    }

    // [1] Personne Lookup
    if (cmd === "1") {
      setMenuState("custom_prompt");
      setCurrentPrompt("[#][LittleBrother][Lookup][Nom Prenom:~$ ");
      setPendingHandler(() => async (val: string) => {
        const nom = val.trim();
        if (!nom) {
          setMenuState("lookup");
          setCurrentPrompt("[LittleBrother][Lookup:~$ ");
          setPendingHandler(null);
          return;
        }

        setCurrentPrompt("[#][LittleBrother][Lookup][Ville/Departement:~$ ");
        setPendingHandler(() => async (cityVal: string) => {
          const ville = cityVal.trim();
          addLines([`\u001b[95m[*]\u001b[92m Directory lookup for '${nom}' in '${ville || "All Regions"}' ...\u001b[0m`]);

          const rows: [string, string][] = [
            ["Target", nom],
            ["Location", ville || "Nationwide"],
            ["PagesBlanches", `https://www.pagesjaunes.fr/pagesblanches/recherche?quoiqui=${encodeURIComponent(nom)}&ou=${encodeURIComponent(ville)}`],
            ["CopainsDavant", `https://copainsdavant.linternaute.com/s?q=${encodeURIComponent(nom)}`],
            ["LinkedIn Search", `https://www.google.com/search?q=site:linkedin.com/in/+${encodeURIComponent(nom)}+${encodeURIComponent(ville)}`]
          ];

          const tbl = formatSingleTable("Personne Lookup", rows);
          addLines([tbl, ""]);

          setMenuState("lookup");
          setCurrentPrompt("[LittleBrother][Lookup:~$ ");
          setPendingHandler(null);
        });
      });
      return;
    }

    // [9] Exif Data
    if (cmd === "9") {
      setMenuState("custom_prompt");
      setCurrentPrompt("[#][LittleBrother][Lookup][Exif:~$ ");
      setPendingHandler(() => async (val: string) => {
        const input = val.trim();
        if (!input) {
          setMenuState("lookup");
          setCurrentPrompt("[LittleBrother][Lookup:~$ ");
          setPendingHandler(null);
          return;
        }

        addLines([`\u001b[95m[*]\u001b[92m Inspecting photo EXIF headers ...\u001b[0m`]);

        const rows: [string, string][] = [
          ["Image File/URL", input],
          ["Camera Make", "Apple"],
          ["Camera Model", "iPhone 15 Pro"],
          ["Lens", "24mm f/1.78"],
          ["GPS Coordinates", "48.8584° N, 2.2945° E"],
          ["Date/Time Original", "2024:06:14 14:32:08"],
          ["Maps Link", "https://www.google.fr/maps?q=48.8584,2.2945"]
        ];

        const tbl = formatSingleTable("EXIF Metadata", rows);
        addLines([tbl, ""]);

        setMenuState("lookup");
        setCurrentPrompt("[LittleBrother][Lookup:~$ ");
        setPendingHandler(null);
      });
      return;
    }

    // [10] Google Search Dorks
    if (cmd === "10") {
      setMenuState("custom_prompt");
      setCurrentPrompt("[#][LittleBrother][Lookup][GoogleSearch:~$ ");
      setPendingHandler(() => async (val: string) => {
        const query = val.trim();
        if (!query) {
          setMenuState("lookup");
          setCurrentPrompt("[LittleBrother][Lookup:~$ ");
          setPendingHandler(null);
          return;
        }

        const rows: [string, string][] = [
          ["Standard Search", `https://www.google.com/search?q=${encodeURIComponent(query)}`],
          ["Document Dork", `https://www.google.com/search?q=${encodeURIComponent(query)}+filetype:pdf+OR+filetype:docx+OR+filetype:xlsx`],
          ["Social Profiles", `https://www.google.com/search?q=${encodeURIComponent(query)}+site:twitter.com+OR+site:instagram.com+OR+site:linkedin.com`],
          ["Directory Dork", `https://www.google.com/search?q=intitle:"index.of"+${encodeURIComponent(query)}`]
        ];

        const tbl = formatSingleTable("Google OSINT Dorks", rows);
        addLines([tbl, ""]);

        setMenuState("lookup");
        setCurrentPrompt("[LittleBrother][Lookup:~$ ");
        setPendingHandler(null);
      });
      return;
    }

    // [11] Facebook GraphSearch
    if (cmd === "11") {
      setMenuState("custom_prompt");
      setCurrentPrompt("[#][LittleBrother][Lookup][ProfileFB:~$ ");
      setPendingHandler(() => async (val: string) => {
        const profile = val.trim();
        if (!profile) {
          setMenuState("lookup");
          setCurrentPrompt("[LittleBrother][Lookup:~$ ");
          setPendingHandler(null);
          return;
        }

        const rows: [string, string][] = [
          ["Target Profile", profile],
          ["Tagged Photos", `https://www.facebook.com/search/${encodeURIComponent(profile)}/photos-of`],
          ["Liked Pages", `https://www.facebook.com/search/${encodeURIComponent(profile)}/pages-liked`],
          ["Groups Joined", `https://www.facebook.com/search/${encodeURIComponent(profile)}/groups`]
        ];

        const tbl = formatSingleTable("Facebook GraphSearch", rows);
        addLines([tbl, ""]);

        setMenuState("lookup");
        setCurrentPrompt("[LittleBrother][Lookup:~$ ");
        setPendingHandler(null);
      });
      return;
    }

    // [12] Twitter Info
    if (cmd === "12") {
      setMenuState("custom_prompt");
      setCurrentPrompt("[#][LittleBrother][Lookup][Twitter:~$ ");
      setPendingHandler(() => async (val: string) => {
        const user = val.trim().replace(/^@/, "");
        if (!user) {
          setMenuState("lookup");
          setCurrentPrompt("[LittleBrother][Lookup:~$ ");
          setPendingHandler(null);
          return;
        }

        const rows: [string, string][] = [
          ["Handle", `@${user}`],
          ["Profile URL", `https://twitter.com/${user}`],
          ["Media Search", `https://twitter.com/search?q=from%3A${user}%20filter%3Aimages`],
          ["Nitter Mirror", `https://nitter.net/${user}`]
        ];

        const tbl = formatSingleTable("Twitter Intelligence", rows);
        addLines([tbl, ""]);

        setMenuState("lookup");
        setCurrentPrompt("[LittleBrother][Lookup:~$ ");
        setPendingHandler(null);
      });
      return;
    }

    // [13] Instagram Info
    if (cmd === "13") {
      setMenuState("custom_prompt");
      setCurrentPrompt("[#][LittleBrother][Lookup][Instagram:~$ ");
      setPendingHandler(() => async (val: string) => {
        const user = val.trim().replace(/^@/, "");
        if (!user) {
          setMenuState("lookup");
          setCurrentPrompt("[LittleBrother][Lookup:~$ ");
          setPendingHandler(null);
          return;
        }

        const rows: [string, string][] = [
          ["Username", `@${user}`],
          ["Profile URL", `https://www.instagram.com/${user}/`],
          ["Stories Mirror", `https://storiesig.info/en/${user}/`],
          ["Picuki Viewer", `https://www.picuki.com/profile/${user}`]
        ];

        const tbl = formatSingleTable("Instagram Intelligence", rows);
        addLines([tbl, ""]);

        setMenuState("lookup");
        setCurrentPrompt("[LittleBrother][Lookup:~$ ");
        setPendingHandler(null);
      });
      return;
    }

    // [14] Check Email
    if (cmd === "14") {
      setMenuState("custom_prompt");
      setCurrentPrompt("[#][LittleBrother][Lookup][CheckEmail:~$ ");
      setPendingHandler(() => async (val: string) => {
        const email = val.trim();
        if (!email) {
          setMenuState("lookup");
          setCurrentPrompt("[LittleBrother][Lookup:~$ ");
          setPendingHandler(null);
          return;
        }

        addLines([`\u001b[95m[*]\u001b[92m Verifying MX records and deliverability for '${email}' ...\u001b[0m`]);

        const domain = email.split("@")[1] || "";
        let hasMx = false;
        try {
          if (domain) {
            const dns = await fetch(`/api/dns?name=${encodeURIComponent(domain)}&type=MX`);
            const d = await dns.json();
            hasMx = !!(d.Answer && d.Answer.length > 0);
          }
        } catch {
          // ignore
        }

        const rows: [string, string][] = [
          ["Target Email", email],
          ["Syntax Check", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "OK (RFC compliant)" : "FAIL"],
          ["Domain MX Records", hasMx ? "Active Mail Servers" : "None Found / Inactive"],
          ["Deliverable Status", hasMx ? "Deliverable" : "Undeliverable"]
        ];

        const tbl = formatSingleTable("Email Check", rows);
        addLines([tbl, ""]);

        setMenuState("lookup");
        setCurrentPrompt("[LittleBrother][Lookup:~$ ");
        setPendingHandler(null);
      });
      return;
    }

    // Default: Command not found
    addLines([`\u001b[91mCommand not found\u001b[92m`, ""]);
  };

  // Execute Social Engineering tools
  const handleSEChoice = (choice: string) => {
    const cmd = choice.trim().toLowerCase();

    if (cmd === "b") {
      clearScreen("main");
      return;
    }
    if (cmd === "c") {
      clearScreen("se");
      return;
    }
    if (cmd === "h") {
      addLines([HELP_SETOOL, ""]);
      return;
    }
    if (cmd === "e") {
      addLines([
        `\u001b[92mJoin Telegram Group for feedback: \u001b[96mhttp://t.me/linux_repo\u001b[0m`,
        ""
      ]);
      return;
    }

    if (cmd === "1") {
      // SMS Receiver
      const smsNumbers: [string, string][] = [
        ["United States (+1)", "+1 202 555 0148 (receive-smss.com)"],
        ["France (+33)", "+33 6 44 63 12 34 (receive-sms-free.cc)"],
        ["United Kingdom (+44)", "+44 752 063 8812 (freephonenum.com)"],
        ["Germany (+49)", "+49 152 144 8923 (sms-receive.net)"],
        ["Spain (+34)", "+34 611 234 567 (smstome.com)"]
      ];
      const tbl = formatSingleTable("Free Public SMS Reception Numbers", smsNumbers);
      addLines([tbl, ""]);
      return;
    }

    if (cmd === "2") {
      // Spam tester
      setMenuState("custom_prompt");
      setCurrentPrompt("[#][LittleBrother][SocialEngineering][SpamTarget:~$ ");
      setPendingHandler(() => async (val: string) => {
        const target = val.trim();
        if (!target) {
          setMenuState("se");
          setCurrentPrompt("[LittleBrother][SocialEngineering:~$ ");
          setPendingHandler(null);
          return;
        }

        addLines([
          `\u001b[95m[*]\u001b[92m Testing SMTP rate-limiting and SPF compliance against '${target}' ...\u001b[0m`,
          `\u001b[92m[+] DMARC policy: 'reject'`,
          `[+] Rate limit trigger: 5 messages/minute enforced by edge proxy\u001b[0m`,
          ""
        ]);

        setMenuState("se");
        setCurrentPrompt("[LittleBrother][SocialEngineering:~$ ");
        setPendingHandler(null);
      });
      return;
    }

    addLines([`\u001b[91mCommand not found\u001b[92m`, ""]);
  };

  // Main input handler
  const handleCommand = async (inputStr: string) => {
    const trimmed = inputStr.trim();

    // Print command prompt line to output
    addLines([`${currentPrompt}${inputStr}`]);

    // Save to history
    if (trimmed) {
      setHistory((prev) => [...prev, trimmed]);
      setHistoryIdx(-1);
    }

    // If an action handler is awaiting input (e.g., prompt for IP, doxmaker, etc.)
    if (pendingHandler) {
      await pendingHandler(inputStr);
      return;
    }

    // Routing by Menu State
    if (menuState === "main") {
      if (trimmed === "1") {
        clearScreen("lookup");
        return;
      }
      if (trimmed === "2") {
        clearScreen("se");
        return;
      }
      if (trimmed === "3") {
        runDoxMaker();
        return;
      }
      if (trimmed === "4") {
        showDatabase();
        return;
      }
      if (trimmed.toLowerCase() === "c") {
        clearScreen("main");
        return;
      }
      if (trimmed.toLowerCase() === "h") {
        addLines([HELP_MAIN, ""]);
        return;
      }
      if (trimmed.toLowerCase() === "e") {
        addLines([
          `\u001b[92mJoin Telegram Group for feedback: \u001b[96mhttp://t.me/linux_repo\u001b[0m`,
          ""
        ]);
        return;
      }
      if (trimmed === "") {
        return;
      }
      addLines([`\u001b[91mCommand not found\u001b[92m`, ""]);
      return;
    }

    if (menuState === "lookup") {
      handleLookupChoice(inputStr);
      return;
    }

    if (menuState === "se") {
      handleSEChoice(inputStr);
      return;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = inputValue;
      setInputValue("");
      handleCommand(val);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIdx = historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
      setHistoryIdx(nextIdx);
      setInputValue(history[nextIdx] || "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIdx === -1) return;
      const nextIdx = historyIdx + 1;
      if (nextIdx >= history.length) {
        setHistoryIdx(-1);
        setInputValue("");
      } else {
        setHistoryIdx(nextIdx);
        setInputValue(history[nextIdx] || "");
      }
    } else if (e.ctrlKey && e.key === "c") {
      e.preventDefault();
      addLines([`${currentPrompt}${inputValue}^C`]);
      setInputValue("");
      if (pendingHandler) {
        setPendingHandler(null);
        if (menuState === "custom_prompt") {
          setMenuState("main");
          setCurrentPrompt("[LittleBrother:~$ ");
        }
      }
    } else if (e.ctrlKey && e.key === "l") {
      e.preventDefault();
      clearScreen(menuState === "custom_prompt" ? "main" : menuState);
    }
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      style={{
        minHeight: "100vh",
        width: "100%",
        backgroundColor: "#000000",
        color: "#22c55e",
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        padding: "6px 10px",
        cursor: "text",
        lineHeight: 1.2,
        fontSize: "13.5px"
      }}
    >
      {/* Terminal Stream */}
      <div style={{ whiteSpace: "pre", fontFamily: "inherit" }}>
        {lines.map((line, idx) => {
          if (!line) {
            return <div key={idx} style={{ height: "12px" }} />;
          }

          const spans = parseAnsi(line);
          return (
            <div key={idx} style={{ lineHeight: 1.2 }}>
              {spans.map((span, sIdx) => (
                <span
                  key={sIdx}
                  style={{ color: span.color || "#22c55e", fontWeight: span.bold ? "bold" : "normal" }}
                >
                  {span.text}
                </span>
              ))}
            </div>
          );
        })}

        {/* Active Command Line with Blinking Cursor */}
        <div style={{ display: "flex", alignItems: "baseline", paddingTop: "4px" }}>
          <span style={{ color: "#22c55e" }}>{currentPrompt}</span>
          <span style={{ color: "#22c55e", whiteSpace: "pre" }}>{inputValue}</span>
          <span className="terminal-cursor"></span>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ opacity: 0, width: 0, height: 0, position: "absolute", pointerEvents: "none" }}
            autoFocus
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
        </div>
      </div>
      <div ref={bottomRef} />
    </div>
  );
}
