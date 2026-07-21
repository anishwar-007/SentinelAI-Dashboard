import { apiGet } from "./client";
import type { ExecutionTraceView } from "@/types/trace";

export function getExecutionTrace(
  executionId: string,
): Promise<ExecutionTraceView> {
  return apiGet<ExecutionTraceView>(
    `/api/v1/executions/${encodeURIComponent(executionId)}/trace`,
    undefined,
    "required",
  );
}
