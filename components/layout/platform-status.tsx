"use client";

import { usePlatformHealth } from "@/hooks/use-platform-health";
import { cn } from "@/lib/utils";

export function PlatformStatus() {
  const { data, isLoading, isError, isFetching } = usePlatformHealth();
  const healthy = !isError && data?.status === "healthy";

  let label = "Checking…";
  if (isError) label = "Platform unreachable";
  else if (healthy) label = "Platform connected";
  else if (!isLoading) label = "Platform degraded";

  return (
    <div
      className="flex items-center gap-1.5 rounded border border-border px-2 py-0.5 text-[11px] text-muted-foreground"
      title={label}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          isLoading || isFetching
            ? "bg-warning"
            : healthy
              ? "bg-success"
              : "bg-error",
        )}
      />
      <span className="hidden sm:inline">{label}</span>
    </div>
  );
}
