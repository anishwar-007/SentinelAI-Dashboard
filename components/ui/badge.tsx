import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded border px-1.5 py-0.5 text-[11px] font-medium tracking-wide uppercase",
  {
    variants: {
      variant: {
        default: "border-border bg-muted text-muted-foreground",
        success:
          "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
        danger: "border-red-500/40 bg-red-500/10 text-red-400",
        warning:
          "border-amber-500/40 bg-amber-500/10 text-amber-400",
        info: "border-sky-500/40 bg-sky-500/10 text-sky-400",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
