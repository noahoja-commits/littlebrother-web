import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const targetIp = searchParams.get("ip")?.trim() || "";

    // Cloudflare edge headers available automatically on Cloudflare Pages/Workers
    const cfCountry = req.headers.get("cf-ipcountry");
    const clientIp = req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();

    const query = targetIp || clientIp || "";

    if (!query) {
      return NextResponse.json({
        ip: "127.0.0.1",
        hostname: "localhost",
        city: "Local Edge",
        region: "Local",
        country: cfCountry || "Local",
        loc: "0,0",
        org: "Local Development Edge",
        postal: "00000",
        timezone: "UTC",
        edgeSource: "cloudflare-mock"
      });
    }

    // Query reliable public IP lookup APIs (fallback chain)
    const endpoints = [
      `https://ipapi.co/${encodeURIComponent(query)}/json/`,
      `http://ip-api.com/json/${encodeURIComponent(query)}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`
    ];

    let resultData: Record<string, unknown> | null = null;

    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          headers: { "User-Agent": "LittleBrother-OSINT-Web/1.0" },
          signal: AbortSignal.timeout(4000)
        });
        if (res.ok) {
          const json = await res.json();
          if (json && !json.error && json.status !== "fail") {
            resultData = json;
            break;
          }
        }
      } catch {
        // try next endpoint
      }
    }

    if (!resultData) {
      return NextResponse.json(
        {
          ip: query,
          hostname: "Unknown",
          city: "Unknown",
          region: "Unknown",
          country: cfCountry || "Unknown",
          loc: "0,0",
          org: "Lookup service unavailable",
          postal: "-",
          timezone: "UTC",
          error: "Could not retrieve full IP information. Target might be private or rate limited."
        },
        { status: 200 }
      );
    }

    // Normalize response fields
    const normalized = {
      ip: resultData.ip || resultData.query || query,
      hostname: resultData.hostname || resultData.as || "N/A",
      city: resultData.city || "Unknown",
      region: resultData.region || resultData.regionName || "Unknown",
      country: resultData.country_name || resultData.country || "Unknown",
      countryCode: resultData.country_code || resultData.countryCode || "",
      loc: resultData.latitude && resultData.longitude
        ? `${resultData.latitude}, ${resultData.longitude}`
        : resultData.lat && resultData.lon
        ? `${resultData.lat}, ${resultData.lon}`
        : resultData.loc || "0,0",
      lat: resultData.latitude || resultData.lat,
      lon: resultData.longitude || resultData.lon,
      org: resultData.org || resultData.isp || "N/A",
      postal: resultData.postal || resultData.zip || "N/A",
      timezone: resultData.timezone || "UTC",
      currency: resultData.currency || "N/A",
      asn: resultData.asn || resultData.as || "N/A"
    };

    return NextResponse.json(normalized);
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message || "Failed to lookup IP" }, { status: 500 });
  }
}
