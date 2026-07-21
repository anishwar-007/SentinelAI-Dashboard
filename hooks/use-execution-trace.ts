"use client";

import { useQuery } from "@tanstack/react-query";
import { getExecutionTrace } from "@/lib/api/traces";
import { PlatformApiError } from "@/lib/api/client";

export function useExecutionTrace(executionId: string) {
  return useQuery({
    queryKey: ["execution-trace", executionId],
    queryFn: () => getExecutionTrace(executionId),
    enabled: Boolean(executionId),
    staleTime: 30_000,
    retry: (count, error) => {
      if (error instanceof PlatformApiError && error.status === 404) return false;
      return count < 2;
    },
  });
}
