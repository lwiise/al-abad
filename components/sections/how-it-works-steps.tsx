"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { ScrollTrigger } from "@/lib/gsap";
import { STEP_ART } from "./art/step-diagrams";

export type Step = { title: string; description?: string | null };

/** Client-only before paint, so the layout switch below never flashes. */
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * «كيف تبدأ؟» — one step at a time, handed over by the scroll.
 *
 * The section renders as a plain list of steps (`data-hiw="static"`), which is
 * what the server sends and what a reader without JS or with reduced motion
 * keeps: every step visible, every diagram at its finished pose. Only once the
 * client confirms it can honour the motion does it switch to `"scroll"`, where
 * the track grows tall, the stage sticks, and the cards are dealt into one grid
 * cell so exactly one is on screen at a time — the current one rises into place
 * as the one before it lifts away. All of that is CSS; this component owns two
 * numbers: which step is current, and how far through the section we are.
 *
 * Progress drives the rail directly as a custom property (no re-render per
 * frame); only crossing into a new step is React state.
 */
export function HowItWorksSteps({ steps }: { steps: Step[] }) {
  const track = useRef<HTMLDivElement>(null);
  const trigger = useRef<ScrollTrigger | null>(null);
  const [mode, setMode] = useState<"static" | "scroll">("static");
  const [current, setCurrent] = useState(0);
  const count = steps.length;

  useIsoLayoutEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    setMode("scroll");
  }, []);

  useEffect(() => {
    const el = track.current;
    if (mode !== "scroll" || !el) return;

    const apply = (progress: number) => {
      el.style.setProperty("--hiw-p", progress.toFixed(4));
      // Equal bands, one per step: the last one keeps the stage to the end.
      const i = Math.min(count - 1, Math.max(0, Math.floor(progress * count)));
      setCurrent((prev) => (prev === i ? prev : i));
    };

    // start/end are exactly the sticky travel — the stage is one viewport tall
    // and the track is taller by the hold distance of every step.
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => apply(self.progress),
      onRefresh: (self) => apply(self.progress),
    });
    trigger.current = st;
    apply(st.progress);

    return () => {
      st.kill();
      trigger.current = null;
    };
  }, [mode, count]);

  /** Rail click: jump to the middle of that step's band. */
  const goTo = useCallback(
    (i: number) => {
      const st = trigger.current;
      if (!st) return;
      window.scrollTo({
        top: st.start + (st.end - st.start) * ((i + 0.5) / count),
        behavior: "smooth",
      });
    },
    [count],
  );

  return (
    <div
      ref={track}
      className="hiw-track relative mt-12"
      data-hiw={mode}
      style={{ "--hiw-count": count } as CSSProperties}
    >
      <div className="hiw-stage">
        <ol className="hiw-deck">
          {steps.map((step, i) => {
            const Art = STEP_ART[i % STEP_ART.length];
            const state =
              mode === "static" || i === current ? "current" : i < current ? "past" : "next";
            return (
              <li
                key={i}
                className="hiw-card overflow-hidden rounded-3xl border border-border bg-background shadow-lg"
                data-state={state}
              >
                <div className="grid md:min-h-[27rem] md:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] md:items-stretch">
                  <div className="flex flex-col justify-center p-8 md:p-14">
                    <p className="text-sm font-medium text-accent-strong">
                      الخطوة <span className="tabular-nums">{i + 1}</span> من{" "}
                      <span className="tabular-nums">{count}</span>
                    </p>
                    <h3 className="mt-3 text-2xl font-bold text-foreground md:mt-4 md:text-4xl">
                      {step.title}
                    </h3>
                    {step.description && (
                      <p className="mt-4 max-w-[42ch] text-lg leading-relaxed text-foreground-muted md:mt-5 md:text-xl">
                        {step.description}
                      </p>
                    )}
                  </div>
                  {/* The diagram gets a ground of its own — an inset, which is
                      what `surface` is for; the band itself stays lilac. The
                      aura is the hero's, and it is what stops the inset from
                      reading as a blank half: #f8f6fb against white is 1.07:1,
                      a split you can only see because of the rule between. */}
                  <div className="relative flex items-center justify-center overflow-hidden border-t border-border bg-surface p-6 md:border-s md:border-t-0 md:p-10">
                    <span aria-hidden="true" className="aura absolute inset-0" />
                    <Art
                      active={state === "current"}
                      className="relative h-[200px] w-full md:h-[330px]"
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        {mode === "scroll" && (
          <div className="hiw-rail mt-10 flex gap-3 md:gap-5">
            {steps.map((step, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-current={i === current ? "step" : undefined}
                aria-label={`الخطوة ${i + 1}: ${step.title}`}
                className="hiw-rail-item flex-1 text-start"
                style={{ "--hiw-i": i } as CSSProperties}
              >
                <span
                  aria-hidden="true"
                  className="block h-[3px] overflow-hidden rounded-full bg-border-strong"
                >
                  <span className="hiw-rail-fill block h-full w-full rounded-full bg-accent" />
                </span>
                <span
                  aria-hidden="true"
                  className="hiw-rail-label mt-3 block truncate text-sm text-foreground-muted"
                >
                  <span className="tabular-nums">{i + 1}</span>
                  <span className="hidden sm:inline"> · {step.title}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
