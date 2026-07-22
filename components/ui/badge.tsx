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
          "border-success/30 bg-success-muted text-success",
        danger: "border-error/30 bg-error-muted text-error",
        warning:
          "border-warning/30 bg-warning-muted text-warning",
        info: "border-info/30 bg-info-muted text-info",
        accent: "border-accent/30 bg-accent-muted text-accent",
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
