import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

interface HashType {
  name: string;
  bitLength: number;
  format: string;
}

function identifyHash(clean: string): HashType[] {
  const len = clean.length;
  const isHex = /^[a-fA-F0-9]+$/.test(clean);
  const isBase64 = /^[a-zA-Z0-9+/=]+$/.test(clean);

  const candidates: HashType[] = [];

  if (isHex) {
    if (len === 32) {
      candidates.push({ name: "MD5", bitLength: 128, format: "hex" });
      candidates.push({ name: "NTLM", bitLength: 128, format: "hex" });
      candidates.push({ name: "MD4", bitLength: 128, format: "hex" });
    } else if (len === 40) {
      candidates.push({ name: "SHA-1", bitLength: 160, format: "hex" });
      candidates.push({ name: "RIPEMD-160", bitLength: 160, format: "hex" });
    } else if (len === 56) {
      candidates.push({ name: "SHA-224", bitLength: 224, format: "hex" });
      candidates.push({ name: "SHA3-224", bitLength: 224, format: "hex" });
    } else if (len === 64) {
      candidates.push({ name: "SHA-256", bitLength: 256, format: "hex" });
      candidates.push({ name: "HMAC-SHA256", bitLength: 256, format: "hex" });
      candidates.push({ name: "BLAKE2s", bitLength: 256, format: "hex" });
    } else if (len === 96) {
      candidates.push({ name: "SHA-384", bitLength: 384, format: "hex" });
      candidates.push({ name: "SHA3-384", bitLength: 384, format: "hex" });
    } else if (len === 128) {
      candidates.push({ name: "SHA-512", bitLength: 512, format: "hex" });
      candidates.push({ name: "Whirlpool", bitLength: 512, format: "hex" });
      candidates.push({ name: "BLAKE2b", bitLength: 512, format: "hex" });
    }
  }

  if (clean.startsWith("$2a$") || clean.startsWith("$2b$") || clean.startsWith("$2y$")) {
    candidates.push({ name: "bcrypt", bitLength: 184, format: "modular-crypt" });
  } else if (clean.startsWith("$6$")) {
    candidates.push({ name: "SHA-512 Crypt", bitLength: 512, format: "modular-crypt" });
  } else if (clean.startsWith("$5$")) {
    candidates.push({ name: "SHA-256 Crypt", bitLength: 256, format: "modular-crypt" });
  } else if (clean.startsWith("$1$")) {
    candidates.push({ name: "MD5 Crypt", bitLength: 128, format: "modular-crypt" });
  } else if (clean.startsWith("$argon2id$") || clean.startsWith("$argon2i$")) {
    candidates.push({ name: "Argon2", bitLength: 256, format: "modular-crypt" });
  }

  if (candidates.length === 0 && isBase64) {
    candidates.push({ name: "Base64 Encoded String or Hash Digest", bitLength: len * 6, format: "base64" });
  }

  return candidates;
}

export async function POST(req: NextRequest) {
  try {
    const { hash } = await req.json();
    const clean = (hash || "").trim();

    if (!clean) {
      return NextResponse.json({ error: "No hash provided" }, { status: 400 });
    }

    const identified = identifyHash(clean);

    // Cross-reference common lookup databases via public APIs
    // e.g. Hashes.com / VirusTotal / md5decrypt
    let matchResult: string | null = null;
    let source: string | null = null;

    // Check MD5 against public API if it's 32 chars
    if (clean.length === 32 && /^[a-fA-F0-9]{32}$/.test(clean)) {
      try {
        const checkUrl = `https://api.dehash.lt/check.php?hash=${clean}`;
        const res = await fetch(checkUrl, { signal: AbortSignal.timeout(3000) });
        if (res.ok) {
          const text = await res.text();
          if (text && !text.includes("Not Found") && !text.includes("error")) {
            matchResult = text.trim();
            source = "public-hash-lookup";
          }
        }
      } catch {
        // ignore timeout
      }
    }

    return NextResponse.json({
      hash: clean,
      length: clean.length,
      identifiedTypes: identified,
      lookupResult: matchResult ? { match: matchResult, provider: source } : null,
      searchUrls: {
        hashesCom: `https://hashes.com/en/decrypt/hash`,
        virusTotal: `https://www.virustotal.com/gui/search/${clean}`,
        google: `https://www.google.com/search?q="${clean}"`,
        hashcatGuide: "https://hashcat.net/wiki/doku.php?id=example_hashes"
      }
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message || "Failed to inspect hash" }, { status: 500 });
  }
}
