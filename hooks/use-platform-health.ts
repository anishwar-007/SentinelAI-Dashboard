"use client";

import { useQuery } from "@tanstack/react-query";
import { getPlatformHealth } from "@/lib/api/health";

export function usePlatformHealth() {
  return useQuery({
    queryKey: ["platform-health"],
    queryFn: getPlatformHealth,
    refetchInterval: 30_000,
    retry: 1,
    staleTime: 10_000,
  });
}
