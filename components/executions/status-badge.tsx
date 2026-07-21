import { Badge } from "@/components/ui/badge";
import type { ExecutionStatus } from "@/types/api";

const STATUS_META: Record<
  string,
  { label: string; variant: "success" | "danger" | "warning" | "info" | "default" }
> = {
  completed: { label: "completed", variant: "success" },
  failed: { label: "failed", variant: "danger" },
  cancelled: { label: "cancelled", variant: "warning" },
  pending: { label: "pending", variant: "default" },
  running: { label: "running", variant: "info" },
  ok: { label: "ok", variant: "success" },
  error: { label: "error", variant: "danger" },
};

export function ExecutionStatusBadge({
  status,
}: {
  status: ExecutionStatus | string | null | undefined;
}) {
  const key = (status ?? "unknown").toLowerCase();
  const meta = STATUS_META[key] ?? {
    label: String(status ?? "unknown"),
    variant: "default" as const,
  };
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}
