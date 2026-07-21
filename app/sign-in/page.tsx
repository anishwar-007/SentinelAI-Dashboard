"use client";

import { FormEvent, Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MarketingNav } from "@/components/marketing/nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { ErrorState } from "@/components/shared/error-state";
import { Skeleton } from "@/components/ui/skeleton";

export default function SignInPage() {
  return (
    <>
      <MarketingNav />
      <main className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-md flex-col justify-center px-4 py-12">
        <Suspense fallback={<Skeleton className="h-80 w-full" />}>
          <SignInForm />
        </Suspense>
      </main>
    </>
  );
}

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  const configError = searchParams.get("error") === "auth_not_configured";

  const configured = useMemo(() => {
    try {
      return isSupabaseConfigured();
    } catch {
      return false;
    }
  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!configured || configError) {
    return (
      <div className="space-y-4 rounded-md border border-border p-6">
        <h1 className="text-lg font-semibold">Sign in</h1>
        <ErrorState
          error={
            new Error(
              "Supabase auth is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
            )
          }
          title="Authentication unavailable"
        />
        <Button asChild variant="outline">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      if (mode === "signin") {
        const { error: err } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (err) throw err;
      } else {
        const { error: err } = await supabase.auth.signUp({ email, password });
        if (err) throw err;
      }
      router.replace(next.startsWith("/") ? next : "/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  async function signInWithGitHub() {
    setError(null);
    try {
      const supabase = createClient();
      const redirectTo = new URL("/auth/callback", window.location.origin);
      redirectTo.searchParams.set(
        "next",
        next.startsWith("/") ? next : "/dashboard",
      );
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: redirectTo.toString(),
        },
      });
      if (err) throw err;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "GitHub sign-in failed. Ensure the GitHub provider is enabled in Supabase.",
      );
    }
  }

  return (
    <div className="space-y-4 rounded-md border border-border bg-card/40 p-6">
      <div>
        <h1 className="text-lg font-semibold">Sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Access the SentinelAI execution dashboard.
        </p>
      </div>
      <form className="space-y-3" onSubmit={onSubmit}>
        <label className="block space-y-1 text-xs text-muted-foreground">
          Email
          <Input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="block space-y-1 text-xs text-muted-foreground">
          Password
          <Input
            type="password"
            required
            minLength={6}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error ? (
          <p className="text-xs text-red-400">{error}</p>
        ) : null}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading
            ? "Working…"
            : mode === "signin"
              ? "Sign in"
              : "Create account"}
        </Button>
      </form>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={signInWithGitHub}
      >
        Continue with GitHub
      </Button>
      <button
        type="button"
        className="w-full text-center text-xs text-muted-foreground hover:text-foreground"
        onClick={() =>
          setMode((m) => (m === "signin" ? "signup" : "signin"))
        }
      >
        {mode === "signin"
          ? "Need an account? Sign up"
          : "Already have an account? Sign in"}
      </button>
    </div>
  );
}
