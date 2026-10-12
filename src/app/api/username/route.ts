import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

interface SocialTarget {
  name: string;
  category: "social" | "code" | "community" | "multimedia" | "professional";
  urlTemplate: string;
  checkUrlTemplate?: string;
  icon?: string;
}

const TARGETS: SocialTarget[] = [
  { name: "GitHub", category: "code", urlTemplate: "https://github.com/{u}", checkUrlTemplate: "https://api.github.com/users/{u}" },
  { name: "Twitter / X", category: "social", urlTemplate: "https://x.com/{u}" },
  { name: "Instagram", category: "multimedia", urlTemplate: "https://instagram.com/{u}" },
  { name: "Reddit", category: "community", urlTemplate: "https://www.reddit.com/user/{u}" },
  { name: "LinkedIn", category: "professional", urlTemplate: "https://www.linkedin.com/in/{u}" },
  { name: "YouTube", category: "multimedia", urlTemplate: "https://www.youtube.com/@{u}" },
  { name: "TikTok", category: "multimedia", urlTemplate: "https://www.tiktok.com/@{u}" },
  { name: "Telegram", category: "social", urlTemplate: "https://t.me/{u}" },
  { name: "Pinterest", category: "multimedia", urlTemplate: "https://www.pinterest.com/{u}" },
  { name: "GitLab", category: "code", urlTemplate: "https://gitlab.com/{u}" },
  { name: "Twitch", category: "multimedia", urlTemplate: "https://www.twitch.tv/{u}" },
  { name: "Medium", category: "community", urlTemplate: "https://medium.com/@{u}" },
  { name: "Dev.to", category: "code", urlTemplate: "https://dev.to/{u}" },
  { name: "Steam", category: "community", urlTemplate: "https://steamcommunity.com/id/{u}" },
  { name: "Keybase", category: "professional", urlTemplate: "https://keybase.io/{u}" },
  { name: "HackerNews", category: "community", urlTemplate: "https://news.ycombinator.com/user?id={u}" }
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username")?.trim();

    if (!username) {
      return NextResponse.json({ error: "Missing username parameter" }, { status: 400 });
    }

    // Clean username
    const cleanUser = username.replace(/^@/, "").trim();

    // Check fast public endpoint (e.g. GitHub public API) to confirm existence if possible
    let githubData: Record<string, unknown> | null = null;
    try {
      const ghRes = await fetch(`https://api.github.com/users/${encodeURIComponent(cleanUser)}`, {
        headers: {
          "User-Agent": "LittleBrother-Cloudflare/1.0",
          Accept: "application/vnd.github.v3+json"
        },
        signal: AbortSignal.timeout(3000)
      });
      if (ghRes.ok) {
        githubData = await ghRes.json();
      }
    } catch {
      // ignore
    }

    const profiles = TARGETS.map((target) => {
      const profileUrl = target.urlTemplate.replace("{u}", encodeURIComponent(cleanUser));
      const isGithub = target.name === "GitHub";

      return {
        platform: target.name,
        category: target.category,
        url: profileUrl,
        status: isGithub ? (githubData ? "found" : "not_found") : "ready_to_verify",
        details: isGithub && githubData ? {
          name: githubData.name,
          bio: githubData.bio,
          avatar: githubData.avatar_url,
          location: githubData.location,
          public_repos: githubData.public_repos
        } : null
      };
    });

    // Generate Google Dorks for deep OSINT search (equivalent to LittleBrother google queries)
    const googleDorks = [
      { name: "Exact Username Quotes", query: `"${cleanUser}"`, url: `https://www.google.com/search?q=${encodeURIComponent(`"${cleanUser}"`)}` },
      { name: "In Page Title", query: `intitle:"${cleanUser}"`, url: `https://www.google.com/search?q=${encodeURIComponent(`intitle:"${cleanUser}"`)}` },
      { name: "In URL Path", query: `inurl:"${cleanUser}"`, url: `https://www.google.com/search?q=${encodeURIComponent(`inurl:"${cleanUser}"`)}` },
      { name: "Document / Paste Dumps", query: `"${cleanUser}" site:pastebin.com OR site:github.com OR site:gitlab.com`, url: `https://www.google.com/search?q=${encodeURIComponent(`"${cleanUser}" site:pastebin.com OR site:github.com OR site:gitlab.com`)}` },
      { name: "Social Media Dork", query: `"${cleanUser}" (site:twitter.com OR site:instagram.com OR site:linkedin.com OR site:facebook.com)`, url: `https://www.google.com/search?q=${encodeURIComponent(`"${cleanUser}" (site:twitter.com OR site:instagram.com OR site:linkedin.com OR site:facebook.com)`)}` }
    ];

    return NextResponse.json({
      username: cleanUser,
      profiles,
      googleDorks,
      verifiedCount: githubData ? 1 : 0
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message || "Failed to scan username" }, { status: 500 });
  }
}
