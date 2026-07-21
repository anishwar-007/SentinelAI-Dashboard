import { apiGet, apiPost } from "./client";
import type { ExecutionSnapshot } from "@/types/execution";
import type { ExecutionTraceView } from "@/types/trace";

export type DemoMode = "chat" | "rag" | "invoice";

export interface DemoQueryRequest {
  mode: DemoMode;
  input: string;
}

export interface DemoQueryResponse {
  execution_id: string;
  answer: string;
  status: string;
  latency_ms: number;
  mode: DemoMode;
}

export function runDemoQuery(
  body: DemoQueryRequest,
): Promise<DemoQueryResponse> {
  return apiPost<DemoQueryResponse>("/api/v1/demo/query", body, "none");
}

export function getDemoExecution(
  executionId: string,
): Promise<ExecutionSnapshot> {
  return apiGet<ExecutionSnapshot>(
    `/api/v1/demo/executions/${encodeURIComponent(executionId)}`,
    undefined,
    "none",
  );
}

export function getDemoExecutionTrace(
  executionId: string,
): Promise<ExecutionTraceView> {
  return apiGet<ExecutionTraceView>(
    `/api/v1/demo/executions/${encodeURIComponent(executionId)}/trace`,
    undefined,
    "none",
  );
}
