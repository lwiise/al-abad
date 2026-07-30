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
 * (#1c1725) while that direction was being trialled. On ink the eyebrow is
 * lilac (9.50:1) and the body white/74 (7.30:1); plum is 1.26:1 and unusable.
 *
 * THE مرتكزات ARE TEXT, AND THAT IS THE DESIGN. Three claims on hairline-ruled
 * rows: no illustration, no marker, no fill, no state, nothing focusable.
 *
 * They were all of those things until the owner asked for the animations that
 * come with each point to be deleted and the text kept. What went, so that
 * nobody rebuilds one piece of it assuming the rest is still there: a drawn
 * artifact per مرتكز swapped by `data-state` (art/instructor-signature.tsx — an
 * open book whose pages settled, a racked set of implements that rose, ground
 * whose strata were laid down, on a lilac bloom); a spine that filled down the
 * marker column as each row was reached; dot markers that lit and left a dimmer
 * trail behind them; the scroll driver that named the current row
 * (motion/use-scroll-step.ts — a nav-anchored band and a no-skip march); and
 * the hover / tap / focus holds that let a visitor take the sequence over. With
 * them went the whole `.mi-*` block in app/globals.css, the sr-only live region
 * that narrated the art for people who could not see it, and the three `s3`
 * graphics assertions in scripts/check-contrast.mjs. Two earlier passes of
 * abstract stroked geometry, and a scroll-drawn ring behind the portrait with
 * an ~80-line hook scrubbing its dash, had already been rejected before that.
 * The whole line ends here.
 *
 * DO NOT GIVE THE ROWS ANYTHING BACK — not a marker, not a rule that fills, not
 * a hover tint, and above all not an element. They are plain <li>s and they are
 * not in the tab order, because the interaction is what a <button> was for and
 * a <button> that does nothing is a defect rather than a leftover. If a row has
 * to say more, it says it in PILLAR_NOTES above — which is the thing these rows
 * have actually been missing the whole time.
 *
 * The rows do not take the entrance either, by the same instruction: a row
 * sliding up on arrival is an animation that comes with the point. The eyebrow,
 * the h2, the portrait, the body and the CTA still do.
 *
 * So what moves in this section is the entrance and nothing else. No GSAP,
 * nothing pinned, nothing scrubbed, and no scroll listener anywhere in here.
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

  useSectionEnter(root);

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
              Column 1 = the right in RTL, bottom-aligned and pulled slightly
              past the section's bottom padding so it bleeds into the ink edge
              instead of sitting in a padded box.

              SIZED BY ASPECT RATIO, NOT VIEWPORT HEIGHT. This box used to be
              h-[46svh] / h-[70svh] with a -mb of calc(10rem + 8svh), which
              made both the figure's size AND its crop point a function of the
              window's height: on a 1378x602 window that resolved to a 432px
              image floating in a 658px column with 113px of dead space each
              side, cut off at 49% of its height; on a 1440x1080 window the
              same rules cut it at 38%. coach.png is 1779x1736 — effectively
              square — so a square box matches it exactly and leaves no gap,
              and a fixed -mb crops identically at every size. Same pattern as
              hero.tsx and course-hero.tsx, which were already doing this. */}
          <figure
            data-enter=""
            style={{ transitionDelay: "0ms" }}
            className="relative order-3 mt-8 aspect-square w-full data-[enter=hidden]:translate-y-8 data-[enter=hidden]:opacity-0 data-[enter=shown]:transition-[opacity,transform] data-[enter=shown]:duration-[900ms] data-[enter=shown]:ease-[var(--ease-hero)] min-[1080px]:col-start-1 min-[1080px]:row-start-1 min-[1080px]:mt-0 min-[1080px]:-mb-16 min-[1080px]:self-end"
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


            {/* Base fade at EVERY size. The asset's bottom ~10% is a patterned
                tablecloth he is sitting behind, which reads as a foreign grey
                slab against ink. It used to be left to the section's own
                bottom edge to crop above 1080px — but that edge was a
                function of viewport height, so the tablecloth reappeared on
                short windows. The mask removes it deterministically, and the
                figure now dissolves into the ink rather than hard-cutting. */}
            <Image
              src={imageUrl || "/coach.png"}
              alt="الأستاذ علي العباد"
              fill
              sizes="(max-width: 1080px) 90vw, 620px"
              className="object-contain object-bottom [mask-image:linear-gradient(to_top,transparent_0,transparent_4%,black_14%)]"
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

            {/* The مرتكزات are the credibility of the section, so they are rows
                with hairline rules — not pills, which read as metadata. (The
                course page's own instructor block does use pills; the two
                differ on purpose.) Rows stay full-width stacked at every size.

                46ch — the same measure the h2 and the body take. It was capped
                at 25ch from 1080px up while a drawn artifact sat in the end-side
                gutter and the row rules ran straight into it; with the art gone
                the rules line up with the paragraph above them, which is what
                they should have done all along.

                `order-5` and the cap are BOTH load-bearing on this element: the
                copy wrapper is display:contents below 1080px, so this <ul> is a
                direct child of the outer flex column there — it orders itself
                around the portrait (eyebrow 1 · h2 2 · figure 3 · body 4 ·
                list 5 · CTA 6), and a display:contents parent cannot constrain
                its width.

                No `data-enter` here, deliberately — see the header note.

                `py-4` is the whole row metric. The row used to be a <button>
                carrying `min-height: 3.5rem` in globals.css for a pointer
                target; the label's line box measures ~24px, so 16 + 24 + 16
                lands on the same 56px and the rows did not move when the button
                went. */}
            <ul className="order-5 mt-10 max-w-[46ch]">
              {markerList.map((m, i) => (
                <li key={m} className="border-t border-white/10 py-4">
                  <span className="block font-display text-[17px] font-bold text-white/90">
                    {m}
                  </span>
                  {/* Renders only once PILLAR_NOTES is filled in — see the
                      TODO at the top of this file. */}
                  {PILLAR_NOTES[i] ? (
                    <span className="mt-1 block text-[14px] leading-[1.7] text-white/55">
                      {PILLAR_NOTES[i]}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>

            {/* Ghost button. Secondary by construction — it must not compete
                with the coral primary CTAs elsewhere on the page, so the accent
                only appears on hover, in the border. */}
            <div
              data-enter=""
              // 240ms, one beat after the body. It was 480 — the tail of a
              // five-beat stagger whose middle three beats were the مرتكزات,
              // and with those out of the sequence the CTA sat 320ms after the
              // last thing that moved, which reads as the entrance having
              // finished and then started again.
              style={{ transitionDelay: "240ms" }}
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
 * Sequenced entrance for the whole section: one observer on the root flips
 * every [data-enter] descendant to "shown" at once, and each element carries
 * its own transition-delay so the order reads eyebrow → h2 → body → CTA
 * regardless of where each sits on screen. The مرتكزات carry no [data-enter]
 * and are therefore not in this sequence — see the header note.
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
