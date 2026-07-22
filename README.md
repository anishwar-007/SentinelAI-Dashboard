# SentinelAI Dashboard

Independent web dashboard for the SentinelAI Platform.

This repository is a **separate product** from the SentinelAI backend. It communicates with the Platform exclusively over HTTP — there is **no filesystem dependency** on the backend repository.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- TanStack Query
- Supabase Auth (`@supabase/ssr`)
- React Flow (`@xyflow/react`) for trace graphs
- Recharts (overview metrics only)

## Routes

| Area | Route | Auth |
|------|-------|------|
| Landing | `/` | Public |
| Sandbox | `/sandbox` | Public |
| Sandbox detail | `/sandbox/executions/[executionId]` | Public |
| Sign in | `/sign-in` | Public (redirects if already signed in) |
| Overview | `/dashboard` | Protected |
| Executions | `/dashboard/executions` | Protected |
| Detail | `/dashboard/executions/[executionId]` | Protected |

Middleware redirects unauthenticated `/dashboard/*` traffic to `/sign-in?next=…`.

## Local development

### 1. Backend (TracerAI / Platform)

```bash
cd /path/to/TracerAI
export SENTINELAI_DASHBOARD_ORIGINS=http://localhost:3000
# Local/dev only — do not use in production:
export SENTINELAI_AUTH_DISABLED=1
# Or configure real JWT verification:
# export SUPABASE_URL=https://YOUR_PROJECT.supabase.co
# export SUPABASE_JWT_SECRET=your-jwt-secret
uv run uvicorn examples.reference_runtime.main:app --reload
```

Platform should listen on `http://localhost:8000`.

### 2. Dashboard

```bash
cp .env.example .env.local
# fill Supabase + API URL
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

### Dashboard (`.env.local`)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SENTINELAI_API_URL` | Platform base URL |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon **or** publishable key |
| `NEXT_PUBLIC_GITHUB_URL` | Optional override for landing GitHub CTA |

**Never** ship the Supabase service-role key to the browser.

### Platform (backend)

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Used to validate JWT issuer (`{url}/auth/v1`) |
| `SUPABASE_JWT_SECRET` | HS256 secret from Supabase project settings |
| `SENTINELAI_AUTH_DISABLED` | `1` to bypass JWT when secret unset (local only) |
| `SENTINELAI_DASHBOARD_ORIGINS` | Comma-separated dashboard origins for CORS |

## Auth model

1. User signs in via Supabase (email/password, Google, or GitHub OAuth when enabled).
2. Session cookies are managed by `@supabase/ssr` middleware.
3. Protected Platform calls attach `Authorization: Bearer <access_token>`.
4. Platform `require_user` validates the JWT — security is **not** frontend-only.

OAuth callback: `/auth/callback` exchanges the code for a session, then redirects to `/dashboard` (or `?next=`).

### Remaining ops

- Enable the Google and/or GitHub providers in the Supabase dashboard (Authentication → Providers).
- For Google: create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/apis/credentials), then paste the Client ID and Client Secret into Supabase.
- Add `http://localhost:3000/auth/callback` and `https://<your-app>/auth/callback` to Supabase Auth redirect URLs.

## APIs consumed

### Public

- `GET /health`
- `POST /api/v1/demo/query`
- `GET /api/v1/demo/executions/{id}`
- `GET /api/v1/demo/executions/{id}/trace`

### Protected (Bearer JWT)

- `GET /api/v1/executions`
- `GET /api/v1/executions/{id}`
- `GET /api/v1/executions/{id}/trace`

## Sandbox security contract

- Unauthenticated demo only; max input length **500**.
- Server assigns `environment=sandbox` + `source=public_demo` (client metadata ignored).
- IP rate limit **~5 requests / hour** (in-memory V1; use Redis in production).
- Public reads return **404** unless the record is sandbox-tagged.
- No uploads, arbitrary URLs, or tool configuration.

## CORS

```bash
SENTINELAI_DASHBOARD_ORIGINS=http://localhost:3000,https://your-dashboard.vercel.app
```

Platform allows `Authorization` and `Content-Type`, methods `GET` / `POST` / `OPTIONS`.

## Vercel deployment

1. Import this GitHub repository in Vercel (Next.js defaults).
2. Set:
   - `NEXT_PUBLIC_SENTINELAI_API_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - optional `NEXT_PUBLIC_GITHUB_URL`
3. Deploy.
4. Add the Vercel origin to Platform `SENTINELAI_DASHBOARD_ORIGINS`.
5. Configure Platform `SUPABASE_URL` + `SUPABASE_JWT_SECRET` (leave `SENTINELAI_AUTH_DISABLED` unset).
6. Add the production URL + `/auth/callback` to Supabase redirect allowlist.

## Trace explorer

Execution detail (dashboard + sandbox) shares `TraceExplorer`:

- **Graph** — React Flow nodes/edges from `span_id` / `parent_span_id`
- **Waterfall** — latency timeline
- **Raw** — full `ExecutionTraceView` JSON
- Click a span → `SpanInspector`

## Review checklist

- [ ] `npm install` + `npm run build` succeed
- [ ] Landing, sandbox, sign-in load without auth
- [ ] Unauthenticated `/dashboard` redirects to sign-in
- [ ] Signed-in user can list/open executions (Bearer accepted by Platform)
- [ ] Sandbox run creates an execution visible only via `/api/v1/demo/*`
- [ ] Non-sandbox IDs return 404 from demo read routes
- [ ] CORS allows the deployed dashboard origin + `Authorization`
- [ ] No service-role key in frontend env

## Scripts

```bash
npm run dev
npm run build
npm start
npm run lint
```
