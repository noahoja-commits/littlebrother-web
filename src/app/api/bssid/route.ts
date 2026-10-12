import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bssidRaw = searchParams.get("bssid")?.trim();

    if (!bssidRaw) {
      return NextResponse.json({ error: "Missing BSSID / MAC address parameter" }, { status: 400 });
    }

    // Format BSSID: e.g. 00:11:22:33:44:55 or 00-11-22-33-44-55
    const cleanBssid = bssidRaw.replace(/[^a-fA-F0-9]/g, "").toUpperCase();
    if (cleanBssid.length !== 12) {
      return NextResponse.json(
        { error: "Invalid MAC/BSSID format. Expected 12 hex characters (e.g., 00:14:22:01:23:45)." },
        { status: 400 }
      );
    }

    const formatted = cleanBssid.match(/.{1,2}/g)?.join(":") || bssidRaw;

    // Check mylnikov open wifi geolocation API (used by original LittleBrother)
    const mylnikovUrl = `https://api.mylnikov.org/geolocation/wifi?v=1.1&data=open&bssid=${formatted}`;
    try {
      const res = await fetch(mylnikovUrl, {
        headers: { "User-Agent": "LittleBrother-Cloudflare/1.0" },
        signal: AbortSignal.timeout(4000)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.result === 200 && json.data) {
          return NextResponse.json({
            bssid: formatted,
            source: "mylnikov-open",
            lat: json.data.lat,
            lon: json.data.lon,
            range: json.data.range || 50,
            address: json.data.address || "Approximate Wi-Fi Location Found",
            mapsUrl: `https://www.google.com/maps?q=${json.data.lat},${json.data.lon}`
          });
        }
      }
    } catch {
      // fallback
    }

    // Fallback response with helpful information
    return NextResponse.json({
      bssid: formatted,
      vendorLookup: `https://maclookup.app/search/${formatted}`,
      wigleSearchUrl: `https://wigle.net/search?netid=${formatted}`,
      mapsUrl: null,
      message: "BSSID is valid format. Open database record not found or Wi-Fi network not cataloged publicly in open beacons. You can cross-reference WiGLE or MAC vendor.",
      found: false
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message || "Failed to process BSSID" }, { status: 500 });
  }
}
