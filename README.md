# SentinelAI Dashboard

Independent web dashboard for the SentinelAI Platform.

This repository is a **separate product** from the SentinelAI backend. It communicates with the Platform exclusively over HTTP using:

```
NEXT_PUBLIC_SENTINELAI_API_URL
```

There is **no filesystem dependency** on the backend repository.

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- TanStack Query
- Recharts (overview only)
- Lucide Icons

## Local development

### 1. Backend (separate repo)

```bash
cd /path/to/sentinelai-backend   # or TracerAI today
# allow the local dashboard origin
# SENTINELAI_DASHBOARD_ORIGINS=http://localhost:3000
uv run uvicorn examples.reference_runtime.main:app --reload
```

Platform should listen on `http://localhost:8000`.

### 2. Dashboard

```bash
cd sentinelai-dashboard
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SENTINELAI_API_URL` | Public Platform base URL (no trailing slash required) |

Examples:

```bash
# local
NEXT_PUBLIC_SENTINELAI_API_URL=http://localhost:8000

# production
NEXT_PUBLIC_SENTINELAI_API_URL=https://your-platform-host.example
```

Never hardcode localhost or a cloud vendor URL in source.

## Backend APIs consumed

- `GET /health`
- `GET /api/v1/executions`
- `GET /api/v1/executions/{execution_id}`
- `GET /api/v1/executions/{execution_id}/trace`

## CORS

The Platform must allow the dashboard origin via:

```bash
SENTINELAI_DASHBOARD_ORIGINS=http://localhost:3000,https://your-dashboard.vercel.app
```

## Vercel deployment

1. Push `sentinelai-dashboard` to its own GitHub repository.
2. Import that repository in Vercel (Next.js defaults).
3. Set `NEXT_PUBLIC_SENTINELAI_API_URL` to your deployed Platform URL.
4. Deploy.
5. Add the Vercel origin to backend `SENTINELAI_DASHBOARD_ORIGINS`.

The dashboard does not assume Render, AWS, or any specific backend host — only the configured API URL.

## Pages (V1)

| Route | Purpose |
|-------|---------|
| `/` | Overview (metrics from recent list window) |
| `/executions` | Execution Explorer |
| `/executions/[executionId]` | Execution Detail + Trace Timeline / Waterfall / Span Inspector |

## Known Platform limitations

- No global analytics API — Overview labels metrics as derived from a recent list fetch.
- List/detail statuses are terminal (`completed` / `failed` / `cancelled`).
- Snapshot has no `latency_ms` / `completed_at`; detail duration prefers trace fields.
- `verification` and `analysis` are opaque JSON documents.

## Scripts

```bash
npm run dev
npm run build
npm start
npm run lint
```
