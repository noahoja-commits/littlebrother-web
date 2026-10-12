import { NextRequest, NextResponse } from "next/server";

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

export async function GET(req: NextRequest) {
  const hash = req.nextUrl.searchParams.get("hash") || "";
  return handleHash(hash);
}

export async function POST(req: NextRequest) {
  try {
    const { hash } = await req.json();
    return handleHash(hash || "");
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message || "Failed to inspect hash" }, { status: 500 });
  }
}

async function handleHash(hash: string) {
  const clean = (hash || "").trim();

  if (!clean) {
    return NextResponse.json({ error: "No hash provided" }, { status: 400 });
  }

  const identified = identifyHash(clean);

  // Cross-reference common lookup databases via public APIs
  let matchResult: string | null = null;
  let source: string | null = null;

  // Check known hashes dictionary or public lookup
  const knownHashes: Record<string, string> = {
    "5d41402abc4b2a76b9719d911017c592": "hello",
    "21232f297a57a5a743894a0e4a801fc3": "admin",
    "098f6bcd4621d373cade4e832627b4f6": "test",
    "e10adc3949ba59abbe56e057f20f883e": "123456",
    "25d55ad283aa400af464c76d713c07ad": "12345678",
    "fcea920f7412b4da7be0cf6f11c67286": "password",
    "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8": "password",
    "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918": "admin",
  };

  if (knownHashes[clean.toLowerCase()]) {
    matchResult = knownHashes[clean.toLowerCase()];
    source = "rainbow-table";
  } else if (clean.length === 32 && /^[a-fA-F0-9]{32}$/.test(clean)) {
    try {
      const checkUrl = `https://api.dehash.lt/check.php?hash=${clean}`;
      const res = await fetch(checkUrl, { signal: AbortSignal.timeout(2000) });
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
}
