# Proced Contabilidade

Frontend React/Vite app backed by [Supabase](https://supabase.com) (database, auth, storage) and deployed on [Vercel](https://vercel.com) (static hosting + serverless functions).

## Prerequisites

1. Clone the repository.
2. Install dependencies: `npm install`.
3. (Optional) Install the [Supabase CLI](https://supabase.com/docs/guides/cli) and [Vercel CLI](https://vercel.com/docs/cli) if you need to manage the backend or deploy from your machine:
   ```bash
   npm install -g supabase vercel
   ```

## Environment Variables

Create a `.env.local` file in the project root (never commit it):

```bash
# Public — safe to expose to the browser bundle
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>

# Server-side only (used by /api serverless functions). Never expose to the frontend bundle.
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

You can find these values in the Supabase dashboard under **Project Settings → API**.

When deploying to Vercel, set the same four variables in **Project Settings → Environment Variables**.

## Run Locally

```bash
npm run dev
```

This starts the Vite dev server against your Supabase project. Note that the `/api/*` serverless functions (`api/manage-users.js`, `api/apply-contador-invite.js`) only run on Vercel — use `vercel dev` instead if you need to exercise those locally:

```bash
vercel dev
```

## Database Schema & Migrations

The Postgres schema, RLS policies, and storage bucket setup live in `supabase/migrations/`. Apply them to a Supabase project with:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

## Build

```bash
npm run build
```

## Lint & Typecheck

```bash
npm run lint
npm run typecheck
```

## Deploy

The app is deployed on Vercel at [vercel.com/prced-contabil/procedcontabilidade](https://vercel.com/prced-contabil/procedcontabilidade). Pushing to the linked branch triggers a deployment, or deploy manually with:

```bash
vercel --prod
```

## Architecture Notes

- `src/api/supabaseClient.js` — Supabase client used by the frontend (anon key).
- `src/api/entities.js` — thin wrapper exposing `list/filter/get/create/update/delete` per table, plus Storage helpers for the `documents` bucket.
- `src/api/auth.js` — auth helpers (login, signup, password reset, session).
- `api/_lib/supabaseAdmin.js` — shared helper for Vercel serverless functions using the **service role key** (never imported from frontend code).
- `api/manage-users.js`, `api/apply-contador-invite.js` — privileged operations (inviting/promoting/deleting users) that must run server-side.
