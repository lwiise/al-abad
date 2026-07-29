"use client";

import type { CSSProperties } from "react";

/**
 * Where you are in a scroll deck, and a way to skip.
 *
 * One segment per card. The fill is driven straight off scroll progress
 * (`--deck-p`, written by useScrollDeck every frame) rather than off the
 * current index, so it moves continuously instead of snapping card to card —
 * see `.deck-rail-fill` in globals.css for the arithmetic.
 *
 * `axis="x"` sits under the deck with the title beside each number;
 * `axis="y"` runs down the start edge of the stage from md up, numbers only,
 * and falls back to the horizontal layout on narrow screens where a column
 * beside the card has nowhere to go. Either way the accessible name carries
 * the full title.
 */
export function DeckRail({
  labels,
  current,
  goTo,
  axis = "x",
  ordinal,
  token = "true",
}: {
  labels: string[];
  current: number;
  goTo: (i: number) => void;
  axis?: "x" | "y";
  /** Word before the number in the accessible name — "الخطوة", "المكسب". */
  ordinal: string;
  /** aria-current value. "step" only where the cards really are steps. */
  token?: "step" | "true";
}) {
  return (
    <div className="deck-rail" data-rail={axis}>
      {labels.map((label, i) => (
        <button
          key={i}
          type="button"
          onClick={() => goTo(i)}
          aria-current={i === current ? token : undefined}
          aria-label={`${ordinal} ${i + 1}: ${label}`}
          className="deck-rail-item"
          style={{ "--deck-i": i } as CSSProperties}
        >
          <span aria-hidden="true" className="deck-rail-track">
            <span className="deck-rail-fill" />
          </span>
          <span aria-hidden="true" className="deck-rail-label">
            <span className="tabular-nums">{i + 1}</span>
            <span className="deck-rail-title"> · {label}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
