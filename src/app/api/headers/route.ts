import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

interface HeaderHop {
  index: number;
  raw: string;
  from?: string;
  by?: string;
  with?: string;
  id?: string;
  date?: string;
  ips: string[];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawHeaders: string = body.headers || "";

    if (!rawHeaders || typeof rawHeaders !== "string") {
      return NextResponse.json({ error: "No email headers provided" }, { status: 400 });
    }

    const lines = rawHeaders.split(/\r?\n/);
    const parsed: Record<string, string> = {};
    const receivedHops: HeaderHop[] = [];
    const discoveredIps: Set<string> = new Set();

    let currentKey = "";
    let currentValue = "";

    for (const line of lines) {
      if (/^\s+[^\s]/.test(line) && currentKey) {
        // Continuation line (RFC 822 folding)
        currentValue += " " + line.trim();
      } else {
        if (currentKey) {
          if (currentKey.toLowerCase() === "received") {
            const ipRegex = /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g;
            const matches = currentValue.match(ipRegex) || [];
            matches.forEach((ip) => {
              if (!ip.startsWith("127.") && !ip.startsWith("10.") && !ip.startsWith("192.168.")) {
                discoveredIps.add(ip);
              }
            });
            receivedHops.push({
              index: receivedHops.length + 1,
              raw: currentValue,
              ips: matches
            });
          } else {
            parsed[currentKey] = currentValue;
          }
        }
        const colonIdx = line.indexOf(":");
        if (colonIdx > 0) {
          currentKey = line.substring(0, colonIdx).trim();
          currentValue = line.substring(colonIdx + 1).trim();
        } else {
          currentKey = "";
          currentValue = "";
        }
      }
    }

    // Process last header
    if (currentKey) {
      if (currentKey.toLowerCase() === "received") {
        const ipRegex = /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g;
        const matches = currentValue.match(ipRegex) || [];
        matches.forEach((ip) => {
          if (!ip.startsWith("127.") && !ip.startsWith("10.") && !ip.startsWith("192.168.")) {
            discoveredIps.add(ip);
          }
        });
        receivedHops.push({
          index: receivedHops.length + 1,
          raw: currentValue,
          ips: matches
        });
      } else {
        parsed[currentKey] = currentValue;
      }
    }

    return NextResponse.json({
      summary: {
        from: parsed["From"] || parsed["from"] || "Unknown",
        to: parsed["To"] || parsed["to"] || "Unknown",
        subject: parsed["Subject"] || parsed["subject"] || "Unknown",
        date: parsed["Date"] || parsed["date"] || "Unknown",
        messageId: parsed["Message-ID"] || parsed["Message-Id"] || parsed["message-id"] || "N/A",
        returnPath: parsed["Return-Path"] || parsed["return-path"] || "N/A",
        spf: parsed["Received-SPF"] || parsed["received-spf"] || "N/A",
        dkim: parsed["DKIM-Signature"] ? "Present" : "Not Found",
        dmarc: parsed["Authentication-Results"] || "N/A"
      },
      discoveredPublicIps: Array.from(discoveredIps),
      hops: receivedHops.reverse() // earliest hops first
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message || "Failed to parse headers" }, { status: 500 });
  }
}
