"use client";

import { PlatformStatus } from "@/components/layout/platform-status";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { getApiHostLabel } from "@/lib/api/client";

export function TopBar({
  title,
  breadcrumb,
}: {
  title: string;
  breadcrumb?: string;
}) {
  let host = "unconfigured";
  try {
    host = getApiHostLabel();
  } catch {
    host = "unconfigured";
  }

  return (
    <header className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-border bg-card/40 px-4 pl-14 md:px-6 md:pl-6">
      <div className="min-w-0">
        {breadcrumb ? (
          <p className="truncate text-[11px] text-muted-foreground">{breadcrumb}</p>
        ) : null}
        <h1 className="truncate text-sm font-semibold text-foreground">{title}</h1>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <PlatformStatus />
        <span
          className="hidden rounded border border-border px-2 py-0.5 font-mono text-[10px] text-muted-foreground lg:inline"
          title="Platform API host from NEXT_PUBLIC_SENTINELAI_API_URL"
        >
          {host}
        </span>
        <ThemeToggle />
      </div>
    </header>
  );
}
