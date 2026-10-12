export interface IpResult {
  ip: string;
  hostname?: string;
  city: string;
  region: string;
  country: string;
  countryCode?: string;
  loc: string;
  lat?: number;
  lon?: number;
  org: string;
  postal: string;
  timezone: string;
  asn?: string;
  currency?: string;
  error?: string;
}

export interface BssidResult {
  bssid: string;
  source?: string;
  lat?: number;
  lon?: number;
  range?: number;
  address?: string;
  mapsUrl?: string | null;
  vendorLookup?: string;
  wigleSearchUrl?: string;
  message?: string;
  found?: boolean;
}

export interface HeaderResult {
  summary: {
    from: string;
    to: string;
    subject: string;
    date: string;
    messageId: string;
    returnPath: string;
    spf: string;
    dkim: string;
    dmarc: string;
  };
  discoveredPublicIps: string[];
  hops: Array<{
    index: number;
    raw: string;
    ips: string[];
  }>;
}

export interface HashResult {
  hash: string;
  length: number;
  identifiedTypes: Array<{
    name: string;
    bitLength: number;
    format: string;
  }>;
  lookupResult?: {
    match: string;
    provider: string;
  } | null;
  searchUrls: {
    hashesCom: string;
    virusTotal: string;
    google: string;
    hashcatGuide: string;
  };
}

export interface UsernameResult {
  username: string;
  profiles: Array<{
    platform: string;
    category: string;
    url: string;
    status: string;
    details?: {
      name?: string;
      bio?: string;
      avatar?: string;
      location?: string;
      public_repos?: number;
    } | null;
  }>;
  googleDorks: Array<{
    name: string;
    query: string;
    url: string;
  }>;
  verifiedCount: number;
}

export interface DnsResult {
  domain: string;
  resolver: string;
  records: Record<string, Array<{
    name: string;
    type: number;
    TTL: number;
    data: string;
  }>>;
}

export interface DossierRecord {
  id: string;
  created: string;
  targetName: string;
  aliases: string;
  dob: string;
  phones: string;
  emails: string;
  addresses: string;
  city: string;
  country: string;
  ipAddresses: string;
  socialAccounts: string;
  notes: string;
  tags: string[];
}
