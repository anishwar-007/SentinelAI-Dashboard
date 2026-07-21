"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PlatformStatus } from "@/components/layout/platform-status";
import { getApiHostLabel } from "@/lib/api/client";

export function TopBar({
  title,
  breadcrumb,
}: {
  title: string;
  breadcrumb?: string;
}) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

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
      <div className="flex items-center gap-2">
        <PlatformStatus />
        <span
          className="hidden rounded border border-border px-2 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline"
          title="Platform API host from NEXT_PUBLIC_SENTINELAI_API_URL"
        >
          {host}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Toggle theme"
          disabled={!mounted}
          onClick={() =>
            setTheme(resolvedTheme === "dark" ? "light" : "dark")
          }
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </div>
    </header>
  );
}
