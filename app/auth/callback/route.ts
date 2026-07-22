import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function signInErrorRedirect(
  origin: string,
  message: string,
  code = "auth_callback_failed",
) {
  const url = new URL("/sign-in", origin);
  url.searchParams.set("error", code);
  url.searchParams.set("error_description", message);
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const oauthError = searchParams.get("error");
  const oauthDescription =
    searchParams.get("error_description") ?? searchParams.get("error_code");
  const nextRaw = searchParams.get("next") ?? "/dashboard";
  const next = nextRaw.startsWith("/") ? nextRaw : "/dashboard";

  // Supabase may bounce here with provider errors in the query string.
  if (oauthError && !code) {
    return signInErrorRedirect(
      origin,
      oauthDescription ?? oauthError,
      oauthError,
    );
  }

  if (code) {
    // Session cookies must be attached to this redirect response.
    const redirect = NextResponse.redirect(`${origin}${next}`);
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      return signInErrorRedirect(
        origin,
        "Supabase env vars are missing.",
        "auth_not_configured",
      );
    }

    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options?: Record<string, unknown>;
          }[],
        ) {
          cookiesToSet.forEach(({ name, value, options }) => {
            redirect.cookies.set(name, value, options);
          });
        },
      },
    });

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return redirect;
    }

    return signInErrorRedirect(
      origin,
      error.message || "Failed to exchange auth code for a session.",
    );
  }

  return signInErrorRedirect(
    origin,
    "No auth code returned. Check Google Client ID/Secret in Supabase.",
  );
}
