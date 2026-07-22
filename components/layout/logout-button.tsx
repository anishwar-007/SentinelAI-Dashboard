"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        await supabase.auth.signOut({ scope: "global" });
      }
    } catch {
      // Still clear local navigation even if the network call fails.
    } finally {
      router.replace("/sign-in");
      router.refresh();
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn(
        "w-full justify-start gap-2 text-muted-foreground hover:text-foreground",
        className,
      )}
      disabled={loading}
      onClick={logout}
    >
      <LogOut className="h-4 w-4" />
      {loading ? "Signing out…" : "Log out"}
    </Button>
  );
}
