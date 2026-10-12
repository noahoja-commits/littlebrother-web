import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get("domain")?.trim();

    if (!domain) {
      return NextResponse.json({ error: "Missing domain query" }, { status: 400 });
    }

    const cleanDomain = domain.replace(/^https?:\/\//, "").split("/")[0].trim();

    // Query Cloudflare 1.1.1.1 DNS over HTTPS (DoH) JSON API
    const recordTypes = ["A", "AAAA", "MX", "TXT", "NS", "SOA"];
    const results: Record<string, unknown[]> = {};

    await Promise.all(
      recordTypes.map(async (type) => {
        try {
          const dohUrl = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(cleanDomain)}&type=${type}`;
          const res = await fetch(dohUrl, {
            headers: { Accept: "application/dns-json" },
            signal: AbortSignal.timeout(4000)
          });
          if (res.ok) {
            const json = await res.json();
            results[type] = json.Answer || [];
          } else {
            results[type] = [];
          }
        } catch {
          results[type] = [];
        }
      })
    );

    return NextResponse.json({
      domain: cleanDomain,
      resolver: "Cloudflare 1.1.1.1 DoH",
      records: results
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message || "DNS lookup failed" }, { status: 500 });
  }
}
