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

`<Section bg>` accepts `background · surface · lilac · ink · night · plum · hero`. The homepage alternates **white ↔ lilac** with two dark anchors — **ink** at section 3 (التعريف) and **night** at section 7 (الذكاء):

`hero · hero-surface · INK · white · lilac · white · NIGHT · white · white · white · lilac`

`<Section screen>` is the other axis: **a one-screen band — `min-h-[90svh]`, content vertically centred, vertical padding height-aware** instead of the standard `py-20 md:py-24`. Section 7 is the only user, and `min-h` is deliberate — a band pinned to exactly 90vh either clips its content or scrolls inside itself as soon as the window is short, the CMS copy runs long or the reader has bumped their font size. **Making the content fit that floor is the section's job, not the primitive's**, and it is a real constraint: see below for what it cost section 7.

**Section 8 (الآراء) is white by owner decision, and the rhythm is weaker for it.** It was the second lilac band; the owner asked for it white, explicitly. The cost is stated here rather than hidden: the page runs 8 · 9 · 10 as three white bands with no step between them, and what separates الآراء from الأسئلة is a `bg-surface` card against a `bg-background` one — the same non-step the next paragraph rules out for *bands*, working here only because a card carries a border and a shadow and a band cannot. If the run ever needs breaking, section 8 is where the lilac came from; do not put it back without asking.

Section 7 going `night` shortened that run without touching it. It used to *begin* at section 7, whose `surface` was itself 1.07:1 against the white on either side — so the page had no visible band boundary anywhere between sections 7 and 11. Now the run is entered off the hardest cut on the page. Three white bands in a row is still three white bands in a row; the difference is that the reader arrives at them from somewhere.

**Do not alternate `background` with `surface`.** #ffffff against #f8f6fb is 1.07:1 — below the threshold of perception, so it produces no rhythm, just a page that looks flat. `lilac` is 1.25:1 against white, which reads. `surface` is for cards and insets and is **not** a band tone; section 7 used to be the one sanctioned exception and no longer is.

**`hero` belongs to section 2 and nowhere else.** It is not a band, it is the *absence* of one: the hero's last layer fades to `--color-surface`, so its bottom row is exactly #f8f6fb, and `.section-hero-surface` holds that same tone through section 2 — the two read as one sheet, with no line where they meet. Deliberately flat: a wash down to white looks like the obvious upgrade, but the challenges diagram's sticky plate has to sit opaque on this ground in the stacked layout, and no flat rectangle can track a gradient — at 1.07:1 it reads as a faint panel behind the artwork even with its edges faded. Anywhere else on the page this tone would be exactly the invisible white/surface alternation the paragraph above rules out; here the ink anchor immediately after is what carries the rhythm.

**Section 7 (الذكاء) is a full-width `night` band under a live dot field.** The ground is `neutral-900` and the art is a canvas — a lattice of dots displaced by travelling waves, bunching into bright arcs and thinning to bare patches, in violet→lilac. It is an owner request, given as a reference clip; the clip is monochrome, so "the same background" means the same **behaviour**, not its black and white. See `components/sections/art/ai-particle-field.tsx`.

It has been three other things, and the history is the reason the current one is shaped as it is. A violet `.ai-shimmer` card shared its formula **verbatim** with section 10's brand CTA — same `rounded-[2rem]`, same `AiOrbit` corner, differing only in hue — so the page said the same thing twice, one screen apart; `.ai-shimmer` was deleted with it, and `AiOrbit` now belongs to `vision` and the course CTA alone. Then an inset `bg-surface` panel, which fenced the section into a column narrower than the page and read as a widget dropped onto the site. Then that same tone carried edge to edge as a `surface` band — which fixed the panel but left the section a 1.07:1 step against the white on *both* sides once section 8 went white too, so nothing but the dot texture and the violet fills marked it as a section at all.

**It is a one-screen band (`<Section screen>`), and the layout did not change to get there — the mockup shrinks instead.** The owner asked for 90vh and for the centred stack to stay. As it stood the band measured **1032px**: 840 of content (tile 72, chip 34, headline 94, subhead 59, form 92, mockup 332, gaps 157) under 192 of padding, or 1.5 screens on a 1366×768 laptop. It is compressed in the order that costs the design least — **padding** (~100px at 768, height-aware, invisible), then the **gaps** (~60px, likewise), then the **tile and the headline** (~30px, clamped between 28 and 36px the way `hero.tsx` clamps its own), and then the **mockup**, which after all of that is still the only thing over budget below a ~1000px window. It scales with the window height via `--ai-mock` (`.ai-mock`, globals.css): 0.9 at a 1008px window, 0.72 at 900, 0.56 at 768, 0.40 at 673. Verified **exactly 90vh from 1024×768 up**.

**The cost is the drawing's legibility, and it is the whole reason this is worth writing down.** The phone's chat text is 12px, so at 0.56 it is ~7px and the source chip reads as a shape rather than as words. Nothing the reader has to *read* is compressed — the subhead, the form, the note and the chips all keep their sizes at every height; the compression is spent on artwork only. Below a ~672px window the ladder stops and the band grows instead, because the scale needed at 600px is 0.22 and a 63px sticker looks broken rather than compact. Same on a phone, where the stack is ~1170px against a ~760px budget: 90svh is a floor there, and dropping the `aria-hidden` mockup to force a fit would cost the section its product shot on most of its traffic. If the drawing's text matters more than the exact 90vh on short windows, raise the floor — it is one number per step in `.ai-mock`.

**Why it went dark, and why `night` rather than `ink`.** The effect is a bright lattice on a deep plate; on a light band there is nothing for a dot to be brighter *than*, and the same field comes out as grey speckle on lavender. `neutral-900` (the ramp's darkest step, and the hero plate's value — so the site has one deep dark, not three) rather than `ink` for two reasons: every step of extra depth is contrast headroom spent on letting the dots be brighter, and section 3 is already ink, so a second ink band four sections later would read as the same band returning instead of as its own place. Section 6 → 7 is now the hardest cut on the page, which is the one boundary where a hard cut is the point.

**Violet is a fill here, never text — including the headline tail, which is now lilac.** Violet is 3.68:1 on the bare plate and would be legal at 30px bold, but only 2.34:1 once a guarded dot sits under it. What marks the section is violet **fills**: the app-icon tile, the "قريباً" chip and its dot, the field's own troughs, the bloom behind the device. Tinting the band violet instead is the obvious alternative and is wrong: it would put the section's one hue on its ground as well as on everything standing on it, leaving the tile and the chip nothing to be violet *against*, and it is a light ground again — which is the thing this section moved off.

**Sections 7 and 10 are further apart than they have ever been, and section 10 is the only card.** They used to converge (both light cards, "same card, different hue" one screen apart). What separates them now: **ground** (night vs light), **shape** (7 is an open band, 10 a rounded `.cta-sheet` card sitting in a white one), **hue** (7 violet, 10 coral), **the accent line** (10 sets its tail in Ruqʿah `font-calligraphy` — the hero's device, used a second and *last* time there; 7 no longer accents its tail at all), and **what fills them** (7 has an app-icon tile, a device mockup and a form; 10 has an eyebrow chip, buttons and faces). If section 7 ever gets boxed again, check the two side by side before shipping. The pill above the headline is shared on purpose — the hero's trust badge is the same shape — so that one is a system, not a duplicate.

### Rules
- **Violet as text is a size rule on LIGHT grounds, and a ban on dark ones.** #a551fc is 4.05:1 on white and 3.78:1 on surface — large text (24px+, or 18.66px+ bold) and graphics only; both grounds are asserted in `check-contrast`. Nothing smaller may be violet on a light ground — the mockup's source chip sets its label in `text-primary` and keeps violet in the fill and the icon. Same fill-vs-text split `accent-strong` already makes for coral. On dark it is a fill full stop: 2.92:1 on ink, and 3.68:1 on night only until a dot from the field lands under it.
- **A dot field fades inward, never outward.** A full-bleed dot field is the stock SaaS background; damping it where the type is, so it frames the content instead of sitting behind it, is the only thing that stops it reading as one — and on a dark band it is a legibility requirement too, since a lilac dot is 1.25:1 against white text. Section 7's canvas enforces this per dot (`GUARD_MIN` in `ai-particle-field.tsx`, asserted in `check-contrast` and verified by sampling the real canvas — the worst pixel under real glyphs measures white 10.06:1, lilac 8.08:1, neutral-300 6.71:1). The **plateau** is the part to get right: a guard that merely eases outward from its centre is only worth its minimum at one pixel, and is already twice that under the ends of the headline. Flat across the type, soft only at its outer edge. It is also **measured, not positioned** — the field reads the box of the block it must keep legible (`[data-ai-copy]`) and holds the minimum across exactly that box, because a fixed ellipse assumed the copy always lands in the same place and it does not: the band is one screen now, so its rhythm and type move with the window height, and the copy block runs from 378px tall to 598. Anything that must stay legible on that band belongs inside that block; the mockup and the chips are outside it on purpose, since they are opaque and guarding them would damp the field across the whole band. This rule outlived `.dot-grid`, the CSS texture that first stated it — that one masked out the `max-w-6xl` column with hard stops and switched itself off entirely below 72rem, having no gutters left to live in.
- **Radii are remapped.** `@theme` sets `rounded-lg`=1rem, `rounded-xl`=1.5rem, `rounded-2xl`=2rem. `rounded-3xl`/`4xl` fall through to Tailwind's stock values and are therefore **smaller** than our `2xl` — never use them.
- **A hairline is not elevation, and the shadow ramp is light-ground only.** `border` is 1.16:1 on white, so on the two pairings the site actually uses — white on white (الأسئلة) and white on `surface` (المنهج, the whole admin panel) — a bordered card had *nothing* separating it from its ground, because those grounds are 1.00:1 and 1.07:1 against it. A card takes a border **and** a shadow: the border draws the edge, the shadow separates the surface. `shadow-sm` is the default and is almost always the right one; `-md`/`-lg` are for a genuinely raised thing (dropdown, floating button, hover target) and `-xl` for the heaviest object in its section. All four are ink-tinted (`-xl` plum-tinted), so **none of them work on `ink` or `night`** — a dark blur on a dark plate is invisible. To lift a figure off a dark band use a coloured glow (`.ai-tile`) or light instead of shade (`ai-assistant-preview`). Dashed empty-state boxes stay flat on purpose: a placeholder marks an absence, and lifting it makes "nothing here yet" read as an object. `/styleguide` renders the ramp on both light grounds.
- **`shadow-nav` is for full-bleed fixed bars and nothing else.** The frosted header and the course page's sticky buy bar are the only two, and they share it deliberately — they stack a few pixels apart, and two overlay bars at different depths read as a rendering bug. It is not a card shadow: a card's shadow spans ~360px and reads as depth, the same shadow spanning the viewport reads as a grey smear, so this one's blur is pulled tight by its spread and the alpha carries the weight — measured off the rendered page, −10/255 luminance directly under the bar, gone by ~11px, and nothing inside the bar. Frosting is three things — blur, hairline, shadow — and the header takes all three or none; a shadow under the transparent at-rest bar would be a shadow cast by nothing.
- **Coral is a fill, never small text.** Contrast is symmetric, so coral-on-white and white-on-coral are the same 3.84:1 — it fails AA as body-size text on *every* ground (3.84 on white, 3.08 on ink). Use `text-accent-strong` on light grounds and `text-lilac` on ink. Coral fills stay: they clear the 3:1 UI/graphics threshold.
- **Dark sections (`ink` or `night` background):** plum is unusable — 1.26:1 on ink. Use **lilac or white** for actions and text, `neutral-300` for secondary copy; **coral** for accents. **Violet is decorative-only on dark** — never text.
- **Buttons and fields on dark grounds:** pass `light` to `Button` / `buttonClasses(variant, size, light)` and to `Input` / `Textarea` / `fieldClasses(light)` — the same convention `SectionHeading` uses. Don't hand-roll a dark CTA or a dark input; that is how the previous four dark treatments drifted apart, and the waitlist form had already hand-rolled its dark pill once before losing it.
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
   - **Dashboard:** paste `supabase/full_setup.sql` into the SQL editor and run. It is the flattened equivalent of every migration plus starter content, and is idempotent — **re-run it after any new migration**; or
   - **CLI:** `npx supabase link --project-ref <ref>` then `npx supabase db push` (migrations) and run the seed.
3. Create the owner: `node scripts/create-admin.mjs <email> <password>` (reads service-role env). Then sign in at `/admin/login`.

**`full_setup.sql` must never fall behind `migrations/`.** It did — 0003, 0005 and 0006 were never folded in — and that is what broke the admin panel: PostgREST rejects the **entire row** when a write names a column the table lacks (`PGRST204`), so three missing `final_cta_*` columns took down the whole الرئيسية editor, and 0005 took down المدونة and التواصل with it. `pnpm check-schema` now diffs the two files (and checks that every column `saveSettings` writes actually exists); run it whenever either side changes. Belt and braces, `saveSettings` also drops a rejected column and retries rather than losing the save, then reports which fields were skipped.

### Deploying to Netlify

Hosting is **Netlify**. The Next.js runtime (`@netlify/plugin-nextjs` / OpenNext adapter) installs automatically — Next 16 (Turbopack, `proxy.ts`, React Compiler) is supported with zero config. Do **not** pin or manually add the adapter.

- `netlify.toml` sets the build command (`pnpm build`), Node 22, and tells the secret scanner to ignore the public Supabase keys.
- Set env vars in **Netlify → Site configuration → Environment variables** (not just `.env.local`): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`. The `NEXT_PUBLIC_*` ones are inlined at build, so they must exist **before** the build runs; the service-role key is used only server-side.
- The migration/seed still run against Supabase (dashboard SQL editor or CLI) — that's independent of Netlify.
- `.env.local` remains for local `pnpm dev` only.

## Commands
- `pnpm dev` — dev server · `pnpm build` — build · `pnpm lint` — eslint (incl. the palette rules) · `pnpm type-check` — tsc · `pnpm check-contrast` — WCAG AA audit of every colour pair · `pnpm check-schema` — `full_setup.sql` vs `migrations/` drift audit
