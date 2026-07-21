import { apiGet } from "./client";
import type { PlatformHealth } from "@/types/api";

export function getPlatformHealth(): Promise<PlatformHealth> {
  return apiGet<PlatformHealth>("/health");
}
