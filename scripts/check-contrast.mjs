#!/usr/bin/env node
/**
 * ============================================================================
 * Contrast audit — WCAG 2.1 (sRGB), zero dependencies
 * ============================================================================
 *
 * Every colour pair the site actually renders, asserted against AA. Token
 * values are PARSED OUT OF app/globals.css rather than copied here, so this
 * cannot drift from the palette — if a token changes, the next run re-measures.
 *
 * Run: pnpm check-contrast
 *
 * Thresholds (WCAG 1.4.3 / 1.4.11):
 *   text        4.5:1
 *   large text  3:1   — 24px+, or 18.66px+ bold
 *   ui          3:1   — borders, icons, focus rings, non-text boundaries
 *
 * KNOWN failures are listed explicitly at the bottom with the reason. They
 * print loudly but do not fail the run — the point is that they stay visible
 * and deliberate rather than being silently rounded away.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// ---------------------------------------------------------------------------
// Colour maths
// ---------------------------------------------------------------------------

const hexToRgb = (hex) => {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? [...h].map((c) => c + c).join("") : h;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
};

const toLinear = (c) => {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

const luminance = ([r, g, b]) =>
  0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);

const contrast = (fg, bg) => {
  const [hi, lo] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
  return (hi + 0.05) / (lo + 0.05);
};

/** Composite a translucent foreground over an opaque background. */
const over = (fg, bg, alpha) => fg.map((c, i) => c * alpha + bg[i] * (1 - alpha));

// ---------------------------------------------------------------------------
// Tokens — parsed from the single source of truth
// ---------------------------------------------------------------------------

const css = readFileSync(resolve(root, "app/globals.css"), "utf8");
const tokens = {};
for (const [, name, hex] of css.matchAll(/--color-([a-z0-9-]+):\s*(#[0-9a-fA-F]{3,8})\s*;/g)) {
  tokens[name] = hexToRgb(hex);
}

const T = (name) => {
  const v = tokens[name];
  if (!v) throw new Error(`Unknown token --color-${name} (not found in app/globals.css)`);
  return v;
};

const WHITE = [255, 255, 255];

// ---------------------------------------------------------------------------
// Pairs
// ---------------------------------------------------------------------------

const AA = 4.5;
const LARGE = 3;
const UI = 3;

/** [label, foreground, background, threshold] */
const pairs = [];

// Body text on each page surface.
for (const surface of ["background", "surface", "surface-strong"]) {
  for (const text of ["foreground", "foreground-muted", "foreground-subtle"]) {
    pairs.push([`${text} on ${surface}`, T(text), T(surface), AA]);
  }
}

// Action roles — button labels are normal-size text.
for (const role of ["primary", "secondary", "accent", "highlight"]) {
  pairs.push([`on-${role} on ${role}`, T(`on-${role}`), T(role), AA]);
  pairs.push([`on-${role} on ${role}-hover`, T(`on-${role}`), T(`${role}-hover`), AA]);
}

// Coral as TEXT. `accent` itself fails on every ground (see `known` below), so
// small coral text uses `accent-strong` instead. These are the pairs that make
// that split worth having — if they ever stop passing, the split is broken.
for (const surface of ["background", "surface", "surface-strong"]) {
  pairs.push([`accent-strong on ${surface}`, T("accent-strong"), T(surface), AA]);
}
// It is most often set on a coral-tinted chip rather than the bare surface.
pairs.push([
  "accent-strong on accent/10 over background",
  T("accent-strong"),
  over(T("accent"), T("background"), 0.1),
  AA,
]);

// Dark sections. `ink` is the one dark surface after the elevation rollback.
pairs.push(["white on ink", WHITE, T("ink"), AA]);
pairs.push(["white/74 on ink", over(WHITE, T("ink"), 0.74), T("ink"), AA]);
pairs.push(["white/55 on ink", over(WHITE, T("ink"), 0.55), T("ink"), LARGE]);
pairs.push(["lilac on ink", T("lilac"), T("ink"), AA]);
pairs.push(["violet on ink", T("violet"), T("ink"), LARGE]);
pairs.push(["coral on ink", T("coral"), T("ink"), LARGE]);

// The on-dark button set (variantsOnDark in components/ui/button.tsx).
pairs.push(["btn primary/dark — ink on lilac", T("ink"), T("lilac"), AA]);
pairs.push([
  "btn secondary/dark — white on white/10 over ink",
  WHITE,
  over(WHITE, T("ink"), 0.1),
  AA,
]);
pairs.push(["btn outline+ghost/dark — white on ink", WHITE, T("ink"), AA]);

/**
 * The hero plate (`.hero-plate`, section 1) — neutral-900, the ramp's darkest
 * step. A second dark surface, but not a second palette: it is the same ramp
 * `ink` comes from, chosen a step darker so section 3's ink band still reads as
 * an arrival rather than a repeat of the hero.
 *
 * The plate's own oversized ground word (white/20) is NOT asserted. It is
 * decorative and aria-hidden — the same exemption HeadingRule takes above. It
 * exists to be a texture behind the portrait; at a ratio that passed for text
 * it would compete with the headline sitting on top of it.
 */
const PLATE = T("neutral-900");
pairs.push(["hero headline — white on plate", WHITE, PLATE, AA]);
pairs.push(["hero calligraphic line — lilac on plate", T("lilac"), PLATE, AA]);
pairs.push(["hero lede — neutral-300 on plate", T("neutral-300"), PLATE, AA]);
// The trust badge's dot. A fill, so the 3:1 graphics threshold, not 4.5:1 —
// which is exactly why the label beside it is lilac and not coral.
pairs.push(["hero badge dot — coral on plate", T("coral"), PLATE, UI]);
// The stats card: white/10 fill, and the two type sizes sitting on it.
const statsCard = over(WHITE, PLATE, 0.1);
pairs.push(["hero stat value — white on card over plate", WHITE, statsCard, AA]);
pairs.push(["hero stat label — neutral-300 on card over plate", T("neutral-300"), statsCard, AA]);
pairs.push(["hero card title — lilac on card over plate", T("lilac"), statsCard, AA]);
// Both hero CTAs come from buttonClasses(…, light), on the plate rather than ink.
pairs.push(["hero btn primary — ink on lilac", T("ink"), T("lilac"), AA]);
pairs.push(["hero btn outline — white on plate", WHITE, PLATE, AA]);

// The focus ring is a real UI component under WCAG 1.4.11.
pairs.push(["focus ring on background", T("focus"), T("background"), UI]);
pairs.push(["focus ring on surface", T("focus"), T("surface"), UI]);

// Violet as TEXT on a LIGHT ground is a size rule, not a ban: 30px bold clears
// the large-text threshold. Section 7 was the headline case and is dark now, so
// what is left is the admin panel's waitlist counter (text-3xl bold on white);
// the `surface` pair stays asserted because surface is still a card ground and
// a large violet line may land on one. Nothing SMALLER may be violet on a light
// ground — labels take plum on a violet tint instead, the same fill-vs-text
// split `accent-strong` makes for coral.
pairs.push(["highlight as large heading on background", T("highlight"), T("background"), LARGE]);
pairs.push(["highlight as large heading on surface", T("highlight"), T("surface"), LARGE]);

/**
 * Section 7 (الذكاء) — the `night` band, neutral-900, under a live dot field.
 *
 * Two grounds have to be measured, not one. The plate itself is the easy case;
 * the hard case is a glyph sitting directly over the BRIGHTEST DOT the field is
 * allowed to draw there. The field damps itself to `GUARD_MIN` across the type
 * (see components/sections/art/ai-particle-field.tsx) precisely so that worst
 * pixel is bounded — GUARD_MIN is duplicated below, so change one and change
 * both, and the crest colour is lilac, the lightest thing the field can be.
 *
 * This is also the measurement that settles the headline: violet is 3.68:1 on
 * the bare plate and would be legal at 30px bold, but 2.34:1 over a guarded
 * dot. So the tail is lilac and violet stays a fill here — which is what
 * CLAUDE.md's dark-section rule says anyway.
 */
const NIGHT = T("neutral-900");
const GUARD_MIN = 0.16; // ai-particle-field.tsx
const GUARDED = over(T("lilac"), NIGHT, GUARD_MIN);

pairs.push(["s7 headline — white on night", WHITE, NIGHT, AA]);
pairs.push(["s7 headline tail — lilac on night", T("lilac"), NIGHT, AA]);
pairs.push(["s7 subhead + note — neutral-300 on night", T("neutral-300"), NIGHT, AA]);
pairs.push(["s7 headline over the brightest guarded dot", WHITE, GUARDED, AA]);
pairs.push(["s7 tail over the brightest guarded dot", T("lilac"), GUARDED, AA]);
pairs.push(["s7 subhead over the brightest guarded dot", T("neutral-300"), GUARDED, AA]);
// The chip: violet fill, lilac label — the fill and the dot are graphics.
pairs.push([
  "s7 chip label — lilac on highlight/15 over night",
  T("lilac"),
  over(T("highlight"), NIGHT, 0.15),
  AA,
]);
pairs.push(["s7 chip dot — highlight on night", T("highlight"), NIGHT, UI]);
// The waitlist field (`fieldClasses(true)`) and the two result states in it.
const well = over(WHITE, NIGHT, 0.1);
pairs.push(["s7 field value — white on white/10 over night", WHITE, well, AA]);
pairs.push(["s7 field placeholder — neutral-300 on white/10 over night", T("neutral-300"), well, AA]);
pairs.push(["s7 success pill — lilac on white/10 over night", T("lilac"), well, AA]);
// The error line: lilac text, coral glyph. `accent-strong` is dark-on-dark here.
pairs.push(["s7 error line — lilac on night", T("lilac"), NIGHT, AA]);
pairs.push(["s7 error glyph — accent on night", T("accent"), NIGHT, UI]);
// The CTA is buttonClasses("primary", "md", light) — ink on lilac, asserted above.

/**
 * Section 8 (الآراء) — the `plum` band, lit by a lilac bloom.
 *
 * Two grounds again, and for the same reason section 7 needs two: the bare
 * plate is the easy case, and the hard one is a glyph over the BRIGHTEST pixel
 * the ground is allowed to reach. There the bound is not a live field but a
 * gradient stop, so it is exact — `.tm-plate` paints a single lightening layer,
 * lilac at `BLOOM_MAX`, and its two deepening layers sit UNDER it at the
 * opposite corner and the opposite edge, so nothing can add to the peak.
 *
 * BLOOM_MAX is duplicated from globals.css, so change one and change both. It
 * is set by this measurement rather than by eye: neutral-300 is the binding
 * pair, because the subhead and the proof line are body-size and everything
 * else on the band is either white or large. At 0.10 neutral-300 measures
 * 4.73:1 as painted; at 0.16 — which is what the reference frame's glow looks
 * like — it is 4.09 and the subhead fails AA.
 *
 * The row below prints 4.75 rather than 4.73 because `over` composites in float
 * and a real ground quantises to 8 bits per channel. That is the audit erring
 * two hundredths GENEROUS, which is the wrong direction, but the gap is far
 * inside the margin every pair here carries and rounding it would change every
 * composited row in this file. Noted rather than fixed. So the section takes its
 * drama from the dark
 * end instead, where the plate falls away toward neutral-900 and contrast only
 * improves.
 *
 * NOT ASSERTED, BECAUSE THEY ARE BANNED HERE: coral is 2.45:1 on plum and
 * violet 2.32:1 — both under the 3:1 graphics floor, so neither is usable on
 * this band even as a fill. The section carries white, lilac and neutral-300
 * and nothing else; see the note in components/sections/testimonials.tsx.
 */
const PLUM = T("primary");
const BLOOM_MAX = 0.1; // .tm-plate in app/globals.css
const BLOOM = over(T("lilac"), PLUM, BLOOM_MAX);

pairs.push(["s8 headline — white on plum", WHITE, PLUM, AA]);
pairs.push(["s8 headline tail + badge — lilac on plum", T("lilac"), PLUM, AA]);
pairs.push(["s8 subhead + proof — neutral-300 on plum", T("neutral-300"), PLUM, AA]);
pairs.push(["s8 headline over the bloom's peak", WHITE, BLOOM, AA]);
pairs.push(["s8 tail + badge over the bloom's peak", T("lilac"), BLOOM, AA]);
pairs.push(["s8 subhead + proof over the bloom's peak", T("neutral-300"), BLOOM, AA]);

// The deck's cards: a white → lilac sheet, so both ends of the gradient carry
// the quote. The lilac end is the binding one and is the same pair as
// `foreground on surface-strong`, restated here because the card's fill is a
// composite rather than the token itself.
const SHEET = over(T("lilac"), WHITE, 0.92);
pairs.push(["s8 quote — foreground on the card's lilac end", T("foreground"), SHEET, AA]);
pairs.push(["s8 author title — foreground-muted on the card's lilac end", T("foreground-muted"), SHEET, AA]);
pairs.push(["s8 read-more — primary on the card's lilac end", T("primary"), SHEET, AA]);
// The arrows are lilac discs with a plum chevron — a graphic, so 3:1.
pairs.push(["s8 arrow glyph — primary on lilac", T("primary"), T("lilac"), UI]);
// And the ring around them, which is lilac and sits on the band, not the disc
// (2px offset — see focusOnDark below).
pairs.push(["s8 focus ring on plum — lilac", T("lilac"), PLUM, UI]);
pairs.push(["s8 focus ring over the bloom's peak — lilac", T("lilac"), BLOOM, UI]);

/**
 * The focus ring on DARK grounds (`focusOnDark` in components/ui/button.tsx).
 *
 * Buttons do not set `outline-none`, so the global outline in globals.css is
 * their entire focus indicator, and WCAG 1.4.11 covers it. The default is
 * `--color-focus`, which is violet — 2.92:1 on ink outright, and on night only
 * 3.68:1 until section 7's field puts a guarded dot behind it, at which point
 * it is 2.34:1. Hence lilac on dark. Both grounds are asserted so a future dark
 * band cannot quietly inherit the violet ring again.
 *
 * The light-ground ring above is `--color-focus` on `background`/`surface` and
 * still passes; nothing here changes it.
 */
pairs.push(["focus ring on ink — lilac", T("lilac"), T("ink"), UI]);
pairs.push(["focus ring on night — lilac", T("lilac"), NIGHT, UI]);
pairs.push(["focus ring on night over a guarded dot — lilac", T("lilac"), GUARDED, UI]);

/**
 * DELIBERATELY NOT ASSERTED — and please don't add them back.
 *
 * Hairline card/divider borders (`border`, `border-strong`) and the heading
 * rule are decorative. WCAG 1.4.11 covers UI components and graphics that are
 * *required to understand the content*; a soft divider is neither, and forcing
 * one to 3:1 would mean a near-black hairline on white. The focus ring above is
 * the thing on this surface that 1.4.11 genuinely does cover, and it passes.
 */

/**
 * Course cards (components/sections/course-card.tsx) put type over a photo, so
 * the only thing keeping them legible is the scrim. Both pairs are measured
 * against the WORST CASE — a fully white image underneath — because the images
 * come from the CMS and cannot be assumed dark.
 *
 * An earlier design used four flat saturated card surfaces with their own
 * measured ratios; that section was reverted upstream and its module deleted,
 * so those pairs are gone rather than being asserted against a dead file.
 */
const scrim = over(T("ink"), WHITE, 0.85); // from-ink/85 over the lightest possible photo
pairs.push(["card title — white on ink/85 scrim", WHITE, scrim, AA]);
pairs.push(["card price badge — ink on white/90", T("ink"), over(WHITE, T("ink"), 0.9), AA]);

// ---------------------------------------------------------------------------
// Known, accepted failures
// ---------------------------------------------------------------------------

/**
 * Pre-existing and deliberate. Each needs a reason, not just an entry.
 */
const known = new Map([
  [
    "on-accent on accent",
    "Coral #e04f64 is the brand accent, and white-on-coral is 3.84:1. Contrast is " +
      "symmetric, so this is the same number as coral-as-text — which is why coral is " +
      "now a FILL colour only, with `accent-strong` carrying small coral text. As a " +
      "fill it clears the 3:1 UI/large-text threshold and stays. Raising it to 4.5 " +
      "needs #c94c5f, which dulls the one colour whose job is to be loud, and makes " +
      "coral-on-ink worse. That is an owner decision, not a lint fix.",
  ],
  [
    "on-accent on accent-hover",
    "Same as above; the hover shade is darker and closer to passing but still short.",
  ],
  [
    "on-highlight on highlight",
    "White on violet #a551fc is 4.05:1 — clears the 3:1 UI/graphics threshold, short of AA " +
      "for a normal-weight label. After the section-7 rebuild the only white-on-violet left " +
      "on the site is line art inside violet tiles — the app icon, the mock's avatar, its " +
      "send arrow — all decorative graphics measured against 3:1. Anything violet carrying " +
      "a small LABEL now " +
      "sets that label in plum on a violet tint instead — the same fill-vs-text split that " +
      "accent-strong makes for coral. Raising the token itself is an owner decision.",
  ],
  [
    "violet on ink",
    "2.92:1, a hair under the 3:1 graphics threshold. Violet is decorative-only on dark " +
      "after the eyebrow moved to lilac — dots, glows, badge fills, never text.",
  ],
  // foreground-subtle is the *tertiary* text colour by definition: timestamps,
  // counts, helper captions. It is never the only way to get information.
  // Listed per surface so a new surface has to be considered rather than
  // inheriting the exemption silently.
  ...["background", "surface", "surface-strong"].map((s) => [
    `foreground-subtle on ${s}`,
    "#8b8392 is the tertiary text colour — metadata only, never content required to " +
      "use the page. Anything load-bearing uses foreground or foreground-muted, both " +
      "of which clear AA on every surface.",
  ]),
]);

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

const fmt = (n) => n.toFixed(2).padStart(5) + ":1";
const label = (t) => (t === AA ? "AA" : "AA-lg/ui");

let failed = 0;
let accepted = 0;
const lines = [];

for (const [name, fg, bg, threshold] of pairs) {
  const ratio = contrast(fg, bg);
  const ok = ratio >= threshold;
  const isKnown = !ok && known.has(name);

  if (ok) lines.push(`  ✓ ${fmt(ratio)}  ${name}  (needs ${threshold} ${label(threshold)})`);
  else if (isKnown) {
    accepted++;
    lines.push(`  ! ${fmt(ratio)}  ${name}  (needs ${threshold} ${label(threshold)})  KNOWN`);
  } else {
    failed++;
    lines.push(`  ✗ ${fmt(ratio)}  ${name}  (needs ${threshold} ${label(threshold)})  FAIL`);
  }
}

console.log("\nContrast audit — WCAG 2.1, sRGB\n");
console.log(lines.join("\n"));

if (accepted) {
  console.log("\nKnown, accepted failures:\n");
  for (const [name, reason] of known) console.log(`  ! ${name}\n    ${reason}\n`);
}

const total = pairs.length;
console.log(
  `\n${total - failed - accepted}/${total} pass · ${accepted} known · ${failed} failing\n`,
);

if (failed) {
  console.error("Contrast audit failed. Fix the pairs marked FAIL, or add a documented");
  console.error("entry to `known` above if the failure is deliberate.\n");
  process.exit(1);
}
