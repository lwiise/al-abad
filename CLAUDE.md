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

`<Section bg>` accepts `background · surface · lilac · ink · plum · hero`. The homepage alternates **white ↔ lilac** with **ink** as the single dark anchor at section 3 (التعريف):

`hero · hero-surface · INK · white · lilac · white · white · lilac · white · white · lilac`

**Do not alternate `background` with `surface`.** #ffffff against #f8f6fb is 1.07:1 — below the threshold of perception, so it produces no rhythm, just a page that looks flat. `lilac` is 1.25:1 against white, which reads. `surface` is for cards and insets.

**`hero` belongs to section 2 and nowhere else.** It is not a band, it is the *absence* of one: the hero's last layer fades to `--color-surface`, so its bottom row is exactly #f8f6fb, and `.section-hero-surface` holds that same tone through section 2 — the two read as one sheet, with no line where they meet. Deliberately flat: a wash down to white looks like the obvious upgrade, but the challenges diagram's sticky plate has to sit opaque on this ground in the stacked layout, and no flat rectangle can track a gradient — at 1.07:1 it reads as a faint panel behind the artwork even with its edges faded. Anywhere else on the page this tone would be exactly the invisible white/surface alternation the paragraph above rules out; here the ink anchor immediately after is what carries the rhythm.

**Section 7 (الذكاء) is the sanctioned use of `surface`.** The band stays `background`; what separates the section is an **inset panel** — `bg-surface` + `border-border` + `shadow-lg` + the `.dot-grid` texture — with white air around it. That is not the alternation ruled out above: #f8f6fb against #ffffff is invisible as an edge-to-edge *band*, but as a panel the hairline border and the shadow carry the edge and the tone only fills in behind them. Moving section 7 to a `lilac` band was the obvious alternative and is wrong — section 8 is already lilac, so it would merge the waiting list into the testimonials. The panel was a violet `.ai-shimmer` card, and it shared that formula **verbatim** with section 10's brand CTA — same `rounded-[2rem]`, same `AiOrbit` corner, differing only in hue — so the page said the same thing twice, one screen apart. `.ai-shimmer` was deleted with it; `AiOrbit` now belongs to `vision` and the course CTA alone. Violet still marks the section, but as **fills on a light ground**: the app-icon tile, the "قريباً" chip, the second headline line, the dots on the chips.

**Sections 7 and 10 are both light cards now — keep them apart deliberately.** They converged from opposite directions (7 came down off a violet gradient, 10 off `.shimmer-brand`), so the old "same card, different hue" trap is live again and four things are load-bearing: **hue** (7 is violet, 10 is coral), **ground** (7 is flat `bg-surface` with the `.dot-grid` rim; 10 is the `.cta-sheet` wash inside a lilac mat), **the accent line's typeface** (7 sets its tail in violet sans, 10 in Ruqʿah `font-calligraphy` — and Ruqʿah is the hero's device, used a second and *last* time there), and **what fills the card** (7 has an app-icon tile, a device mockup and a form; 10 has an eyebrow chip, buttons and faces). Change any one of those and check the two side by side before shipping. The pill above the headline is shared on purpose — the hero's trust badge is the same shape — so that one is a system, not a duplicate.

### Rules
- **Violet as text is a size rule, not a ban.** #a551fc is 4.05:1 on white and 3.78:1 on surface — large text (24px+, or 18.66px+ bold) and graphics only. Section 7's second headline line is `text-3xl font-bold`, so it takes `text-highlight`; both pairs are asserted in `check-contrast`. Nothing smaller may be violet on a light ground — the "قريباً" chip and the mockup's source chip set their labels in `text-primary` and keep violet in the fill, the dot and the icon. Same fill-vs-text split `accent-strong` already makes for coral.
- **`.dot-grid` fades inward, never outward.** Its mask is a radial gradient that is *transparent in the middle and opaque at the rim*, so the dots frame the panel instead of sitting behind the type — a full-bleed dot field is the stock SaaS background, and the mask is the only thing that stops it reading as one. It must be its own layer, never the panel: `mask-image` masks `background-color` too, so masking the panel would eat the surface fill along with the dots.
- **Radii are remapped.** `@theme` sets `rounded-lg`=1rem, `rounded-xl`=1.5rem, `rounded-2xl`=2rem. `rounded-3xl`/`4xl` fall through to Tailwind's stock values and are therefore **smaller** than our `2xl` — never use them.
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
