"use client";

import { useQuery } from "@tanstack/react-query";
import { getExecution } from "@/lib/api/executions";

export function useExecution(executionId: string) {
  return useQuery({
    queryKey: ["execution", executionId],
    queryFn: () => getExecution(executionId),
    enabled: Boolean(executionId),
    staleTime: 30_000,
  });
}
