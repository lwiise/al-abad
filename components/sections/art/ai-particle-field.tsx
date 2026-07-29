"use client";

import { useEffect, useRef } from "react";

/**
 * Section 7's ground — a lattice of dots pushed around by travelling waves.
 *
 * The brief was a reference clip: a dot field on a near-black plate, dots
 * bunching into bright arcs where a swell passes and thinning out behind it.
 * Everything here is that, in the palette — the reference is monochrome, so
 * "same background" means the same BEHAVIOUR, not its black and white.
 *
 * WHY CANVAS, when every other drawing in this folder is CSS or SVG. Those are
 * diagrams: a dozen shapes, each meaning something, driven by one `data-state`.
 * This is ~5,000 dots each displaced and re-lit every frame. As SVG that is
 * 5,000 nodes the browser has to lay out; as CSS it is not expressible at all,
 * because the arcs come from per-dot DISPLACEMENT and no gradient can bunch a
 * tile. Canvas is the only honest way to draw it, so it gets the one canvas on
 * the site — and pays for it by pausing whenever it is off screen, in a hidden
 * tab, or unwelcome (`prefers-reduced-motion`).
 *
 * WHAT THE FIELD REPLACES. Section 7 used to carry `.dot-grid`, a static CSS
 * dot texture masked so it faded INWARD — opaque in the gutters, transparent
 * across the content column — because a full-bleed dot field is the stock SaaS
 * background and that mask was the only thing stopping it reading as one. That
 * rule is not gone, it MOVED: `GUARD` below is the same idea enforced per dot,
 * as a smooth ellipse around the type instead of a rectangle the width of the
 * column. The difference is that it damps the field rather than deleting it, so
 * the dots visibly carry on behind the headline the way the reference's do, and
 * it degrades sensibly on a phone (where `.dot-grid` switched itself off
 * entirely, having no gutters left to live in).
 *
 * THE GUARD IS A LEGIBILITY REQUIREMENT, NOT A TASTE ONE. A lilac dot at full
 * strength is 1.25:1 against white — text over one is unreadable. Damping the
 * field to `GUARD_MIN` where the type lives puts the worst pixel behind a glyph
 * at lilac/16 over neutral-900, where white is 9.47:1, lilac 7.61:1 and
 * neutral-300 6.12:1 — all clear of AA. Those three pairs are asserted in
 * `pnpm check-contrast`; GUARD_MIN is duplicated there. Change one, change both.
 *
 * The same measurement is why nothing in this section is violet TEXT: violet is
 * 3.68:1 on the bare plate — large-text legal — but only 2.34:1 once a guarded
 * dot is under it. Violet stays what CLAUDE.md's dark-section rule already makes
 * it, a fill: the app tile, the chip, the trough colour of the field itself.
 */

/* --- Lattice ------------------------------------------------------------- */

/** Pitch in CSS px. 22 is the site's dot rhythm — `media-fallback.tsx` and the
 *  retired `.dot-grid` both used it, and there is no reason for a second one. */
const PITCH = 22;

/** Above this the pitch OPENS UP rather than the count growing: a 4K band at a
 *  fixed 22px would be ~20,000 dots, and the field is ambient, not detailed. */
const MAX_DOTS = 5600;

/** Peak displacement, CSS px — about two thirds of a pitch. Enough that the
 *  lattice visibly bends and rows crowd together where a crest passes; much
 *  more and the grid stops reading as a grid, much less and this is a static
 *  dot texture with a brightness animation over it. */
const AMP = 15;

/** px per radian. Deliberately absolute rather than a fraction of the band, so
 *  the swell is the same size on a phone and on a monitor instead of being
 *  stretched to fit — that is what makes it read as one plane rather than as a
 *  pattern scaled to whatever box it landed in.
 *
 *  The value sets the scale of the arcs, and it is the number to reach for if
 *  the field ever looks wrong: too small and the band is one slow gradient
 *  crossing it, too large and the interference degenerates into noise. At 1/125
 *  the three components below come out at roughly 680px, 1270px and 290px. */
const WAVE = 1 / 125;

/** Radians per millisecond. Slow enough to be weather, not animation. */
const SPEED = 0.00034;

/** Dots fade out over this many px at the band's top and bottom edges, so the
 *  lattice is not sliced where the band meets the light sections either side.
 *  The GROUND still cuts hard there — that is section 3's idiom and this band
 *  keeps it; it is only the dots that ease off. */
const RIM = 120;

/* --- The guard -----------------------------------------------------------
   An ellipse that CONTAINS the type, inside which the field is held at exactly
   GUARD_MIN, ramping back to full strength outside it.

   The plateau is the point, and it is what the first cut of this got wrong. A
   guard that merely eases from GUARD_MIN at its centre is only worth GUARD_MIN
   at ONE PIXEL: two thirds of the way out along the headline it had already
   recovered to ~0.5, which is a bright lilac dot under a glyph and nowhere near
   the bound the contrast audit claims. A ceiling asserted in `check-contrast`
   has to be true everywhere a letter can land, so the quiet zone is flat and
   only its OUTER edge is soft. */

/** Field strength across the type. Asserted in scripts/check-contrast.mjs. */
const GUARD_MIN = 0.16;

/** Ellipse centre, a fraction of band height, clamped in px so a tall band
 *  (a phone, where the copy wraps to twice the lines) keeps the quiet zone over
 *  the copy instead of letting it drift down to the middle of the band. */
const GUARD_CY = 0.34;
const GUARD_CY_MAX = 460;

/** Half-width in px. The widest text in the section is the `max-w-3xl`
 *  headline at ±384px, so this clears it with room; capped at the half-band, so
 *  a viewport narrower than the headline is guarded edge to edge. */
const GUARD_RX = 420;

/** Half-height: a fraction of the band, floored so a short band still guards
 *  the whole stack from the chip down to the note under the form. */
const GUARD_RY = 0.3;
const GUARD_RY_MIN = 240;

/** How far past the ellipse the field takes to recover, as a fraction of its
 *  radii. Wide enough that the quiet zone has no visible edge — a hard one
 *  would just redraw in dots the panel this section spent a redesign getting
 *  rid of — and narrow enough that full strength is reached by the gutters
 *  beside the content column. */
const GUARD_RAMP = 0.4;

/* --- Batching ------------------------------------------------------------
   5,000 dots × (beginPath, arc, fill) is ~1M canvas calls a second and drops
   frames on its own. Instead each dot is sorted into one of E × A buckets by
   energy (which fixes its colour and radius) and alpha (which the guard and
   the rim fade drive), and each bucket is drawn as ONE path. That is ~80 fills
   a frame regardless of how many dots there are, and the quantisation is
   invisible: consecutive buckets differ by a tenth of an alpha step. */
const E_BUCKETS = 8;
const A_BUCKETS = 10;

/** Below this a dot is a rounding error on the plate; skip the arc entirely. */
const MIN_ALPHA = 0.015;

const TAU = Math.PI * 2;

/**
 * Read a brand token off the document.
 *
 * The palette lives in `@theme` and nowhere else — hard-coding the two hexes
 * here would both duplicate the source of truth and trip the palette lint. If
 * a token ever stops being a plain 6-digit hex this returns null and the field
 * simply does not draw, which is the right failure: the band is still a
 * finished dark section without it.
 */
function readToken(name: string): [number, number, number] | null {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const hex = raw.replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(hex)) return null;
  const v = parseInt(hex, 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

export function AiParticleField({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    /* Troughs are violet and crests are lilac, so the field lights the section
       in its own hue and resolves to near-white where it is brightest — the
       reference's grey-to-white ramp, read through the palette. */
    const violet = readToken("--color-highlight");
    const lilac = readToken("--color-lilac");
    if (!violet || !lilac) return;

    const fills: string[] = [];
    const radii: number[] = [];
    for (let e = 0; e < E_BUCKETS; e++) {
      const k = (e + 0.5) / E_BUCKETS;
      const r = Math.round(violet[0] + (lilac[0] - violet[0]) * k);
      const g = Math.round(violet[1] + (lilac[1] - violet[1]) * k);
      const b = Math.round(violet[2] + (lilac[2] - violet[2]) * k);
      radii[e] = 0.7 + k * 1.15;
      for (let a = 0; a < A_BUCKETS; a++) {
        fills[e * A_BUCKETS + a] = `rgba(${r}, ${g}, ${b}, ${((a + 0.5) / A_BUCKETS).toFixed(3)})`;
      }
    }

    /* Reused across frames — cleared with `length = 0`, which keeps the backing
       store, so after the first frame the loop allocates nothing. */
    const total = E_BUCKETS * A_BUCKETS;
    const px: number[][] = Array.from({ length: total }, () => []);
    const py: number[][] = Array.from({ length: total }, () => []);

    let w = 0;
    let h = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      // Capped at 2: past that the field costs 4× to draw and looks identical.
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      // Setting .width resets the context, so the transform goes on after it.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);

      const pitch = Math.max(PITCH, Math.sqrt((w * h) / MAX_DOTS));
      const cols = Math.ceil(w / pitch) + 2;
      const rows = Math.ceil(h / pitch) + 2;
      const ox = (w - (cols - 1) * pitch) / 2;
      const oy = (h - (rows - 1) * pitch) / 2;

      const gx = w / 2;
      const gy = Math.min(h * GUARD_CY, GUARD_CY_MAX);
      const grx = Math.min(w / 2, GUARD_RX);
      const gry = Math.max(h * GUARD_RY, GUARD_RY_MIN);

      for (let i = 0; i < total; i++) {
        px[i].length = 0;
        py[i].length = 0;
      }

      for (let r = 0; r < rows; r++) {
        const y = oy + r * pitch;
        const v = y * WAVE;
        for (let c = 0; c < cols; c++) {
          const x = ox + c * pitch;
          const u = x * WAVE;

          /* Three components, amplitudes summing to 1, so the height field is
             exactly [-1, 1] and AMP means what it says. Different directions
             and speeds are what stop it reading as a single rolling stripe —
             where two crests cross, the lattice bunches, and that interference
             IS the arc pattern the reference is made of. */
          const w1 =
            Math.sin(u * 1.15 + v * 0.55 + t * 0.9) * 0.5 +
            Math.sin(u * 0.62 - v * 1.35 - t * 0.62) * 0.3 +
            Math.sin((u + v) * 1.9 + t * 1.25) * 0.2;

          /* A second, slower field displaces sideways. Vertical-only would
             give ripples on a pond; both axes give the shear that makes whole
             regions look like they are turning. */
          const w2 =
            Math.sin(u * 0.9 - v * 0.75 + t * 0.72) * 0.6 + Math.sin(v * 1.6 + t * 0.5) * 0.4;

          const dx = x + w2 * AMP * 0.5;
          const dy = y + w1 * AMP;

          /* Energy: the height field, plus a much broader swell so that whole
             quarters of the band brighten and dim rather than every crest
             being equally lit.

             The 0.78 gain is what makes it look like the reference rather than
             like a grid with a gradient over it. A sum of sines lands near its
             middle most of the time, so mapped straight onto [0,1] almost every
             dot comes out mid-grey — evenly lit, evenly spaced, and the whole
             thing reads as a texture. Over-driving it past the ends CLIPS: the
             troughs go to nothing (`MIN_ALPHA` then drops them entirely, which
             is where the bare patches come from) and the crests saturate into
             solid arcs. Squared afterwards for the same reason — most dots dark,
             only the crests carrying. */
          let e = 0.5 + 0.78 * (w1 * 0.74 + Math.sin(u * 0.4 - v * 0.3 + t * 0.33) * 0.26);
          if (e < 0) e = 0;
          else if (e > 1) e = 1;
          e = e * e;

          /* Guard: flat GUARD_MIN anywhere a glyph can be (d ≤ 1), then
             smoothstepped back to full strength over the next GUARD_RAMP.
             Measured on the DISPLACED position, so a dot pushed into the quiet
             zone is damped rather than arriving lit. */
          const nx = (dx - gx) / grx;
          const ny = (dy - gy) / gry;
          const d = Math.sqrt(nx * nx + ny * ny);
          let k = (d - 1) / GUARD_RAMP;
          if (k <= 0) k = 0;
          else if (k >= 1) k = 1;
          else k = k * k * (3 - 2 * k);
          const guard = GUARD_MIN + (1 - GUARD_MIN) * k;

          let rim = (dy < h / 2 ? dy : h - dy) / RIM;
          if (rim > 1) rim = 1;
          else if (rim < 0) rim = 0;

          const alpha = (0.05 + e * 0.95) * guard * rim;
          if (alpha < MIN_ALPHA) continue;

          let eb = (e * E_BUCKETS) | 0;
          if (eb > E_BUCKETS - 1) eb = E_BUCKETS - 1;
          let ab = (alpha * A_BUCKETS) | 0;
          if (ab > A_BUCKETS - 1) ab = A_BUCKETS - 1;

          const b = eb * A_BUCKETS + ab;
          px[b].push(dx);
          py[b].push(dy);
        }
      }

      for (let i = 0; i < total; i++) {
        const xs = px[i];
        if (!xs.length) continue;
        const ys = py[i];
        const rad = radii[(i / A_BUCKETS) | 0];
        ctx.fillStyle = fills[i];
        ctx.beginPath();
        for (let j = 0; j < xs.length; j++) {
          // moveTo first, or `arc` joins each dot to the previous one.
          ctx.moveTo(xs[j] + rad, ys[j]);
          ctx.arc(xs[j], ys[j], rad, 0, TAU);
        }
        ctx.fill();
      }
    };

    /* --- Scheduling ------------------------------------------------------
       The clock accumulates only while the field is actually running, so
       coming back to a tab resumes the swell where it was left rather than
       jumping forward by however long the tab was hidden. */
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    let clock = 0;
    let last = 0;
    let running = false;
    let onScreen = false;

    const frame = (now: number) => {
      // Capped: a dropped frame should slow the field, never teleport it.
      clock += Math.min(now - last, 64);
      last = now;
      draw(clock * SPEED);
      raf = requestAnimationFrame(frame);
    };

    const stop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(raf);
    };

    const sync = () => {
      const wanted = onScreen && !document.hidden && !motion.matches;
      if (wanted === running) return;
      if (wanted) {
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(frame);
      } else {
        stop();
        // A still frame is the reduced-motion deliverable, not a blank band:
        // one arbitrary but non-degenerate phase of the same field.
        if (motion.matches) draw(3.4);
      }
    };

    const io = new IntersectionObserver((entries) => {
      onScreen = entries[entries.length - 1].isIntersecting;
      sync();
    });
    const ro = new ResizeObserver(() => {
      resize();
      if (!running) draw(motion.matches ? 3.4 : clock * SPEED);
    });

    resize();
    draw(motion.matches ? 3.4 : 0);
    io.observe(canvas);
    ro.observe(canvas);
    document.addEventListener("visibilitychange", sync);
    motion.addEventListener("change", sync);

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", sync);
      motion.removeEventListener("change", sync);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className={className} />;
}
