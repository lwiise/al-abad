@AGENTS.md

# الأستاذ علي العباد — Marketing site + CMS

Fast, fully-owned rebuild of the marketing site (replacing Webflow at `al-abbad.com`).
Next.js (App Router) + TypeScript + Tailwind v4 + Supabase (Postgres, Auth, Storage). Arabic, RTL.

## Two-system architecture (read this first)

- **This repo = marketing site + its CMS.** Public pages live under `app/(marketing)`; the owner edits everything through the custom panel under `app/(admin)/admin`.
- **The LMS is separate.** Students log in and watch courses at `academy.al-abbad.com` — a different system we are **leaving untouched for now**. Course `cta_url`s currently point there.
- **Future-proofing:** the LMS will be replaced later. The Supabase project is designed so future `students` / `enrollments` / `payments` tables can be added to **this same project** without reworking anything here. Don't build them now; just don't couple marketing tables to them.

## Design language — no AI-slop defaults

**Every choice is intentional.** The premium feel comes from the neutral ramp, generous spacing, and the type pairing — brand colour is used deliberately, never as decoration. Specifically avoid the generic "purple-gradient-on-white" look (our palette is plum/violet, so this is a real trap).

### Brand tokens → Tailwind utilities (defined in `app/globals.css` `@theme`)

| Role | Token / utility | Hex | Use for |
|---|---|---|---|
| primary | `plum` / `primary` | `#583b66` | primary buttons, active nav, links, key emphasis |
| secondary | `teal` / `secondary` | `#0d678b` | supporting accents, secondary buttons, icons, variety |
| accent / CTA | `coral` / `accent` | `#e04f64` | **fills only** — promo bar + the single most important CTA per screen; sale/urgency |
| accent as text | `accent-strong` | `#9e4554` | coral **as small text** on light grounds (badges, status, chips) |
| highlight | `violet` / `highlight` | `#a551fc` | AI section + "new / قريباً" badges only — don't overuse |
| surface tint | `lilac` / `surface-strong` | `#ebe3f7` | alternating section backgrounds, cards, soft fills |
| ink | `ink` | `#3a363d` | primary text, dark sections, footer |

Text colours: `text-foreground` (#3a363d, brief's *text-primary*), `text-foreground-muted` (#5f566a, *text-secondary*), `text-foreground-subtle` (#8b8392, *text-tertiary* — metadata only, it does not clear AA).
Surfaces: `bg-background` (#fff), `bg-surface` (#f8f6fb), `bg-surface-strong` (#ebe3f7).
Borders: `border-border` (#e6e1ee), `border-border-strong` (#d3cdde). Focus ring: `ring-focus`/outline `#a551fc`.
Each action role has `-hover` and `on-*` (label) variants, e.g. `bg-primary hover:bg-primary-hover text-on-primary`.
One non-palette token: `whatsapp` (#25d366) — WhatsApp's own brand green, for their glyphs only.

**There is no second palette.** A warm "elevation" set (paper / sand / ink-deep / aubergine / charcoal / violet-accent) was trialled and retired — it only ever reached the first four homepage sections, so the page ran warm to section 4 and cold from section 5, which is what made the site read as inconsistent. Don't reintroduce a second neutral family; if a section needs a different ground it takes one of the five `<Section bg>` tones.

### Section rhythm

`<Section bg>` accepts `background · surface · lilac · ink · plum`. The homepage alternates **white ↔ lilac** with **ink** as the single dark anchor at section 3 (التعريف):

`hero · lilac · INK · white · lilac · white · white · lilac · white · white · lilac`

**Do not alternate `background` with `surface`.** #ffffff against #f8f6fb is 1.07:1 — below the threshold of perception, so it produces no rhythm, just a page that looks flat. `lilac` is 1.25:1 against white, which reads. `surface` is for cards and insets.

### Rules
- **Coral is a fill, never small text.** Contrast is symmetric, so coral-on-white and white-on-coral are the same 3.84:1 — it fails AA as body-size text on *every* ground (3.84 on white, 3.08 on ink). Use `text-accent-strong` on light grounds and `text-lilac` on ink. Coral fills stay: they clear the 3:1 UI/graphics threshold.
- **Dark sections (ink background):** plum is unusable — 1.26:1 on ink. Use **lilac or white** for actions and text; **coral** for accents. **Violet is decorative-only on dark** (2.92:1) — never text.
- **Buttons on dark grounds:** pass `light` to `Button` / `buttonClasses(variant, size, light)` — the same convention `SectionHeading` uses. Don't hand-roll a dark CTA; that is how the previous four dark treatments drifted apart.
- **Never pure black** — use `ink` / the `neutral-*` ramp.
- **Heading rules are flat, never gradients.** Use the shared `HeadingRule` from `components/sections/section.tsx`. There were once seven hand-copied `bg-gradient-to-r from-primary to-secondary` bars; an identical two-hue gradient under every heading is the clearest "generic template" signal a page can carry.
- **No colour outside the tokens.** `pnpm lint` fails on arbitrary colour values (`bg-[#…]`), Tailwind's default numbered scales (`text-amber-300`), and raw hex. Note `bg-teal` is ours and legal while `bg-teal-500` is Tailwind's and is not.
- **CSS variables do not resolve in SVG presentation attributes.** Use `style={{ stopColor: "var(--color-primary)" }}`, not `stopColor="var(…)"`.
- **`pnpm check-contrast`** measures every real fg/bg pair against WCAG 2.1 AA and fails on a regression. Known, accepted failures are listed in the script with a reason each — the main one is white-on-coral at 3.84:1, which would need an owner decision to fix since coral is the brand accent.
- **`/styleguide`** (noindex) renders every token, variant and section tone on one page. Check it after any colour change.
- **Type:** **Readex Pro** for display/headings (`--font-display`, applied to `h1–h6`) + **IBM Plex Sans Arabic** for body (`--font-sans`); both via `next/font/google`. Body 400 with generous line-height (~1.8 for Arabic). Modular scale + soft radii/shadows are tokenised in `@theme`. (Replaced the original Tajawal in Phase 2.1.)

## RTL / Arabic conventions

- Root layout is `<html lang="ar" dir="rtl">` with IBM Plex Sans Arabic as the default sans + Readex Pro for headings (`next/font/google`, arabic+latin subsets).
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

### Deploying to Netlify

Hosting is **Netlify**. The Next.js runtime (`@netlify/plugin-nextjs` / OpenNext adapter) installs automatically — Next 16 (Turbopack, `proxy.ts`, React Compiler) is supported with zero config. Do **not** pin or manually add the adapter.

- `netlify.toml` sets the build command (`pnpm build`), Node 22, and tells the secret scanner to ignore the public Supabase keys.
- Set env vars in **Netlify → Site configuration → Environment variables** (not just `.env.local`): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`. The `NEXT_PUBLIC_*` ones are inlined at build, so they must exist **before** the build runs; the service-role key is used only server-side.
- The migration/seed still run against Supabase (dashboard SQL editor or CLI) — that's independent of Netlify.
- `.env.local` remains for local `pnpm dev` only.

## Commands
- `pnpm dev` — dev server · `pnpm build` — build · `pnpm lint` — eslint (incl. the palette rules) · `pnpm type-check` — tsc · `pnpm check-contrast` — WCAG AA audit of every colour pair
