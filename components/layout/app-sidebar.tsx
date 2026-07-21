"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  FlaskConical,
  LayoutDashboard,
  Menu,
  PlayCircle,
  Settings,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const PRIMARY = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/executions", label: "Executions", icon: Activity },
];

const COMING_SOON = [
  { label: "Replay", icon: PlayCircle },
  { label: "Evaluations", icon: FlaskConical },
  { label: "Analytics", icon: BarChart3 },
];

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors",
        active
          ? "bg-muted text-foreground"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex h-12 items-center border-b border-border px-4">
        <Link
          href="/dashboard"
          className="flex items-baseline gap-1.5"
          onClick={() => setOpen(false)}
        >
          <span className="text-sm font-semibold tracking-tight text-foreground">
            SentinelAI
          </span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Dashboard
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto p-3">
        <div className="space-y-0.5">
          {PRIMARY.map((item) => (
            <NavLink
              key={item.href}
              {...item}
              active={
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href)
              }
              onClick={() => setOpen(false)}
            />
          ))}
        </div>

        <div className="border-t border-border pt-3">
          <p className="mb-1 px-2.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            Coming soon
          </p>
          <div className="space-y-0.5">
            {COMING_SOON.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground/50"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
                <span className="ml-auto text-[10px]">Soon</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-border pt-3">
          <div className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground/50">
            <Settings className="h-4 w-4" />
            Settings
            <span className="ml-auto text-[10px]">Soon</span>
          </div>
        </div>
      </nav>
    </div>
  );

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="fixed left-3 top-3 z-30 md:hidden"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-4 w-4" />
      </Button>

      <aside className="hidden w-56 shrink-0 border-r border-border bg-card md:flex md:flex-col">
        {content}
      </aside>

      {open ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          />
          <aside className="absolute inset-y-0 left-0 w-64 border-r border-border bg-card">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            {content}
          </aside>
        </div>
      ) : null}
    </>
  );
}
