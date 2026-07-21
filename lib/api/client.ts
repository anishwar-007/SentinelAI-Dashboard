import type { PlatformErrorBody } from "@/types/api";

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

export async function apiGet<T>(
  path: string,
  query?: Record<string, string | number | undefined | null>,
): Promise<T> {
  const base = getBaseUrl();
  const url = new URL(path.startsWith("http") ? path : `${base}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === "") continue;
      url.searchParams.set(key, String(value));
    }
  }

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
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

  return (await response.json()) as T;
}
