import { AlertTriangle } from "lucide-react";
import { PlatformApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils";

export function ErrorState({
  error,
  title = "Something went wrong",
  className,
}: {
  error: unknown;
  title?: string;
  className?: string;
}) {
  let message = "An unexpected error occurred while talking to the Platform.";
  if (error instanceof PlatformApiError) {
    message = error.detail;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div
      className={cn(
        "flex gap-3 rounded-md border border-red-500/30 bg-red-500/5 px-4 py-3",
        className,
      )}
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
