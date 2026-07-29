"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type RefObject,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonClasses } from "@/components/ui/button";
import {
  INSTRUCTOR_STATES,
  InstructorSignature,
  type SignatureState,
} from "./art/instructor-signature";

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

/** Desktop: how long the art holds a state after the pointer leaves.
 *  Shorter than --mi-move (620ms) on purpose — a quick sweep off a row and
 *  back must never reset the art to idle mid-transition. */
const RETURN_TO_IDLE_MS = 400;

/** Below this the layout stacks and there is no hover to rest against. */
const STACKED = "(max-width: 1079.98px)";

/**
 * What the art is showing, in Arabic, for people who cannot see it. Keyed
 * by state rather than by label so it survives an editor rewording the
 * مرتكزات in the CMS; the label itself is read out alongside it.
 */
const SIGNATURE_DESCRIPTION: Record<SignatureState, string> = {
  idle: "لا رسم — تظهر صورة كلّ مرتكزٍ عند اختياره.",
  method: "كتابٌ مفتوح، تنطبق صفحاته على بعضها واحدةً تلو الأخرى.",
  tools: "طقمُ أدواتٍ قائمٌ في حاملِه، تُسحب كلُّ أداةٍ إلى موضعها تباعاً.",
  field: "أرضٌ مقطوعة، تُرصَف طبقاتُها من الأعمق صعوداً حتى السطح.",
};

/** The layout is external state, so read it as such rather than in an effect. */
function useStackedLayout() {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(STACKED);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(STACKED).matches,
    () => false,
  );
}

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
 * The art each مرتكز drives is in art/instructor-signature.tsx. It is drawn
 * FILLED — an open book, a racked set of implements, ground in section — and
 * nothing in this section strokes or draws a line any more. A scroll-drawn
 * ring used to sit behind the portrait with an ~80-line hook scrubbing its
 * dash; both went when the art did. On ink, lilac carries the forms (9.50:1) and coral
 * accents them (3.08:1); plum is 1.26:1 here and unusable.
 *
 * No GSAP. One IntersectionObserver drives the entrance; everything else is a
 * CSS transition keyed off one `data-state` attribute.
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

  // --- Which مرتكز is driving the art -------------------------------------
  // Same model as قسم التحديات (challenges-board.tsx): one index of state, a
  // short grace period before returning to idle, and a single `data-state`
  // string as the only thing crossing into CSS.
  const [chosen, setChosen] = useState<number | null>(null);
  const stacked = useStackedLayout();
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearIdleTimer = () => {
    if (idleTimer.current) {
      clearTimeout(idleTimer.current);
      idleTimer.current = null;
    }
  };

  useEffect(() => clearIdleTimer, []);

  const hold = useCallback((index: number) => {
    clearIdleTimer();
    setChosen(index);
  }, []);

  const release = useCallback(() => {
    clearIdleTimer();
    idleTimer.current = setTimeout(() => setChosen(null), RETURN_TO_IDLE_MS);
  }, []);

  // Stacked, the art is on screen with nothing to hover, so nothing
  // chosen means the first مرتكز. On desktop the section rests in idle until a
  // pointer or the keyboard reaches a row.
  const active = chosen ?? (stacked ? 0 : null);

  // The CMS supplies the مرتكزات, so the count is not fixed at three — states
  // cycle rather than fall off the end.
  const state: SignatureState =
    active === null ? "idle" : INSTRUCTOR_STATES[active % INSTRUCTOR_STATES.length];

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

            {/* The pillars are the credibility of the section, so they are rows
                with hairline rules — not pills, which read as metadata. Rows
                stay full-width stacked at every size; the 46ch cap is repeated
                here because the copy wrapper is display:contents below 1080px
                and so cannot constrain them.

                Each row is a real <button>, so the keyboard gets the same
                behaviour as the pointer for free and `aria-pressed` can do
                double duty as the a11y state and the CSS hook. */}
            {/* The art lives HERE, not behind the portrait.

                It was in the figure at 56% of the column, and the coach simply
                occupies that space — the form came out half-hidden behind his
                shoulder and read as a rendering artifact rather than a drawn
                object. Beside the list it has genuinely empty ink to sit on,
                and it is next to the rows that drive it, which is where the
                eye already is.

                Stacked it sits above the list; from 1080px it moves into the
                empty end-side gutter the 46ch cap leaves. */}
            <div className="relative order-5 mt-10">
              <div
                aria-hidden="true"
                className="pointer-events-none mx-auto mb-8 w-32 max-w-full aspect-square min-[1080px]:absolute min-[1080px]:end-0 min-[1080px]:top-1/2 min-[1080px]:mx-0 min-[1080px]:mb-0 min-[1080px]:w-40 min-[1080px]:-translate-y-1/2"
              >
                <InstructorSignature state={state} className="size-full" />
              </div>

              {/* Capped narrower than the 46ch the copy uses: the row rules run
                  the width of this list, and at 46ch they ran straight through
                  the art in the gutter beside it. */}
              <ul className="max-w-[46ch] min-[1080px]:max-w-[27ch]">
              {markerList.map((m, i) => {
                const isActive = active === i;
                return (
                  <li
                    key={m}
                    data-enter=""
                    style={{ transitionDelay: `${240 + i * 80}ms` }}
                    className="border-t border-white/10 data-[enter=hidden]:translate-y-6 data-[enter=hidden]:opacity-0 data-[enter=shown]:transition-[opacity,transform] data-[enter=shown]:duration-[500ms] data-[enter=shown]:ease-[var(--ease-hero)]"
                  >
                    <button
                      type="button"
                      aria-pressed={isActive}
                      className="mi-row flex w-full items-center gap-4 py-4 text-start"
                      // Pointer enter/leave are gated to a mouse: touch
                      // synthesises both and would fight the tap.
                      onPointerEnter={(e) => {
                        if (e.pointerType === "mouse") hold(i);
                      }}
                      onPointerLeave={(e) => {
                        if (e.pointerType === "mouse") release();
                      }}
                      onFocus={() => hold(i)}
                      // Unlike section 2, focus does NOT latch here: tabbing
                      // out of the list returns the art to idle rather than
                      // leaving the last-focused مرتكز showing.
                      onBlur={() => release()}
                      onClick={() => hold(i)}
                    >
                      {/* Fills when the row is the one driving the art. */}
                      <span
                        className="mi-marker mt-1 size-4 shrink-0 self-start rounded-full border-2"
                        aria-hidden="true"
                      />
                      <span className="min-w-0">
                        <span className="mi-label block font-display text-[17px] font-bold text-white/90">
                          {m}
                        </span>
                        {/* Renders only once PILLAR_NOTES is filled in — see
                            the TODO at the top of this file. */}
                        {PILLAR_NOTES[i] ? (
                          <span className="mt-1 block text-[14px] leading-[1.7] text-white/55">
                            {PILLAR_NOTES[i]}
                          </span>
                        ) : null}
                      </span>
                    </button>
                  </li>
                );
              })}
              </ul>
            </div>

            {/* Decorative SVG, so the description lives here instead. */}
            <p className="sr-only" aria-live="polite" aria-atomic="true">
              {active === null
                ? SIGNATURE_DESCRIPTION.idle
                : `${markerList[active]}: ${SIGNATURE_DESCRIPTION[state]}`}
            </p>

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
