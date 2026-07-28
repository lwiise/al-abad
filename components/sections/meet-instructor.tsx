"use client";

import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonClasses } from "@/components/ui/button";

const FALLBACK =
  "يجمع الأستاذ علي العباد في دوراته بين العمق العلمي والخبرة العملية، ليقدّم لك أدواتٍ واضحةً وقابلةً للتطبيق في حياتك الزوجية — منهجٌ يأخذ بيدك من فهم الذات إلى بناء علاقةٍ متوازنةٍ وسعيدة.";

function excerpt(md: string | null | undefined, n = 340): string {
  if (!md) return FALLBACK;
  const text = md.replace(/[#*_>`[\]()-]/g, " ").replace(/\s+/g, " ").trim();
  if (!text) return FALLBACK;
  return text.length > n ? text.slice(0, n).trim() + "…" : text;
}

const MARKERS = ["منهج علميّ", "أدوات عملية", "خبرة ميدانية"];

/**
 * Supporting line under each pillar label, by position.
 *
 * TODO(client): fill these in — one short line per pillar saying what actually
 * backs it. Left deliberately empty, and empty is shipped: a row renders as the
 * label alone until a line arrives.
 *
 * Do NOT write anything here that the client has not confirmed. No degrees, no
 * institutions, no years, no counts, no certifications. This is a real person's
 * professional site; an invented credential here is a false claim about him,
 * not a placeholder.
 */
const PILLAR_NOTES = ["", "", ""];

// Signature geometry. Kept here because useSignatureScrub has to convert the
// circle's length into device pixels, and that conversion needs the viewBox.
const VIEWBOX = 200;
const RADIUS = 99;

// Layout effect on the client (runs before paint → no flash of the animated-in
// state), plain effect on the server so SSR doesn't warn. Mirrors use-reveal.ts.
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Meet-the-instructor — the dark chapter break.
 *
 * Deliberately inverts the hero: portrait on the RIGHT in the wider column,
 * copy on the LEFT, on an ink ground. The dark ground is not decoration —
 * a white thobe and ghutra cut out against a light background has almost no
 * edge separation, and this is the first place the cutout reads properly.
 *
 * Ink (#3a363d) is the site's one dark ground — see the rhythm note in
 * section.tsx. This section used the retired elevation palette's near-black
 * (#1c1725) while that direction was being trialled.
 *
 * That earlier near-black existed to let the signature's plum→coral stroke
 * survive; on ink, plum is 1.26:1 and disappears. Rather than keep a whole
 * extra dark token alive for one arc, the stroke now runs lilac→coral (9.50:1
 * and 3.08:1 on ink) — which is what CLAUDE.md's dark-section rule prescribes
 * anyway: never plum on ink, lilac/white for weight, coral for accent. Same
 * idea, two colours in one continuous stroke, executed in colours that work.
 *
 * No GSAP here. One IntersectionObserver drives the entrance, a second gates a
 * rAF-throttled scroll read that scrubs the signature circle closed.
 */
export function MeetInstructor({
  aboutBody,
  imageUrl,
  eyebrow,
  name,
  markers,
  ctaLabel,
}: {
  aboutBody?: string | null;
  imageUrl?: string | null;
  eyebrow?: string | null;
  name?: string | null;
  markers?: string[];
  ctaLabel?: string | null;
}) {
  const root = useRef<HTMLElement>(null);
  const signature = useRef<SVGCircleElement>(null);

  useSectionEnter(root);
  useSignatureScrub(root, signature);

  const markerList = markers && markers.length ? markers : MARKERS;

  return (
    <section
      ref={root}
      // isolate → the -z layers below stack against this section only.
      // overflow-hidden → clips the bleeding portrait at the ink edge. The
      // transition to the light sections either side is a hard cut on purpose;
      // the outsized padding is what makes the block read as deliberate.
      className="relative isolate overflow-hidden bg-ink pt-24 pb-24 min-[1080px]:pt-40 min-[1080px]:pb-40"
    >
      {/* The hero's own grain layer, same tile / opacity / blend mode. Dark
          grounds band far more visibly than light ones, so this matters more
          here, not less. Sits above the light pool (-z-10 vs -z-20) and below
          the content, so it dithers the gradient without touching the portrait
          or the type. */}
      <div aria-hidden="true" className="hero-grain pointer-events-none absolute inset-0 -z-10" />

      <div className="mx-auto max-w-6xl px-6">
        <div
          className="flex flex-col min-[1080px]:grid min-[1080px]:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)] min-[1080px]:items-center min-[1080px]:gap-x-12"
        >
          {/* ---- Portrait -------------------------------------------------
              Column 1 = the right in RTL. Bottom-aligned and pulled past the
              section's bottom padding so it bleeds into the ink edge instead
              of sitting in a padded box; the extra svh clips the asset's own
              bottom 10% — a patterned tablecloth he is sitting behind, which
              reads as a foreign grey slab against ink. Single column below
              1080px puts it straight after the h2 — keeps the face high on a
              phone — where it sits in flow and cannot bleed, so the tablecloth
              is taken off with a short base fade instead (see the Image). */}
          <figure
            data-enter=""
            style={{ transitionDelay: "0ms" }}
            className="relative order-3 mt-8 h-[46svh] w-full data-[enter=hidden]:translate-y-8 data-[enter=hidden]:opacity-0 data-[enter=shown]:transition-[opacity,transform] data-[enter=shown]:duration-[900ms] data-[enter=shown]:ease-[var(--ease-hero)] min-[1080px]:col-start-1 min-[1080px]:row-start-1 min-[1080px]:-ms-6 min-[1080px]:mt-0 min-[1080px]:-mb-[calc(10rem_+_8svh)] min-[1080px]:h-[70svh] min-[1080px]:self-end"
          >
            {/* ONE light pool, brand purple, wide falloff — something for the
                figure to stand in front of. There is no second one on the copy
                side, by design. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-[-30%] top-[-8%] -z-20 h-[78%]"
              style={{
                background:
                  "radial-gradient(50% 50% at 50% 50%, color-mix(in oklab, var(--color-primary) 62%, transparent) 0%, transparent 72%)",
              }}
            />
            {/* Contact shadow — the hero's blurred ellipse, but tighter
                (inset 22% vs 12%) and darker, because on ink a #3a363d smudge
                at 34% is invisible. Guarded the same way: it only ships with
                the image. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-[22%] bottom-[13%] -z-20 h-[6%] rounded-[100%] blur-xl min-[1080px]:bottom-[20%]"
              style={{ background: "rgb(9 6 14 / 0.72)" }}
            />

            <Signature circleRef={signature} />

            {/* Base fade below 1080px only. Above it the section's own bottom
                edge crops the tablecloth off, which is the bleed the layout
                wants; masking there as well would dissolve the figure before
                it ever reached the edge. */}
            <Image
              src={imageUrl || "/coach.png"}
              alt="الأستاذ علي العباد"
              fill
              sizes="(max-width: 1080px) 90vw, 620px"
              className="object-contain object-bottom [mask-image:linear-gradient(to_top,transparent_0,transparent_4%,black_14%)] min-[1080px]:[mask-image:none]"
            />
          </figure>

          {/* ---- Copy -----------------------------------------------------
              display:contents below 1080px so eyebrow / h2 / body / pillars /
              CTA become siblings of the portrait and can be ordered around it;
              a normal block in column 2 (the left in RTL) above it. */}
          <div className="contents min-[1080px]:col-start-2 min-[1080px]:row-start-1 min-[1080px]:block min-[1080px]:max-w-[46ch]">
            {/* No letter-spacing, despite the small-caps-ish role: Arabic is
                cursive and tracking breaks letter joining — globals.css nulls
                it site-wide. The short rule on the leading (right) edge does
                the separating work instead. */}
            <p
              data-enter=""
              style={{ transitionDelay: "0ms" }}
              className="order-1 flex items-center gap-3 text-[13px] font-medium text-lilac data-[enter=hidden]:translate-y-6 data-[enter=hidden]:opacity-0 data-[enter=shown]:transition-[opacity,transform] data-[enter=shown]:duration-[500ms] data-[enter=shown]:ease-[var(--ease-hero)]"
            >
              <span aria-hidden="true" className="block h-px w-6 shrink-0 bg-accent/70" />
              {eyebrow || "تعرّف على مدرّبك"}
            </p>

            <h2
              data-enter=""
              style={{ transitionDelay: "80ms" }}
              className="order-2 mt-4 max-w-[46ch] text-4xl leading-[1.12] text-white data-[enter=hidden]:translate-y-6 data-[enter=hidden]:opacity-0 data-[enter=shown]:transition-[opacity,transform] data-[enter=shown]:duration-[500ms] data-[enter=shown]:ease-[var(--ease-hero)] min-[1080px]:mt-5 min-[1080px]:text-5xl"
            >
              {name || "الأستاذ علي العباد"}
            </h2>

            {/* Muted white, not pure white — #fff at body sizes on a dark
                ground vibrates. 74% lands at 7.30:1 on ink, past AA by a
                wide margin (pnpm check-contrast asserts it). */}
            <p
              data-enter=""
              style={{ transitionDelay: "160ms" }}
              className="order-4 mt-8 max-w-[46ch] text-[18px] leading-[2] text-white/74 data-[enter=hidden]:translate-y-6 data-[enter=hidden]:opacity-0 data-[enter=shown]:transition-[opacity,transform] data-[enter=shown]:duration-[500ms] data-[enter=shown]:ease-[var(--ease-hero)] min-[1080px]:mt-7 min-[1080px]:text-[19px]"
            >
              {excerpt(aboutBody)}
            </p>

            {/* The pillars are the credibility of the section, so they are rows
                with hairline rules — not pills, which read as metadata. Rows
                stay full-width stacked at every size; the 46ch cap is repeated
                here because the copy wrapper is display:contents below 1080px
                and so cannot constrain them. */}
            <ul className="order-5 mt-10 max-w-[46ch]">
              {markerList.map((m, i) => (
                <li
                  key={m}
                  data-enter=""
                  style={{ transitionDelay: `${240 + i * 80}ms` }}
                  className="border-t border-white/10 py-4 data-[enter=hidden]:translate-y-6 data-[enter=hidden]:opacity-0 data-[enter=shown]:transition-[opacity,transform] data-[enter=shown]:duration-[500ms] data-[enter=shown]:ease-[var(--ease-hero)]"
                >
                  <p className="font-display text-[17px] font-bold text-white/90">{m}</p>
                  {/* Renders only once PILLAR_NOTES is filled in — see the TODO
                      at the top of this file. */}
                  {PILLAR_NOTES[i] ? (
                    <p className="mt-1 text-[14px] leading-[1.7] text-white/55">
                      {PILLAR_NOTES[i]}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>

            {/* Ghost button. Secondary by construction — it must not compete
                with the coral primary CTAs elsewhere on the page, so the accent
                only appears on hover, in the border. */}
            <div
              data-enter=""
              style={{ transitionDelay: "480ms" }}
              className="order-6 mt-10 data-[enter=hidden]:translate-y-6 data-[enter=hidden]:opacity-0 data-[enter=shown]:transition-[opacity,transform] data-[enter=shown]:duration-[500ms] data-[enter=shown]:ease-[var(--ease-hero)]"
            >
              <Link
                href="/نبذة"
                className={cn(
                  buttonClasses("outline", "md", true),
                  "group rounded-full px-7 py-3 duration-300 hover:border-accent hover:bg-transparent",
                )}
              >
                <span className="block transition-transform duration-300 group-hover:-translate-y-0.5">
                  {ctaLabel || "نبذة عن الأستاذ"}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * The signature: ONE circle.
 *
 * The connection art in section 2 holds two circles in tension. Here they have
 * resolved into a single line whose stroke runs lilac → coral: both colours,
 * one continuous stroke. There is deliberately no second circle and no label.
 * Sized larger than the column so it crops at the edges.
 *
 * Lilac rather than plum for the first stop — plum is 1.26:1 on ink. See the
 * note on the section itself.
 *
 * NOTE: this arc originally closed a three-beat progression that began with the
 * hero's two ripple emitters. Those were removed at the owner's request, so the
 * sequence now starts at section 2 — two circles resolving into one — rather
 * than at the hero.
 */
function Signature({ circleRef }: { circleRef: RefObject<SVGCircleElement | null> }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-[-18%] top-[-26%] -z-10 aspect-square"
    >
      <svg viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`} fill="none" className="size-full">
        <defs>
          <linearGradient id="instructor-signature" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" style={{ stopColor: "var(--color-lilac)" }} />
            <stop offset="1" style={{ stopColor: "var(--color-coral)" }} />
          </linearGradient>
        </defs>
        {/* No stroke-dasharray here on purpose: the circle renders CLOSED for
            SSR, no-JS and reduced motion, and only useSignatureScrub adds the
            dash. See the note there on why the dash cannot be authored. */}
        <circle
          ref={circleRef}
          cx={VIEWBOX / 2}
          cy={VIEWBOX / 2}
          r={RADIUS}
          // rotate -90° so the dash origin (3 o'clock) moves to the top; the
          // stroke then grows clockwise from there.
          transform={`rotate(-90 ${VIEWBOX / 2} ${VIEWBOX / 2})`}
          stroke="url(#instructor-signature)"
          strokeWidth="1.25"
          strokeOpacity="0.35"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

/**
 * Sequenced entrance for the whole section: one observer on the root flips
 * every [data-enter] descendant to "shown" at once, and each element carries
 * its own transition-delay so the order reads eyebrow → h2 → body → pillars →
 * CTA regardless of where each sits on screen.
 *
 * Content renders VISIBLE and is only hidden once JS has confirmed it can
 * reveal it again — no JS, no IntersectionObserver, or reduced motion all leave
 * the section fully rendered. Same defensive shape as use-reveal.ts.
 */
function useSectionEnter(ref: RefObject<HTMLElement | null>) {
  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const items = el.querySelectorAll<HTMLElement>("[data-enter]");
    items.forEach((item) => item.setAttribute("data-enter", "hidden"));

    const io = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          items.forEach((item) => item.setAttribute("data-enter", "shown"));
          obs.disconnect(); // once
          return;
        }
      },
      { root: null, rootMargin: "0px 0px -12% 0px", threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
    // Set up once: the section is server-rendered and static per mount.
  }, []);
}

/**
 * Scrubs the signature circle closed against the section's progress through the
 * viewport: 0 when the section's top edge touches the viewport bottom, 1 when
 * the section's midpoint reaches the viewport midpoint. Once closed it latches,
 * the dash is dropped and every listener is torn down — it holds, it does not
 * loop or breathe.
 *
 * The dash length is computed in DEVICE pixels, recomputed on every read. That
 * is not belt-and-braces: `vector-effect: non-scaling-stroke` moves the whole
 * stroke operation — dashing included — into device space, while `pathLength`
 * normalisation resolves against the user-space length. Authoring
 * `pathLength="1" stroke-dasharray="1"` therefore yields a fixed arc (measured
 * here at ~88° of a 2552px circle: 621 user units applied as 621 device px)
 * that slides around the circle as the offset changes instead of growing from
 * the top. So: no pathLength, and both values in the space the UA actually
 * strokes in.
 *
 * The scroll read is rAF-throttled and only attached while the section is
 * actually intersecting.
 */
function useSignatureScrub(
  ref: RefObject<HTMLElement | null>,
  circleRef: RefObject<SVGCircleElement | null>,
) {
  useIsoLayoutEffect(() => {
    const el = ref.current;
    const circle = circleRef.current;
    if (!el || !circle) return;
    if (typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let done = false;

    // user-space circumference × (device px per user unit)
    const circumference = () => {
      const svg = circle.ownerSVGElement;
      const width = svg ? svg.getBoundingClientRect().width : 0;
      return 2 * Math.PI * RADIUS * (width / VIEWBOX);
    };

    const draw = (p: number) => {
      const c = circumference();
      circle.style.strokeDasharray = String(c);
      circle.style.strokeDashoffset = String(c * (1 - p));
    };

    draw(0); // unwritten, before first paint

    const detach = () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };

    const update = () => {
      frame = 0;
      if (done) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const raw = (vh - rect.top) / ((vh + rect.height) / 2);
      const p = raw < 0 ? 0 : raw > 1 ? 1 : raw;
      if (p >= 1) {
        done = true;
        // Drop the dash rather than pinning offset 0 — a later resize would
        // otherwise leave a device-px pattern shorter than the grown circle
        // and re-open a gap.
        circle.style.strokeDasharray = "";
        circle.style.strokeDashoffset = "";
        detach();
        io.disconnect();
        return;
      }
      draw(p);
    };

    function onScroll() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            window.addEventListener("scroll", onScroll, { passive: true });
            window.addEventListener("resize", onScroll);
            update();
          } else {
            detach();
          }
        }
      },
      { root: null, threshold: 0 },
    );
    io.observe(el);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      detach();
      io.disconnect();
    };
  }, []);
}
