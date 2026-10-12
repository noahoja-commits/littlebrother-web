// default open-next.config.ts file created by @opennextjs/cloudflare
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

const baseConfig = defineCloudflareConfig();

export default {
	...baseConfig,
	buildCommand: "npm run next:build"
};


