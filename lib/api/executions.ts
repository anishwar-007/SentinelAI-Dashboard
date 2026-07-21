import { apiGet } from "./client";
import type {
  ExecutionListParams,
  ExecutionListResponse,
  ExecutionSnapshot,
} from "@/types/execution";

export function listExecutions(
  params: ExecutionListParams = {},
): Promise<ExecutionListResponse> {
  return apiGet<ExecutionListResponse>("/api/v1/executions", {
    limit: params.limit,
    offset: params.offset,
    status: params.status,
    execution_name: params.execution_name,
    model: params.model,
    from_time: params.from_time,
    to_time: params.to_time,
  });
}

export function getExecution(executionId: string): Promise<ExecutionSnapshot> {
  return apiGet<ExecutionSnapshot>(
    `/api/v1/executions/${encodeURIComponent(executionId)}`,
  );
}
