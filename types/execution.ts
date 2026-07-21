/** HTTP contracts for execution list + detail APIs. */

import type { ExecutionStatus, TerminalExecutionStatus } from "./api";

export interface ModelInfo {
  provider: string;
  model_name: string;
  temperature?: number | null;
  max_tokens?: number | null;
  top_p?: number | null;
  seed?: number | null;
  reasoning_enabled?: boolean;
}

export interface PromptReference {
  prompt_id: string;
  version: string;
  name: string;
  hash: string;
}

/** Explorer row from GET /api/v1/executions */
export interface ExecutionListItem {
  execution_id: string;
  execution_name: string | null;
  status: TerminalExecutionStatus | ExecutionStatus;
  intent: string | null;
  model: string;
  started_at: string;
  completed_at: string | null;
  latency_ms: number | null;
  trace_id: string | null;
  query: string;
  repository_version: string;
}

export interface ExecutionListResponse {
  items: ExecutionListItem[];
  limit: number;
  offset: number;
  total: number | null;
  has_more: boolean;
}

export interface ExecutionListParams {
  limit?: number;
  offset?: number;
  status?: string;
  execution_name?: string;
  model?: string;
  from_time?: string;
  to_time?: string;
}

/** Full snapshot from GET /api/v1/executions/{id} */
export interface ExecutionSnapshot {
  execution_id: string;
  query: string;
  plan: Record<string, unknown> | null;
  retrieval_result: Record<string, unknown> | null;
  response: Record<string, unknown> | null;
  verification: Record<string, unknown> | null;
  analysis: Record<string, unknown> | null;
  trace_id: string | null;
  model_info: ModelInfo;
  prompt_references: Record<string, PromptReference>;
  created_at: string;
  metadata: Record<string, unknown>;
  repository_version: string;
  execution_status: TerminalExecutionStatus | ExecutionStatus;
  intent: string | null;
}
