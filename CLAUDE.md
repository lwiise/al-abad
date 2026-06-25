@AGENTS.md

# الأستاذ علي العباد — Marketing site + CMS

Fast, fully-owned rebuild of the marketing site (replacing Webflow at `al-abbad.com`).
Next.js (App Router) + TypeScript + Tailwind v4 + Supabase (Postgres, Auth, Storage). Arabic, RTL.

## Two-system architecture (read this first)

- **This repo = marketing site + its CMS.** Public pages live under `app/(marketing)`; the owner edits everything through the custom panel under `app/(admin)/admin`.
- **The LMS is separate.** Students log in and watch courses at `academy.al-abbad.com` — a different system we are **leaving untouched for now**. Course `cta_url`s currently point there.
- **Future-proofing:** the LMS will be replaced later. The Supabase project is designed so future `students` / `enrollments` / `payments` tables can be added to **this same project** without reworking anything here. Don't build them now; just don't couple marketing tables to them.

## Design language — no AI-slop defaults

**Every choice is intentional.** The premium feel comes from the neutral ramp, generous spacing, and Tajawal type — brand colour is used deliberately, never as decoration. Specifically avoid the generic "purple-gradient-on-white" look (our palette is plum/violet, so this is a real trap).

### Brand tokens → Tailwind utilities (defined in `app/globals.css` `@theme`)

| Role | Token / utility | Hex | Use for |
|---|---|---|---|
| primary | `plum` / `primary` | `#583b66` | primary buttons, active nav, links, key emphasis |
| secondary | `teal` / `secondary` | `#0d678b` | supporting accents, secondary buttons, icons, variety |
| accent / CTA | `coral` / `accent` | `#e04f64` | promo bar + the single most important CTA per screen; sale/urgency only |
| highlight | `violet` / `highlight` | `#a551fc` | AI section + "new / قريباً" badges only — don't overuse |
| surface tint | `lilac` / `surface-strong` | `#ebe3f7` | alternating section backgrounds, cards, soft fills |
| ink | `ink` | `#3a363d` | primary text, dark sections, footer |

Text colours: `text-foreground` (#3a363d, brief's *text-primary*), `text-foreground-muted` (#5f566a, *text-secondary*), `text-foreground-subtle` (#8b8392, *text-tertiary*).
Surfaces: `bg-background` (#fff), `bg-surface` (#f8f6fb), `bg-surface-strong` (#ebe3f7).
Borders: `border-border` (#e6e1ee), `border-border-strong` (#d3cdde). Focus ring: `ring-focus`/outline `#a551fc`.
Each action role has `-hover` and `on-*` (label) variants, e.g. `bg-primary hover:bg-primary-hover text-on-primary`.

### Rules
- **Dark sections (ink background):** plum is too close to the background — use **lilac or white** for primary actions there, and let **coral / violet / teal** carry accents.
- **Never pure black** — use `ink` / the `neutral-*` ramp.
- Use `bg-surface` and `bg-surface-strong` (lilac) for alternating section backgrounds — rhythm without harsh dividers.
- **Type:** Tajawal everywhere. Headings weight 500–700 at display sizes; body 400 with generous line-height (~1.8 for Arabic). Modular scale + soft radii/shadows are tokenised in `@theme`.

## RTL / Arabic conventions

- Root layout is `<html lang="ar" dir="rtl">` with Tajawal as the default sans (`next/font/google`, arabic+latin subsets).
- **Never** apply letter-spacing to Arabic (it breaks letter joining) — nulled globally in `globals.css`.
- Use **logical** Tailwind utilities: `ps-*`/`pe-*`, `ms-*`/`me-*`, `start-*`/`end-*` — **never** `left/right`, `ml/mr`, `pl/pr`.
- Default voice/copy is Arabic.

## Next.js 16 notes (this is NOT the Next you may know)

- Request APIs are **async**: `await cookies()`, `await headers()`, and `await params` / `await searchParams` in pages/layouts/routes.
- `middleware.ts` was renamed to **`proxy.ts`** (Node.js runtime, no edge). Ours refreshes the Supabase session and optimistically gates `/admin`.
- `next lint` is gone — use `pnpm lint` (eslint) and `pnpm type-check` (tsc).
- `images.domains` is deprecated — use `images.remotePatterns` (configured for `*.supabase.co`).

## Supabase

- Clients: `lib/supabase/server.ts` (RSC/actions, anon+RLS), `client.ts` (browser), `admin.ts` (**service-role, `server-only`, bypasses RLS** — admin writes/reads only), `proxy.ts` (session refresh helper used by root `proxy.ts`).
- **RLS:** anon may read published content + `site_settings`, and insert into `contact_submissions`/`ai_waitlist`. `admin_users` has RLS on with **zero policies**. All admin writes go through the service-role client in server actions.
- Auth: email + password, single owner. `requireAdmin()` (`lib/auth.ts`) verifies a session **and** an `admin_users` row; call it at the top of every protected admin page/layout.
- Schema types in `lib/database.types.ts` are hand-authored to match `supabase/migrations/0001_init.sql`. Regenerate once linked: `npx supabase gen types typescript --project-id <ref> > lib/database.types.ts`.

### Applying the schema to a hosted project
1. Create a project at supabase.com. Copy URL + anon key + service-role key into `.env.local` (see `.env.local.example`).
2. Apply schema + seed — either:
   - **Dashboard:** paste `supabase/migrations/0001_init.sql` then `supabase/seed.sql` into the SQL editor and run; or
   - **CLI:** `npx supabase link --project-ref <ref>` then `npx supabase db push` (migrations) and run the seed.
3. Create the owner: `node scripts/create-admin.mjs <email> <password>` (reads service-role env). Then sign in at `/admin/login`.

## Commands
- `pnpm dev` — dev server · `pnpm build` — build · `pnpm lint` — eslint · `pnpm type-check` — tsc
