/** Centralized product/marketing URLs (no hardcoding in components). */

export const SITE = {
  name: "SentinelAI",
  tagline: "See inside your AI.",
  githubUrl:
    process.env.NEXT_PUBLIC_GITHUB_URL?.trim() ||
    "https://github.com/anishwar-007/SentinelAI-Dashboard",
  productRepoUrl:
    process.env.NEXT_PUBLIC_PRODUCT_GITHUB_URL?.trim() ||
    "https://github.com/anishwar-007/TracerAI",
} as const;
