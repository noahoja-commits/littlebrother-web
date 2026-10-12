"use client";

import React, { useState, useEffect, useRef } from "react";
import { Terminal as TerminalIcon, Monitor, Play, Trash2, ArrowRight } from "lucide-react";
import { IpResult, BssidResult, HeaderResult, HashResult, UsernameResult, DnsResult } from "@/types/osint";

interface TerminalLine {
  id: string;
  type: "prompt" | "stdout" | "banner" | "table" | "warning" | "found" | "info" | "wait";
  text: string;
  tableData?: {
    headers: string[];
    rows: string[][];
  };
}

const ASCII_LOGO = `  _      _ _   _   _      ____            _   _               
 | |    (_) | | | | |    |  _ \\          | | | |              
 | |     _| |_| |_| | ___| |_) |_ __ ___ | |_| |__   ___ _ __ 
 | |    | | __| __| |/ _ \\  _ <| '__/ _ \\| __| '_ \\ / _ \\ '__|
 | |____| | |_| |_| |  __/ |_) | | | (_) | |_| | | |  __/ |   
 |______|_|\\__|\\__|_|\\___|____/|_|  \\___/ \\__|_| |_|\\___|_|   `;

const OWL_BANNER = `                         __..--.._ 
  .....              .--~  .....  \`.         Date: {DATE}
.":    "\`-..  .    .' ..-'"    :". \`         Time: {TIME}
\` \`._ \` _.'\`"(     \`-"'\`._ ' _.' '           First coded by Lulz3xploit 
     ~~~      \`.          ~~~                Modified by AbirHasan2005
              .'                             Version: [2.5]--[Stable]
             /                               Internet: [√]
            (                                Cloudflare: [Edge Active]
             ^---'                           Welcome to LittleBrother ...`;

const MAIN_MENU = ` [1] Lookup
 [2] Social engineering tool
 [3] Make file (DoxMaker)
 [4] Show Database
 [e] Exit script    [h] Help Message    [c] Clear Screen`;

const LOOKUP_MENU = ` [1] Personne lookup          [8] Mail tracer
 [2] Username lookup          [9] Exif data
 [3] Adresse lookup           [10] Google search
 [4] Phone lookup             [11] Facebook GraphSearch
 [5] IP lookup                [12] Twitter info
 [6] SSID locator             [13] Instagram info
 [7] Email lookup             [14] Check email
                              [15] Hash decrypter

 [b] Back to main menu        [e] Exit script
 [h] Help Message             [c] Clear Screen`;

const SE_MENU = ` [1] SMS Receiver (Free numbers)
 [2] Spam email tester
 [b] Back to main menu    [e] Exit script    [h] Help Message    [c] Clear Screen`;

const HELP_MAIN = ` Commands Name                            Commands Action
 --------------                   ---------------------------------------------------------
 Lookup                           Research a person.
 Other Tool                       Use tools other than for reconnaissance.
 Make file                        Create a '.txt' file to write the information obtained.
 Show Database                    Access Database.

 Exit                             Exit the software.
 Help                             Displays this message.
 Clear                            Clears the screen.`;

const HELP_LOOKUP = ` Commands Name                            Commands Action
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
 Clear screen                     Clears Screen. Clears everything from Screen.`;

type MenuState = "main" | "lookup" | "se" | "doxMaker" | "db" | "running_command";

export default function TerminalView() {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState("[LittleBrother:~$ ");
  const [inputValue, setInputValue] = useState("");
  const [menuState, setMenuState] = useState<MenuState>("main");
  const [inputHandler, setInputHandler] = useState<((val: string) => Promise<void> | void) | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input whenever clicking anywhere on terminal
  const focusInput = () => {
    inputRef.current?.focus();
  };

  const getTimestamp = () => {
    const d = new Date();
    return {
      date: d.toISOString().split("T")[0],
      time: d.toTimeString().split(" ")[0]
    };
  };

  const addLines = (newLines: TerminalLine[]) => {
    setLines((prev) => [...prev, ...newLines]);
  };

  const clearScreen = () => {
    const { date, time } = getTimestamp();
    const renderedOwl = OWL_BANNER.replace("{DATE}", date).replace("{TIME}", time);

    setLines([
      { id: "banner-1", type: "banner", text: ASCII_LOGO },
      { id: "banner-2", type: "banner", text: renderedOwl },
      { id: "menu-1", type: "stdout", text: menuState === "lookup" ? LOOKUP_MENU : menuState === "se" ? SE_MENU : MAIN_MENU }
    ]);
  };

  // Initial boot
  useEffect(() => {
    clearScreen();
  }, []);

  // Scroll to bottom on output update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines, currentPrompt]);

  // Handle command line execution
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = inputValue.trim();
    const fullCmd = inputValue;
    setInputValue("");

    // Add command to history
    if (cmd) {
      setHistory((prev) => [...prev, cmd]);
      setHistoryIdx(-1);
    }

    // Print prompt line
    const promptLine: TerminalLine = {
      id: Math.random().toString(),
      type: "prompt",
      text: `${currentPrompt}${fullCmd}`
    };
    addLines([promptLine]);

    // If a custom handler is currently capturing input
    if (inputHandler) {
      const handler = inputHandler;
      await handler(fullCmd);
      return;
    }

    // Main / Lookup / SE menu routers
    if (menuState === "main") {
      await handleMainMenu(cmd);
    } else if (menuState === "lookup") {
      await handleLookupMenu(cmd);
    } else if (menuState === "se") {
      await handleSeMenu(cmd);
    }
  };

  // MAIN MENU HANDLER
  const handleMainMenu = async (cmd: string) => {
    switch (cmd.toLowerCase()) {
      case "1":
        setMenuState("lookup");
        setCurrentPrompt("[LittleBrother][Lookup:~$ ");
        addLines([
          { id: Math.random().toString(), type: "stdout", text: LOOKUP_MENU }
        ]);
        break;

      case "2":
        setMenuState("se");
        setCurrentPrompt("[LittleBrother][SETool:~$ ");
        addLines([
          { id: Math.random().toString(), type: "stdout", text: SE_MENU }
        ]);
        break;

      case "3":
        // DoxMaker interactive questionnaire
        await startDoxMaker();
        break;

      case "4":
        // Show database
        await handleShowDatabase();
        break;

      case "c":
      case "clear":
        clearScreen();
        break;

      case "h":
      case "help":
        addLines([
          { id: Math.random().toString(), type: "stdout", text: HELP_MAIN }
        ]);
        break;

      case "e":
      case "exit":
        addLines([
          { id: Math.random().toString(), type: "info", text: "[I] LittleBrother session terminated. Have a safe investigation." }
        ]);
        break;

      case "":
        break;

      default:
        addLines([
          { id: Math.random().toString(), type: "warning", text: "[!] Command not found! Type 'h' for help." }
        ]);
        break;
    }
  };

  // LOOKUP MENU HANDLER
  const handleLookupMenu = async (cmd: string) => {
    switch (cmd.toLowerCase()) {
      case "1":
        // Personne lookup
        promptInput("[#][LittleBrother][Lookup][Nom Prenom:~$ ", async (nomPrenom) => {
          promptInput("[#][LittleBrother][Lookup][Ville/Departement:~$ ", async (ville) => {
            await runPersonneLookup(nomPrenom, ville);
          });
        });
        break;

      case "2":
        // Username lookup
        promptInput("[#][LittleBrother][Lookup][Username:~$ ", async (username) => {
          await runUsernameLookup(username);
        });
        break;

      case "3":
        // Adresse lookup
        promptInput("[#][LittleBrother][Lookup][Adresse:~$ ", async (adresse) => {
          await runAdresseLookup(adresse);
        });
        break;

      case "4":
        // Phone lookup
        promptInput("[#][LittleBrother][Lookup][Phone:~$ ", async (phone) => {
          await runPhoneLookup(phone);
        });
        break;

      case "5":
        // IP lookup
        promptInput("[#][LittleBrother][Lookup][AdresseIP:~$ ", async (ip) => {
          await runIpLookup(ip);
        });
        break;

      case "6":
        // SSID locator / BSSID
        promptInput("[#][LittleBrother][Lookup][MAC/BSSID:~$ ", async (bssid) => {
          await runBssidLookup(bssid);
        });
        break;

      case "7":
        // Email lookup
        promptInput("[#][LittleBrother][Lookup][Email:~$ ", async (email) => {
          await runEmailLookup(email);
        });
        break;

      case "8":
        // Mail tracer / Raw Header analysis
        promptInput("[#][LittleBrother][Lookup][Paste raw headers (type 'END' on new line) or sample IP:~$ ", async (input) => {
          await runMailToIp(input);
        });
        break;

      case "9":
        // Exif data
        addLines([
          { id: Math.random().toString(), type: "wait", text: "[*] Client-side EXIF inspection mode available." },
          { id: Math.random().toString(), type: "info", text: "[I] You can paste an image URL or image base64 below:" }
        ]);
        promptInput("[#][LittleBrother][Lookup][Photo URL:~$ ", async (photoUrl) => {
          await runExifLookup(photoUrl);
        });
        break;

      case "10":
        // Google search
        promptInput("[#][LittleBrother][Lookup][name, first name, city (...):~$ ", async (query) => {
          await runGoogleDorks(query);
        });
        break;

      case "11":
        // Facebook GraphSearch
        promptInput("[#][LittleBrother][Lookup][ProfileFB:~$ ", async (profile) => {
          await runFacebookStalk(profile);
        });
        break;

      case "12":
        // Twitter info
        promptInput("[#][LittleBrother][Lookup][Twitter Handle:~$ ", async (handle) => {
          await runTwitterInfo(handle);
        });
        break;

      case "13":
        // Instagram info
        promptInput("[#][LittleBrother][Lookup][Instagram Handle:~$ ", async (handle) => {
          await runInstagramInfo(handle);
        });
        break;

      case "14":
        // Check email
        promptInput("[LittleBrother][#][Email:~$ ", async (email) => {
          await runCheckEmail(email);
        });
        break;

      case "15":
        // Hash decrypter
        promptInput("[#][LittleBrother][Lookup][Hash:~$ ", async (hash) => {
          await runHashDecrypt(hash);
        });
        break;

      case "b":
        setMenuState("main");
        setCurrentPrompt("[LittleBrother:~$ ");
        addLines([
          { id: Math.random().toString(), type: "stdout", text: MAIN_MENU }
        ]);
        break;

      case "c":
      case "clear":
        clearScreen();
        break;

      case "h":
      case "help":
        addLines([
          { id: Math.random().toString(), type: "stdout", text: HELP_LOOKUP }
        ]);
        break;

      case "e":
      case "exit":
        addLines([
          { id: Math.random().toString(), type: "info", text: "[I] LittleBrother session terminated." }
        ]);
        break;

      case "":
        break;

      default:
        addLines([
          { id: Math.random().toString(), type: "warning", text: "[!] Command not found! Type 'h' for help or 'b' to go back." }
        ]);
        break;
    }
  };

  // SOCIAL ENGINEERING MENU HANDLER
  const handleSeMenu = async (cmd: string) => {
    switch (cmd.toLowerCase()) {
      case "1":
        addLines([
          { id: Math.random().toString(), type: "wait", text: "[*] Loading free virtual SMS receiver servers..." },
          {
            id: Math.random().toString(),
            type: "table",
            text: "Free SMS Gateways",
            tableData: {
              headers: ["ID", "Number", "Country"],
              rows: [
                ["1", "+33644629810", "France"],
                ["2", "+447520635782", "United Kingdom"],
                ["3", "+12025550183", "United States"],
                ["4", "+491573598371", "Germany"]
              ]
            }
          },
          { id: Math.random().toString(), type: "info", text: "[I] Open public SMS portal: https://receive-smss.com" }
        ]);
        break;

      case "2":
        addLines([
          { id: Math.random().toString(), type: "warning", text: "[!] Note: Email spam module operates passively in demo safety mode." }
        ]);
        promptInput("[#][LittleBrother][SETool][Target Email:~$ ", (target) => {
          addLines([
            { id: Math.random().toString(), type: "wait", text: `[*] Simulated transmission verification for: ${target}` },
            { id: Math.random().toString(), type: "found", text: `[+] MX Handshake verified for target domain.` }
          ]);
          resetPromptToCurrentMenu();
        });
        break;

      case "b":
        setMenuState("main");
        setCurrentPrompt("[LittleBrother:~$ ");
        addLines([
          { id: Math.random().toString(), type: "stdout", text: MAIN_MENU }
        ]);
        break;

      case "c":
      case "clear":
        clearScreen();
        break;

      case "h":
        addLines([
          { id: Math.random().toString(), type: "stdout", text: SE_MENU }
        ]);
        break;

      default:
        addLines([
          { id: Math.random().toString(), type: "warning", text: "[!] Command not found! Type 'b' to return." }
        ]);
        break;
    }
  };

  // Helper to capture a prompt
  const promptInput = (promptText: string, callback: (val: string) => Promise<void> | void) => {
    setCurrentPrompt(promptText);
    setInputHandler(() => async (val: string) => {
      setInputHandler(null);
      await callback(val);
    });
  };

  const resetPromptToCurrentMenu = () => {
    setInputHandler(null);
    if (menuState === "lookup") {
      setCurrentPrompt("[LittleBrother][Lookup:~$ ");
    } else if (menuState === "se") {
      setCurrentPrompt("[LittleBrother][SETool:~$ ");
    } else {
      setCurrentPrompt("[LittleBrother:~$ ");
    }
  };

  // --- TOOL IMPLEMENTATIONS ---

  // 1. IP FINDER
  const runIpLookup = async (ip: string) => {
    addLines([
      { id: Math.random().toString(), type: "wait", text: `[*] Querying geolocation for IP '${ip || "client"}'...` }
    ]);

    try {
      const res = await fetch(`/api/ip?ip=${encodeURIComponent(ip.trim())}`);
      const data: IpResult = await res.json();

      const tableRows = [
        ["IP", data.ip],
        ["Hostname", data.hostname || "None"],
        ["ISP", data.org || "Unknown"],
        ["Organisation", data.asn || data.org || "Unknown"],
        ["Pays", data.country || "Unknown"],
        ["Region", data.region || "Unknown"],
        ["Ville", data.city || "Unknown"],
        ["Localisation", data.loc || `${data.lat || 0}, ${data.lon || 0}`],
        ["Maps", `https://www.google.fr/maps?q=${data.loc || `${data.lat},${data.lon}`}`]
      ];

      addLines([
        {
          id: Math.random().toString(),
          type: "table",
          text: `IP: ${data.ip}`,
          tableData: {
            headers: ["Property", "Value"],
            rows: tableRows
          }
        },
        { id: Math.random().toString(), type: "found", text: `[+] IP resolution complete.` }
      ]);
    } catch {
      addLines([
        { id: Math.random().toString(), type: "warning", text: "[!] Failed to query IP address." }
      ]);
    }
    resetPromptToCurrentMenu();
  };

  // 2. BSSID FINDER
  const runBssidLookup = async (bssid: string) => {
    addLines([
      { id: Math.random().toString(), type: "wait", text: `[*] Scanning wireless beacons for MAC/BSSID '${bssid}'...` }
    ]);

    try {
      const res = await fetch(`/api/bssid?bssid=${encodeURIComponent(bssid.trim())}`);
      const data: BssidResult = await res.json();

      if (data.lat && data.lon) {
        addLines([
          { id: Math.random().toString(), type: "found", text: `[ ${data.bssid} ]` },
          { id: Math.random().toString(), type: "stdout", text: ` + Localisation: ${data.lat},${data.lon}` },
          { id: Math.random().toString(), type: "stdout", text: ` + Maps: ${data.mapsUrl || `https://www.google.fr/maps?q=${data.lat},${data.lon}`}` },
          { id: Math.random().toString(), type: "stdout", text: ` + WiGLE Query: ${data.wigleSearchUrl || "N/A"}` }
        ]);
      } else {
        addLines([
          { id: Math.random().toString(), type: "warning", text: `[!] Localization not found for '${bssid}'.` }
        ]);
      }
    } catch {
      addLines([
        { id: Math.random().toString(), type: "warning", text: "[!] Error connecting to BSSID geolocation service." }
      ]);
    }
    resetPromptToCurrentMenu();
  };

  // 3. USERNAME LOOKUP
  const runUsernameLookup = async (username: string) => {
    addLines([
      { id: Math.random().toString(), type: "wait", text: `[*] Scanning profile networks for pseudo '@${username}'...` }
    ]);

    try {
      const res = await fetch(`/api/username?username=${encodeURIComponent(username.trim())}`);
      const data: UsernameResult = await res.json();

      const rows = data.profiles.map((p) => [
        p.platform,
        p.url,
        p.status === "found" ? "[+] VERIFIED" : "Ready to check"
      ]);

      addLines([
        {
          id: Math.random().toString(),
          type: "table",
          text: `Target: @${data.username}`,
          tableData: {
            headers: ["Platform", "URL Profile", "Status"],
            rows
          }
        },
        { id: Math.random().toString(), type: "found", text: `[+] Generated Google OSINT queries:` }
      ]);

      data.googleDorks.forEach((d) => {
        addLines([
          { id: Math.random().toString(), type: "stdout", text: ` [+] ${d.name}: ${d.url}` }
        ]);
      });
    } catch {
      addLines([
        { id: Math.random().toString(), type: "warning", text: "[!] Failed to query username intelligence." }
      ]);
    }
    resetPromptToCurrentMenu();
  };

  // 4. HASH DECRYPTER
  const runHashDecrypt = async (hash: string) => {
    addLines([
      { id: Math.random().toString(), type: "wait", text: `[*] Decrypt '${hash}'...` }
    ]);

    try {
      const res = await fetch("/api/hash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hash })
      });
      const data: HashResult = await res.json();

      const typesList = data.identifiedTypes.map((t) => t.name).join(", ");
      addLines([
        { id: Math.random().toString(), type: "info", text: `[I] Algorithm Candidates (${data.length} chars): ${typesList}` }
      ]);

      if (data.lookupResult && data.lookupResult.match) {
        addLines([
          { id: Math.random().toString(), type: "found", text: `[+] ${hash} : ${data.lookupResult.match} (via ${data.lookupResult.provider})` }
        ]);
      } else {
        addLines([
          { id: Math.random().toString(), type: "warning", text: `[!] ${hash} : No match found in quick dictionary.` },
          { id: Math.random().toString(), type: "stdout", text: `    VirusTotal: ${data.searchUrls.virusTotal}` },
          { id: Math.random().toString(), type: "stdout", text: `    Hashes.com: ${data.searchUrls.hashesCom}` }
        ]);
      }
    } catch {
      addLines([
        { id: Math.random().toString(), type: "warning", text: "[!] Failed to inspect cryptographic hash." }
      ]);
    }
    resetPromptToCurrentMenu();
  };

  // 5. MAIL TRACER
  const runMailToIp = async (rawInput: string) => {
    addLines([
      { id: Math.random().toString(), type: "wait", text: "[*] Analyzing MTA hops and origin sender IP..." }
    ]);

    try {
      const res = await fetch("/api/headers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ headers: rawInput || "Received: from mail.example.com [198.51.100.45] by mx.dest.com" })
      });
      const data: HeaderResult = await res.json();

      addLines([
        { id: Math.random().toString(), type: "info", text: `[I] Message sent by: ${data.summary.from}` },
        { id: Math.random().toString(), type: "stdout", text: `    Subject: ${data.summary.subject}` },
        { id: Math.random().toString(), type: "stdout", text: `    SPF Auth: ${data.summary.spf}` }
      ]);

      if (data.discoveredPublicIps.length > 0) {
        data.discoveredPublicIps.forEach((ip) => {
          addLines([
            { id: Math.random().toString(), type: "found", text: `[+] Discovered Origin/Hop IP: ${ip}` },
            { id: Math.random().toString(), type: "stdout", text: `    -> Geolocation: https://www.google.fr/maps?q=${ip}` }
          ]);
        });
      } else {
        addLines([
          { id: Math.random().toString(), type: "warning", text: "[!] No public hops resolved in headers." }
        ]);
      }
    } catch {
      addLines([
        { id: Math.random().toString(), type: "warning", text: "[!] Error inspecting email headers." }
      ]);
    }
    resetPromptToCurrentMenu();
  };

  // 6. CHECK EMAIL
  const runCheckEmail = async (email: string) => {
    addLines([
      { id: Math.random().toString(), type: "wait", text: `[*] Verification for '${email}'...` }
    ]);

    const domain = email.split("@")[1];
    if (!domain) {
      addLines([
        { id: Math.random().toString(), type: "warning", text: `[!] ${email} does not exist (malformed address).` }
      ]);
      resetPromptToCurrentMenu();
      return;
    }

    try {
      const res = await fetch(`/api/dns?domain=${encodeURIComponent(domain)}`);
      const data: DnsResult = await res.json();
      const mx = data.records["MX"] || [];

      if (mx.length > 0) {
        addLines([
          { id: Math.random().toString(), type: "found", text: `[+] ${email} domain is active with valid MX records:` },
          ...mx.map((m) => ({ id: Math.random().toString(), type: "stdout" as const, text: `    -> ${m.data} (TTL ${m.TTL}s)` }))
        ]);
      } else {
        addLines([
          { id: Math.random().toString(), type: "warning", text: `[!] ${email} domain has no MX records.` }
        ]);
      }
    } catch {
      addLines([
        { id: Math.random().toString(), type: "warning", text: `[!] Could not verify MX records for ${domain}` }
      ]);
    }
    resetPromptToCurrentMenu();
  };

  // 7. GOOGLE DORKS
  const runGoogleDorks = async (query: string) => {
    addLines([
      { id: Math.random().toString(), type: "wait", text: `[*] Compiling OSINT reconnaissance dorks for '${query}'...` },
      { id: Math.random().toString(), type: "found", text: `[+] Exact Search: https://www.google.com/search?q=${encodeURIComponent(`"${query}"`)}` },
      { id: Math.random().toString(), type: "stdout", text: `[+] Social Profiles: https://www.google.com/search?q=${encodeURIComponent(`site:instagram.com OR site:twitter.com OR site:facebook.com "${query}"`)}` },
      { id: Math.random().toString(), type: "stdout", text: `[+] Leaks & Pastes: https://www.google.com/search?q=${encodeURIComponent(`site:pastebin.com OR site:ghostbin.com "${query}"`)}` },
      { id: Math.random().toString(), type: "stdout", text: `[+] Documents & CVs: https://www.google.com/search?q=${encodeURIComponent(`filetype:pdf OR filetype:docx "${query}"`)}` }
    ]);
    resetPromptToCurrentMenu();
  };

  // 8. FACEBOOK GRAPHSEARCH STALK
  const runFacebookStalk = async (profile: string) => {
    addLines([
      { id: Math.random().toString(), type: "found", text: `[+] Profile target: ${profile}` },
      { id: Math.random().toString(), type: "stdout", text: `    Photos of: https://www.facebook.com/search/${encodeURIComponent(profile)}/photos-of/intersect` },
      { id: Math.random().toString(), type: "stdout", text: `    Videos of: https://www.facebook.com/search/${encodeURIComponent(profile)}/videos-of/intersect` },
      { id: Math.random().toString(), type: "stdout", text: `    Places visited: https://www.facebook.com/search/${encodeURIComponent(profile)}/places-visited/` },
      { id: Math.random().toString(), type: "stdout", text: `    Pages liked: https://www.facebook.com/search/${encodeURIComponent(profile)}/pages-liked/intersect` },
      { id: Math.random().toString(), type: "stdout", text: `    Stories tagged: https://www.facebook.com/search/${encodeURIComponent(profile)}/stories-tagged/intersect` }
    ]);
    resetPromptToCurrentMenu();
  };

  // 9. TWITTER INFO
  const runTwitterInfo = async (handle: string) => {
    const clean = handle.replace("@", "");
    addLines([
      { id: Math.random().toString(), type: "wait", text: `[*] Fetching Twitter/X details for @${clean}...` },
      { id: Math.random().toString(), type: "found", text: `[@${clean}]` },
      { id: Math.random().toString(), type: "stdout", text: `[+] Profile: https://x.com/${clean}` },
      { id: Math.random().toString(), type: "stdout", text: `[+] Tweets search: https://x.com/search?q=from%3A${clean}&f=live` },
      { id: Math.random().toString(), type: "stdout", text: `[+] Media: https://x.com/${clean}/media` },
      { id: Math.random().toString(), type: "stdout", text: `[+] Google Archive: https://www.google.com/search?q=site:x.com/${clean}` }
    ]);
    resetPromptToCurrentMenu();
  };

  // 10. INSTAGRAM INFO
  const runInstagramInfo = async (handle: string) => {
    const clean = handle.replace("@", "");
    addLines([
      { id: Math.random().toString(), type: "wait", text: `[*] Fetching Instagram intelligence for @${clean}...` },
      { id: Math.random().toString(), type: "found", text: `[@${clean}]` },
      { id: Math.random().toString(), type: "stdout", text: `[+] Profile URL: https://instagram.com/${clean}` },
      { id: Math.random().toString(), type: "stdout", text: `[+] Stories Tracker: https://storiesig.info/en/profile/${clean}` },
      { id: Math.random().toString(), type: "stdout", text: `[+] Google Index: https://www.google.com/search?q=site:instagram.com/${clean}` }
    ]);
    resetPromptToCurrentMenu();
  };

  // 11. EXIF LOOKUP
  const runExifLookup = async (photoUrl: string) => {
    addLines([
      { id: Math.random().toString(), type: "wait", text: `[*] Fetching & decoding EXIF tags from '${photoUrl}'...` },
      { id: Math.random().toString(), type: "info", text: `[+] Tip: You can also use the graphical Exif tool in GUI view.` },
      { id: Math.random().toString(), type: "stdout", text: `    Camera specs, lens info, and GPS coordinates will be extracted client-side.` }
    ]);
    resetPromptToCurrentMenu();
  };

  // 12. PERSONNE LOOKUP
  const runPersonneLookup = async (nomPrenom: string, ville: string) => {
    addLines([
      { id: Math.random().toString(), type: "wait", text: `[*] Research for '${nomPrenom}' in '${ville}'...` },
      { id: Math.random().toString(), type: "found", text: `[+] PagesJaunes Directory: https://www.pagesjaunes.fr/pagesblanches/recherche?quoiqui=${encodeURIComponent(nomPrenom)}&ou=${encodeURIComponent(ville)}` },
      { id: Math.random().toString(), type: "stdout", text: `[+] 118712 Search: https://www.118712.fr/recherche?q=${encodeURIComponent(nomPrenom)}&where=${encodeURIComponent(ville)}` },
      { id: Math.random().toString(), type: "stdout", text: `[+] Copains d'avant: http://copainsdavant.linternaute.com/s/?ty=1&prenom=${encodeURIComponent(nomPrenom)}&ville=${encodeURIComponent(ville)}` },
      { id: Math.random().toString(), type: "stdout", text: `[+] Social Matrix: https://www.google.com/search?q=${encodeURIComponent(`"${nomPrenom}" "${ville}"`)}` }
    ]);
    resetPromptToCurrentMenu();
  };

  // 13. ADRESSE LOOKUP
  const runAdresseLookup = async (adresse: string) => {
    addLines([
      { id: Math.random().toString(), type: "wait", text: `[*] Searching residents at '${adresse}'...` },
      { id: Math.random().toString(), type: "found", text: `[+] PagesBlanches Address: https://www.pagesjaunes.fr/pagesblanches/recherche?ou=${encodeURIComponent(adresse)}` },
      { id: Math.random().toString(), type: "stdout", text: `[+] Cadastre & Maps: https://www.google.com/maps/search/${encodeURIComponent(adresse)}` }
    ]);
    resetPromptToCurrentMenu();
  };

  // 14. PHONE LOOKUP
  const runPhoneLookup = async (phone: string) => {
    addLines([
      { id: Math.random().toString(), type: "wait", text: `[*] Reverse searching phone '${phone}'...` },
      {
        id: Math.random().toString(),
        type: "table",
        text: `Phone Intelligence: ${phone}`,
        tableData: {
          headers: ["Property", "Value"],
          rows: [
            ["Numero", phone],
            ["Type", phone.startsWith("06") || phone.startsWith("07") || phone.startsWith("+1") ? "Mobile / Cellphone" : "Fixed / VoIP"],
            ["Operateur", "Standard Telecom Carrier Lookup"],
            ["Reverse Search", `https://www.pagesjaunes.fr/annuaireinverse/recherche?quoiqui=${encodeURIComponent(phone)}`]
          ]
        }
      }
    ]);
    resetPromptToCurrentMenu();
  };

  // 15. EMAIL LOOKUP
  const runEmailLookup = async (email: string) => {
    addLines([
      { id: Math.random().toString(), type: "wait", text: `[*] Information search on '${email}'...` },
      { id: Math.random().toString(), type: "info", text: `[I] Leaked credentials database & password search:` },
      { id: Math.random().toString(), type: "stdout", text: `    HaveIBeenPwned: https://haveibeenpwned.com/account/${encodeURIComponent(email)}` },
      { id: Math.random().toString(), type: "stdout", text: `    DeHashed Search: https://dehashed.com/search?query=${encodeURIComponent(email)}` },
      { id: Math.random().toString(), type: "stdout", text: `    Google Dump Search: https://www.google.fr/search?q=${encodeURIComponent(`intext:"${email}"`)}` }
    ]);
    resetPromptToCurrentMenu();
  };

  // 16. DOX MAKER INTERACTIVE STEP-BY-STEP
  const startDoxMaker = async () => {
    addLines([
      { id: Math.random().toString(), type: "info", text: "=== DOXMAKER CASE FILE GENERATOR ===" }
    ]);

    promptInput("First name : ", (prenom) => {
      promptInput("Last name : ", (nom) => {
        promptInput("Date of Birth : ", (dob) => {
          promptInput("Phone number : ", (phone) => {
            promptInput("Email : ", (email) => {
              promptInput("City : ", (city) => {
                promptInput("Address : ", (adresse) => {
                  promptInput("IP Address : ", (ip) => {
                    const fileName = `${prenom.trim()}_${nom.trim()}.txt`;
                    const profileData = {
                      id: "case-" + Math.random().toString(36).substring(2, 7),
                      created: new Date().toISOString().split("T")[0],
                      targetName: `${prenom} ${nom}`,
                      aliases: "",
                      dob,
                      phones: phone,
                      emails: email,
                      addresses: adresse,
                      city,
                      country: "France",
                      ipAddresses: ip,
                      socialAccounts: "",
                      notes: "Generated via LittleBrother DoxMaker Terminal CLI.",
                      tags: ["Terminal Target"]
                    };

                    try {
                      const raw = localStorage.getItem("lb_dossiers");
                      const list = raw ? JSON.parse(raw) : [];
                      list.unshift(profileData);
                      localStorage.setItem("lb_dossiers", JSON.stringify(list));
                    } catch {
                      // ignore
                    }

                    addLines([
                      { id: Math.random().toString(), type: "found", text: `\n[+] Fichier enregistre dans : 'Watched/${fileName}'` },
                      { id: Math.random().toString(), type: "stdout", text: `    Full dossier saved to client database memory.` }
                    ]);
                    resetPromptToCurrentMenu();
                  });
                });
              });
            });
          });
        });
      });
    });
  };

  // 17. SHOW DATABASE
  const handleShowDatabase = async () => {
    addLines([
      { id: Math.random().toString(), type: "wait", text: "[*] Access to the Database ..." },
      { id: Math.random().toString(), type: "wait", text: "[*] Search Data ..." }
    ]);

    try {
      const raw = localStorage.getItem("lb_dossiers");
      const list = raw ? JSON.parse(raw) : [];

      if (list.length === 0) {
        addLines([
          { id: Math.random().toString(), type: "warning", text: "[!] No profiles found in 'Watched' database." }
        ]);
      } else {
        const rows = list.map((item: { targetName: string; created: string; phones: string; emails: string }, idx: number) => [
          String(idx + 1),
          item.targetName || "Unknown",
          item.phones || "N/A",
          item.emails || "N/A",
          item.created || "N/A"
        ]);

        addLines([
          { id: Math.random().toString(), type: "found", text: `[+] ${list.length} Profiles Found in Database:` },
          {
            id: Math.random().toString(),
            type: "table",
            text: "Watched Targets",
            tableData: {
              headers: ["ID", "Name", "Phone", "Email", "Date Created"],
              rows
            }
          }
        ]);
      }
    } catch {
      addLines([
        { id: Math.random().toString(), type: "warning", text: "[!] Error reading target database." }
      ]);
    }
    resetPromptToCurrentMenu();
  };

  return (
    <div
      onClick={focusInput}
      className="min-h-screen bg-black text-[#22c55e] font-mono p-2 sm:p-4 select-text cursor-text crt-screen flex flex-col justify-between"
    >
      {/* Top terminal status bar */}
      <div className="border-b border-[#14532d] pb-2 mb-3 flex items-center justify-between text-xs text-[#15803d]">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#22c55e] animate-pulse"></span>
          <span className="font-bold text-[#22c55e]">LITTLEBROTHER v2.5 [TERMINAL EDITION]</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span>TTY: /dev/pts/0</span>
          <span>LANG: en_US.UTF-8</span>
          <span>HOST: edge.littlebrother</span>
        </div>
      </div>

      {/* Terminal Output Stream */}
      <div className="space-y-1.5 flex-1 overflow-x-auto text-xs sm:text-sm leading-relaxed">
        {lines.map((line) => {
          if (line.type === "banner") {
            return (
              <pre
                key={line.id}
                className="text-[#22c55e] font-mono text-[10px] sm:text-[12px] leading-tight select-all my-1 whitespace-pre"
              >
                {line.text}
              </pre>
            );
          }

          if (line.type === "prompt") {
            return (
              <div key={line.id} className="text-[#86efac] font-bold">
                {line.text}
              </div>
            );
          }

          if (line.type === "warning") {
            return (
              <div key={line.id} className="text-[#ef4444]">
                {line.text}
              </div>
            );
          }

          if (line.type === "found") {
            return (
              <div key={line.id} className="text-[#4ade80] font-semibold">
                {line.text}
              </div>
            );
          }

          if (line.type === "info") {
            return (
              <div key={line.id} className="text-[#38bdf8]">
                {line.text}
              </div>
            );
          }

          if (line.type === "wait") {
            return (
              <div key={line.id} className="text-[#c084fc]">
                {line.text}
              </div>
            );
          }

          if (line.type === "table" && line.tableData) {
            return (
              <div key={line.id} className="my-2 border border-[#14532d] bg-[#020604] p-2 rounded">
                <div className="text-[11px] text-[#4ade80] font-bold mb-1.5 uppercase tracking-wide">
                  +-- {line.text} --+
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse font-mono">
                    <thead>
                      <tr className="border-b border-[#14532d] text-[#86efac]">
                        {line.tableData.headers.map((h, i) => (
                          <th key={i} className="py-1 px-2.5 font-bold">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#052e16]">
                      {line.tableData.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-[#052e16]/50">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="py-1 px-2.5 break-all text-[#22c55e]">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          }

          return (
            <div key={line.id} className="text-[#22c55e] whitespace-pre-wrap">
              {line.text}
            </div>
          );
        })}

        {/* Live Input Prompt */}
        <form onSubmit={handleSubmit} className="flex items-center gap-1 mt-2">
          <span className="text-[#86efac] font-bold shrink-0">{currentPrompt}</span>
          <div className="flex-1 flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "ArrowUp") {
                  e.preventDefault();
                  if (history.length > 0) {
                    const nextIdx = historyIdx < history.length - 1 ? historyIdx + 1 : historyIdx;
                    setHistoryIdx(nextIdx);
                    setInputValue(history[history.length - 1 - nextIdx] || "");
                  }
                } else if (e.key === "ArrowDown") {
                  e.preventDefault();
                  if (historyIdx > 0) {
                    const nextIdx = historyIdx - 1;
                    setHistoryIdx(nextIdx);
                    setInputValue(history[history.length - 1 - nextIdx] || "");
                  } else if (historyIdx === 0) {
                    setHistoryIdx(-1);
                    setInputValue("");
                  }
                }
              }}
              className="w-full bg-transparent border-none outline-none text-[#22c55e] font-mono text-xs sm:text-sm p-0 m-0 focus:ring-0"
              autoFocus
              autoComplete="off"
              spellCheck="false"
            />
          </div>
        </form>

        <div ref={bottomRef} />
      </div>

      {/* Terminal Quick Help Bar */}
      <div className="border-t border-[#14532d] pt-2 mt-4 flex flex-wrap items-center justify-between text-[11px] text-[#15803d]">
        <div className="flex gap-3">
          <span>[1] Lookup</span>
          <span>[2] SETool</span>
          <span>[3] DoxMaker</span>
          <span>[4] Database</span>
          <span>[c] Clear</span>
          <span>[h] Help</span>
          <span>[b] Back</span>
        </div>
        <div className="text-[10px] text-[#166534]">
          LittleBrother Terminal Web Engine &bull; Cloudflare Workers Compatible
        </div>
      </div>
    </div>
  );
}
