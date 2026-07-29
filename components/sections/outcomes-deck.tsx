"use client";

import type { CSSProperties } from "react";
import { useScrollDeck } from "@/components/motion/use-scroll-deck";
import { OUTCOME_ART } from "./art/outcome-diagrams";
import { DeckRail } from "./deck-rail";

/**
 * «ماذا ستكتسب؟» — one outcome at a time, handed over by the scroll.
 *
 * Same stage as «كيف تبدأ؟» (useScrollDeck + the `.deck-*` block), a different
 * card: portrait rather than wide, the diagram over the outcome rather than
 * beside it, and the rail running down the start edge instead of under the
 * deck. The two sections are neighbours, so the silhouettes are deliberately
 * unlike each other.
 *
 * An outcome is a glance — a title and a diagram, no paragraph — so the stage
 * hands over sooner than the steps do; see `--deck-hold` below.
 */
export function OutcomesDeck({ points }: { points: string[] }) {
  const count = points.length;
  const { track, mode, current, stateOf, goTo } = useScrollDeck(count);

  return (
    <div
      ref={track}
      className="deck-track relative mt-12"
      data-deck={mode}
      style={{ "--deck-count": count, "--deck-hold": "48svh" } as CSSProperties}
    >
      <div className="deck-stage">
        <ol className="deck-cards">
          {points.map((point, i) => {
            const Art = OUTCOME_ART[i % OUTCOME_ART.length];
            const state = stateOf(i);
            return (
              <li
                key={i}
                className="deck-card mx-auto w-full max-w-[32rem] overflow-hidden rounded-3xl border border-border bg-background shadow-xl"
                data-state={state}
              >
                {/* The diagram gets a ground of its own — an inset, which is
                    what `surface` is for; this band stays white. The aura is
                    the hero's, and it is what stops the inset from reading as
                    a blank panel: #f8f6fb against white is 1.07:1. */}
                <div className="relative flex items-center justify-center overflow-hidden bg-surface p-6 md:p-8">
                  <span aria-hidden="true" className="aura absolute inset-0" />
                  <Art
                    active={state === "current"}
                    className="relative h-[196px] w-full md:h-[264px]"
                  />
                </div>
                <div className="border-t border-border p-7 text-center md:p-9">
                  <p className="text-sm font-medium text-accent-strong">
                    المكسب <span className="tabular-nums">{i + 1}</span> من{" "}
                    <span className="tabular-nums">{count}</span>
                  </p>
                  <h3 className="mt-2 text-2xl font-bold text-foreground md:mt-3 md:text-3xl">
                    {point}
                  </h3>
                </div>
              </li>
            );
          })}
        </ol>

        {mode === "scroll" && (
          <DeckRail labels={points} current={current} goTo={goTo} axis="y" ordinal="المكسب" />
        )}
      </div>
    </div>
  );
}
