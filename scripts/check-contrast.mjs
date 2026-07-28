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

/** `color-mix(in srgb, a <pct>%, b)` — matches how the CSS function resolves. */
const mix = (a, b, pct) => a.map((c, i) => (c * pct + b[i] * (100 - pct)) / 100);

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

// The focus ring is a real UI component under WCAG 1.4.11.
pairs.push(["focus ring on background", T("focus"), T("background"), UI]);
pairs.push(["focus ring on surface", T("focus"), T("surface"), UI]);

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
 * Course-card surfaces — mirrors CARD_SURFACES in
 * components/sections/courses/course-slots.ts. Ratios are kept in sync by this
 * script: change a mix there, change it here, re-run.
 *
 * Cards carry white body text and a white/85 eyebrow + meta row.
 */
const cardSurfaces = {
  teal: T("teal"),
  plum: T("primary"),
  ink: T("ink"),
  accent: mix(T("accent"), T("ink"), 60),
};

for (const [name, bg] of Object.entries(cardSurfaces)) {
  pairs.push([`white on card:${name}`, WHITE, bg, AA]);
  pairs.push([`white/85 on card:${name}`, over(WHITE, bg, 0.85), bg, AA]);
}

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
    "White on violet #a551fc is 4.05:1 — clears large text and UI, short of AA for a " +
      "normal-weight label. Violet is scoped to the AI band and 'قريباً' badges. The AI " +
      "band's own background is .ai-shimmer, whose stops (#7c3aed / #6d28d9) are darker " +
      "than the flat token and do pass; the exposed case is a small badge label. Raising " +
      "it means darkening the highlight token, which is an owner decision.",
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
