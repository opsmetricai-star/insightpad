# InsightPad

AI-native analytics for business teams. The AI plans a structured query, deterministic code computes every figure, and each answer shows its plan.

Stack: Next.js 16, React 19, TypeScript, Tailwind CSS 4, Supabase (auth, Postgres, storage, RLS), Google Gemini (server only).

## Setup

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in every value.
3. In the Supabase dashboard, open **SQL Editor** and run `supabase/schema.sql` once (it includes the API-role grants, also available separately in `supabase/grants.sql`). It creates all tables, Row Level Security policies, the `consume_credits` function, the new-user trigger and the private `datasets` storage bucket.
4. In Supabase **Authentication > URL Configuration**, set **Site URL** to your production URL and add `https://YOUR-DOMAIN/auth/callback` to **Redirect URLs**. Confirmation and reset emails use this setting.
5. `npm run dev`

## Environment variables

| Variable | Scope | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | Supabase anon key (protected by RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | server | Admin payment approval and public share links. Never expose. |
| `GEMINI_API_KEY` | server | AI planning and narration |
| `GEMINI_MODEL` | server | Primary model; falls back across other Gemini models if overloaded |
| `NEXT_PUBLIC_SITE_URL` | public | Optional. Overrides the origin used in auth emails |
| `NEXT_PUBLIC_PAY_LINK_*` | public | Checkout links per plan (defaults in `src/content/site.ts`) |
| `ADMIN_EMAILS` | server | Comma-separated emails that can approve payments at `/app/admin` |

## Payments

Paid plans use external checkout links. Returning from checkout never upgrades a plan. The user submits the order reference on `/app/billing`; an administrator verifies it in the payment provider and approves it at `/app/admin`, which updates the subscription with the service role.

## Deploying to Vercel

Import the repository, add the variables above, and deploy. Every secret stays server-side.
