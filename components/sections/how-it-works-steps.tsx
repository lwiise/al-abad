"use client";

import type { CSSProperties } from "react";
import { useScrollDeck } from "@/components/motion/use-scroll-deck";
import { STEP_ART } from "./art/step-diagrams";
import { DeckRail } from "./deck-rail";

export type Step = { title: string; description?: string | null };

/**
 * «كيف تبدأ؟» — one step at a time, handed over by the scroll.
 *
 * The stage, the hand-over and the fallback all live in useScrollDeck and the
 * `.deck-*` block in globals.css, shared with «ماذا ستكتسب؟». What belongs to
 * this section is the card: wide, the step read on one side and its diagram on
 * the other, with the rail under the deck.
 */
export function HowItWorksSteps({ steps }: { steps: Step[] }) {
  const count = steps.length;
  const { track, mode, current, stateOf, goTo } = useScrollDeck(count);

  return (
    <div
      ref={track}
      className="deck-track relative mt-12"
      data-deck={mode}
      style={{ "--deck-count": count } as CSSProperties}
    >
      <div className="deck-stage">
        <ol className="deck-cards">
          {steps.map((step, i) => {
            const Art = STEP_ART[i % STEP_ART.length];
            const state = stateOf(i);
            return (
              <li
                key={i}
                className="deck-card overflow-hidden rounded-3xl border border-border bg-background shadow-lg"
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
          <DeckRail
            labels={steps.map((s) => s.title)}
            current={current}
            goTo={goTo}
            ordinal="الخطوة"
            token="step"
          />
        )}
      </div>
    </div>
  );
}
