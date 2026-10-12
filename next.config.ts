import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

if (process.env.NODE_ENV === "development" && process.env.CF_PAGES) {
  import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
}
