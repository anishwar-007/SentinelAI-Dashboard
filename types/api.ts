/** Shared Platform HTTP / error contracts. */

export type TerminalExecutionStatus = "completed" | "failed" | "cancelled";

/** Defensive union — read APIs currently return terminal statuses only. */
export type ExecutionStatus =
  | TerminalExecutionStatus
  | "pending"
  | "running"
  | string;

export type SpanStatus = "running" | "ok" | "error" | string;

export interface PlatformErrorBody {
  detail: string;
}

export interface PlatformHealth {
  status: string;
}
