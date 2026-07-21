"use client";

import { useQuery } from "@tanstack/react-query";
import { listExecutions } from "@/lib/api/executions";
import type { ExecutionListParams } from "@/types/execution";

export function useExecutions(params: ExecutionListParams) {
  return useQuery({
    queryKey: ["executions", params],
    queryFn: () => listExecutions(params),
    staleTime: 15_000,
  });
}
