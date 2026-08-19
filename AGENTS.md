# AGENTS.md

## Project Context

This is the Proced Contabilidade application repository: a React/Vite frontend backed by Supabase (database, auth, storage) and deployed on Vercel (static hosting + serverless functions). Treat it as user-owned application code, keep changes focused on the user's request, and preserve existing project conventions.

Start with `README.md` for local setup, environment variables, and the deploy workflow.

## Key Files

- `src/`: frontend application source.
- `src/api/supabaseClient.js`: frontend Supabase client (anon key).
- `src/api/entities.js`: `list/filter/get/create/update/delete` wrapper per table, plus Storage helpers for the `documents` bucket.
- `src/api/auth.js`: auth helpers (login, signup, password reset, session).
- `api/`: Vercel Serverless Functions for privileged operations (using the Supabase service role key). Never import `api/_lib/supabaseAdmin.js` from frontend code.
- `supabase/migrations/`: Postgres schema, RLS policies, and storage bucket setup.
- `vite.config.js`: Vite config, including the `@/*` -> `src/*` path alias.
- `.env.local`: local-only environment values (Supabase URL/keys); never commit secrets.

## Working Notes

- Run the full local dev server with `npm run dev` (frontend against the hosted Supabase project). Use `vercel dev` if you need to exercise the `/api/*` serverless functions locally.
- Apply database schema changes via `supabase/migrations/` and `supabase db push`; never edit the remote schema by hand.
- Keep privileged operations (user management, service-role queries) inside `api/` serverless functions — never expose the Supabase service role key to frontend code.
- Run the relevant checks from `package.json` (`npm run lint`, `npm run build`, `npm run typecheck`) before finishing code changes.
