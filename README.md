# LittleBrother OSINT Web Suite (Cloudflare Edition)

A modern, high-performance web interface and edge API for **LittleBrother** OSINT, engineered to run natively on **Cloudflare Workers** and **Cloudflare Pages**.

Based on the original Python OSINT framework by [AbirHasan2005/LittleBrother](https://github.com/AbirHasan2005/LittleBrother) and [Lulz3xploit](https://github.com/Lulz3xploit/LittleBrother).

---

## ✨ Features & Edge Modules

1. **IP Geolocation & ASN Intelligence (`/api/ip`)**
   - Real-time IP resolution, ISP, Autonomous System Number (ASN), routing coordinates, and country flags.
   - Integrates with Cloudflare Edge headers (`CF-Connecting-IP`, `CF-IPCountry`).
   - Interactive OpenStreetMap and Google Maps links.

2. **BSSID & Wi-Fi Geolocation (`/api/bssid`)**
   - Resolves wireless access point MAC addresses (BSSID) to GPS physical coordinates.
   - Cross-references open wireless beacon databases and WiGLE.

3. **Mail-to-IP & Header Analyzer (`/api/headers`)**
   - Extracts origin sender IPs, intermediate MTA relays, and hops from RFC 822 raw email headers.
   - Inspects SPF authentication, DKIM signatures, and DMARC headers.

4. **EXIF & Photo GPS Extractor (Client-Side WASM)**
   - Parses camera hardware (Make, Model, Software, Lens, ISO, Aperture).
   - Extracts embedded GPS coordinates and displays an interactive map of the capture location.
   - Runs 100% locally in browser memory for complete investigator confidentiality.

5. **Cryptographic Hash Intelligence (`/api/hash`)**
   - Identifies algorithm families (MD5, SHA-1, SHA-256, NTLM, bcrypt, Argon2, etc.).
   - Instant search against public dictionary tables and VirusTotal/Hashes.com.

6. **Username Recon & Social Footprint (`/api/username`)**
   - Scans 16+ key social and developer platforms (GitHub, X/Twitter, Instagram, LinkedIn, Reddit, Telegram, etc.).
   - Generates Google Dorks to find leaked credentials, paste dumps, and profile traces.

7. **Encrypted DNS over HTTPS (`/api/dns`)**
   - Zero-leak recursive DNS queries over Cloudflare's secure 1.1.1.1 DoH endpoint (A, AAAA, MX, TXT, NS, SOA).

8. **Dossier Case File Manager (DoxMaker)**
   - Create, edit, and organize investigation targets.
   - Client-side persistent local storage.
   - Export full case reports directly to Markdown.

---

## 🚀 Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:38450](http://localhost:38450) in your browser.

---

## ☁️ Deploying to Cloudflare

### Option A: Cloudflare Pages (Git Integration - Recommended)
1. Push your repository to GitHub or GitLab.
2. In the **Cloudflare Dashboard**, navigate to **Workers & Pages** &rarr; **Create application** &rarr; **Pages** &rarr; **Connect to Git**.
3. Select your repository and choose the **Next.js** framework preset:
   - **Build command:** `npx @cloudflare/next-on-pages@1`
   - **Build output directory:** `.vercel/output/static`
4. Set the compatibility flag in Settings: `nodejs_compat`.
5. Deploy!

### Option B: Deploy via Wrangler CLI
Deploy directly from your terminal:
```bash
# 1. Authenticate with your Cloudflare account
npx wrangler login

# 2. Build and deploy
npx @cloudflare/next-on-pages
npx wrangler pages deploy .vercel/output/static
```

---

## 🔒 Security & Privacy Notice
All reconnaissance modules operate passively. Image EXIF analysis and Dossier management run entirely within your local browser sandbox to preserve target and investigator operational security.
