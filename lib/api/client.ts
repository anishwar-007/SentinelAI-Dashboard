import type { PlatformErrorBody } from "@/types/api";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export class PlatformApiError extends Error {
  readonly status: number;
  readonly detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.name = "PlatformApiError";
    this.status = status;
    this.detail = detail;
  }
}

export type ApiAuthMode = "required" | "none";

function getBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SENTINELAI_API_URL;
  if (!raw || !raw.trim()) {
    throw new PlatformApiError(
      0,
      "NEXT_PUBLIC_SENTINELAI_API_URL is not configured.",
    );
  }
  return raw.replace(/\/$/, "");
}

export function getApiHostLabel(): string {
  try {
    return new URL(getBaseUrl()).host;
  } catch {
    return "unconfigured";
  }
}

async function getAccessToken(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  } catch {
    return null;
  }
}

async function parseError(response: Response): Promise<PlatformApiError> {
  let detail = `Platform request failed (${response.status}).`;
  try {
    const body = (await response.json()) as PlatformErrorBody;
    if (body?.detail) detail = body.detail;
  } catch {
    // keep default
  }
  return new PlatformApiError(response.status, detail);
}

async function apiRequest<T>(
  method: "GET" | "POST",
  path: string,
  options?: {
    query?: Record<string, string | number | undefined | null>;
    body?: unknown;
    auth?: ApiAuthMode;
  },
): Promise<T> {
  const base = getBaseUrl();
  const url = new URL(path.startsWith("http") ? path : `${base}${path}`);
  if (options?.query) {
    for (const [key, value] of Object.entries(options.query)) {
      if (value === undefined || value === null || value === "") continue;
      url.searchParams.set(key, String(value));
    }
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (options?.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const authMode = options?.auth ?? "none";
  if (authMode === "required") {
    const token = await getAccessToken();
    if (!token) {
      throw new PlatformApiError(
        401,
        "Authentication required. Sign in to access the dashboard.",
      );
    }
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method,
      headers,
      body: options?.body !== undefined ? JSON.stringify(options.body) : undefined,
      cache: "no-store",
    });
  } catch {
    throw new PlatformApiError(
      0,
      "Unable to reach the SentinelAI Platform. Check NEXT_PUBLIC_SENTINELAI_API_URL and that the backend is running.",
    );
  }

  if (!response.ok) {
    throw await parseError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

export async function apiGet<T>(
  path: string,
  query?: Record<string, string | number | undefined | null>,
  auth: ApiAuthMode = "none",
): Promise<T> {
  return apiRequest<T>("GET", path, { query, auth });
}

export async function apiPost<T>(
  path: string,
  body?: unknown,
  auth: ApiAuthMode = "none",
): Promise<T> {
  return apiRequest<T>("POST", path, { body, auth });
}
