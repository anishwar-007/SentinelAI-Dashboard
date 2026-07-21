"use client";

import Link from "next/link";
import { SITE } from "@/lib/site";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "/#product", label: "Product" },
  { href: "/#architecture", label: "Architecture" },
  { href: SITE.githubUrl, label: "GitHub", external: true },
];

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-12 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-baseline gap-1.5">
          <span className="text-sm font-semibold tracking-tight">{SITE.name}</span>
          <span className="hidden text-[10px] uppercase tracking-wider text-muted-foreground sm:inline">
            observability
          </span>
        </Link>
        <nav className="hidden items-center gap-4 text-sm text-muted-foreground md:flex">
          {NAV.map((item) =>
            item.external ? (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="hover:text-foreground"
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className="hover:text-foreground"
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/sign-in">Sign In</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/sandbox">Try Sandbox</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
