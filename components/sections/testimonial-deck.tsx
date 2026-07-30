"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { TestimonialRow } from "@/lib/database.types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

/**
 * الآراء — the card deck.
 *
 * NOT a track, and that is the whole reason this exists instead of another
 * `<Carousel>`. Embla lays its slides out in a row and moves the row; the deck
 * the owner asked for is one card face-on with the next two stacked behind it,
 * fanned a couple of degrees each. There is no arrangement of a horizontal
 * track that produces that — the cards have to occupy the SAME cell and differ
 * only by transform, which is a state problem rather than a scrolling one.
 *
 * EVERY card is rendered, always, into one CSS grid cell — the idiom
 * `.deck-cards` already uses for «كيف تبدأ؟». Two things fall out of it and
 * both are load-bearing:
 *
 *   - The deck is exactly as tall as its tallest card and STAYS that height as
 *     the reader pages through it. Rendering only the visible three would
 *     re-measure the box on every swap, so the proof line and the button below
 *     would jump each time.
 *   - Nothing mounts or unmounts mid-swap, so the transition has something to
 *     transition from.
 *
 * `data-depth` — 0 for the card in front, 1 and 2 for the two fanned behind it,
 * and absent for the rest, which are simply not painted. The geometry and the
 * timing live in `.tm-card` in globals.css, keyed off that attribute, so
 * `prefers-reduced-motion` can switch the movement off in one place.
 */

/** How many cards are drawn behind the front one. Three sheets total, as in the brief. */
const DEPTH = 2;

/** Minimum horizontal travel that counts as a swipe rather than a tap or a scroll. */
const SWIPE = 44;

/**
 * The card clamps rather than truncating at a character count.
 *
 * The deck's height is its tallest card's, so an unclamped 600-character
 * testimonial would size the box for every other one and leave an 80-character
 * quote floating in it. Five lines is roughly what the reference card holds at
 * this width, and — unlike a character budget — it is the same five lines
 * whatever the reader's font size or window width.
 *
 * The expander is offered only when the clamp is ACTUALLY engaged, which is a
 * measurement (`scrollHeight` past `clientHeight`) rather than a guess at a
 * length: an "اقرأ المزيد" under a quote that is already showing in full is
 * worse than no affordance at all, and a character threshold gets that wrong in
 * both directions as soon as the window narrows.
 */
const CLAMP_LINES = 5;

const clampStyle = {
  display: "-webkit-box",
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: CLAMP_LINES,
  overflow: "hidden",
} as const;

export function TestimonialDeck({ items }: { items: TestimonialRow[] }) {
  const n = items.length;
  const [active, setActive] = useState(0);
  // Reset with the card: an expanded quote that stayed expanded would leave the
  // deck at its expanded height under a short next card.
  const [open, setOpen] = useState(false);
  const [clamped, setClamped] = useState(false);
  const quoteRef = useRef<HTMLQuoteElement>(null);
  const start = useRef<{ x: number; y: number } | null>(null);

  const go = useCallback(
    (step: number) => {
      setActive((i) => (i + step + n) % n);
      setOpen(false);
    },
    [n],
  );

  // Does the front card's quote actually overflow its five lines? Measured
  // before paint so the expander never flashes in, and re-measured on resize
  // because the answer is a function of the column width.
  //
  // Skipped while the quote is OPEN, and that early return is the whole trick:
  // with the clamp lifted the element always measures as fitting, so measuring
  // then would take away the button that collapses it again. Holding the last
  // closed-state answer is correct, because the only way to be open is to have
  // measured `true` first.
  useLayoutEffect(() => {
    if (open) return;
    const el = quoteRef.current;
    if (!el) return;
    const measure = () => setClamped(el.scrollHeight - el.clientHeight > 1);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [active, open]);

  if (n === 0) return null;

  return (
    // `aria-roledescription` needs an accessible name to attach to, and the
    // section's own heading is not it — the group is the deck, not the section.
    <div
      role="group"
      aria-roledescription="عرض دوّار"
      aria-label="آراء المتدربين"
      className="relative mx-auto w-full max-w-2xl"
    >
      {/* The deck. `items-stretch` so every sheet fills the cell the tallest one
          defines — otherwise the two behind would be shorter than the front and
          fan out of a smaller rectangle. Touch only: a swipe is how a phone
          reader expects to page a stack, and the two buttons below serve every
          other input. `dir`-aware by arithmetic rather than by class — dx < 0 is
          a drag toward the END edge, which in RTL is forward. */}
      <div
        className="tm-deck grid items-stretch"
        onTouchStart={(e) => {
          // A second finger means a pinch or a two-handed scroll, not a page.
          // Dropping the origin makes the matching touchend a no-op rather than
          // letting whichever finger lifts first decide which card is in front.
          const t = e.touches.length === 1 ? e.touches[0] : null;
          start.current = t ? { x: t.clientX, y: t.clientY } : null;
        }}
        onTouchEnd={(e) => {
          const from = start.current;
          start.current = null;
          if (!from || n < 2) return;
          const touch = e.changedTouches[0];
          if (!touch) return;
          const dx = touch.clientX - from.x;
          const dy = touch.clientY - from.y;
          // Far enough AND more across than down. The distance test alone pages
          // the deck on a diagonal flick down the page, which on a phone is most
          // of them — the deck is over 300px tall, so a thumb scrolling past it
          // is on the card for the whole gesture.
          if (Math.abs(dx) < SWIPE || Math.abs(dx) <= Math.abs(dy)) return;
          go(dx < 0 ? 1 : -1);
        }}
      >
        {items.map((t, i) => {
          // Distance forward from the active card, wrapping — so the deck keeps
          // its three sheets however far round the reader has paged.
          const depth = (i - active + n) % n;
          const front = depth === 0;
          return (
            <figure
              key={t.id}
              // Beyond the third sheet a card is not painted at all, so it must
              // not be reachable either — `inert` takes it out of the tab order
              // and the accessibility tree in one attribute, which `aria-hidden`
              // alone would not do for the expander button inside it.
              data-depth={depth <= DEPTH ? depth : undefined}
              aria-hidden={!front}
              inert={!front}
              className="tm-card col-start-1 row-start-1 flex flex-col p-7 sm:p-9"
            >
              {/* Only the front card's contents are painted. The two behind are
                  bare sheets — which is what they are in the reference, and what
                  keeps a half-legible second quote from competing with the one
                  being read. They still occupy the cell, so they still hold the
                  height. */}
              <div
                className={cn(
                  "tm-card-body flex flex-1 flex-col",
                  front ? "opacity-100" : "opacity-0",
                )}
              >
                <blockquote
                  // Only the front card is measured — it is the only one whose
                  // expander can be reached, and the other two are `inert`.
                  ref={front ? quoteRef : undefined}
                  className="flex-1 text-lg leading-loose text-foreground"
                  style={front && open ? undefined : clampStyle}
                >
                  {t.quote}
                </blockquote>

                {front && clamped && (
                  <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    className="mt-3 self-start text-sm font-medium text-primary hover:text-primary-hover"
                  >
                    {open ? "عرض أقل" : "اقرأ المزيد"}
                  </button>
                )}

                <figcaption className="mt-7 flex items-center gap-3 border-t border-border pt-5">
                  <Avatar className="size-11">
                    {t.avatar_url && <AvatarImage src={t.avatar_url} alt={t.author_name} />}
                    <AvatarFallback>{t.author_name.trim().charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate font-bold text-foreground">{t.author_name}</p>
                    {t.author_title && (
                      <p className="truncate text-xs text-foreground-muted">{t.author_title}</p>
                    )}
                  </div>
                </figcaption>
              </div>
            </figure>
          );
        })}
      </div>

      {n > 1 && (
        <>
          {/* Flanking the deck from `lg` up and sitting beneath it below that.
              The reference puts the arrows outside the card; at 375px there is
              no outside, and a 44px disc laid over the quote is worse than a row
              under it.

              Absolutely positioned against the deck wrapper rather than pushed
              out of a flex row with negative margins — a flex item at a
              `justify-between` edge does not move outward when its margin goes
              negative, so that version left both discs sitting exactly on the
              card's edges and UNDER it: the sheets carry z-index 1–3 as grid
              items, and the row did not. Hence `z-10` here as well.

              `-start-16` / `-end-16` reach 64px into the band's gutter, which
              exists from `lg` up: the deck caps at 42rem inside a 72rem column, so
              the gutter is 24px at 768px — less than the disc needs — and 152px
              at 1024px, which is where they move outside. */}
          <div className="mt-7 flex justify-center gap-3 lg:mt-0 lg:block">
            <Arrow
              onClick={() => go(-1)}
              label="الرأي السابق"
              dir="prev"
              className="lg:absolute lg:top-1/2 lg:z-10 lg:-start-24 lg:-translate-y-1/2"
            />
            <Arrow
              onClick={() => go(1)}
              label="الرأي التالي"
              dir="next"
              className="lg:absolute lg:top-1/2 lg:z-10 lg:-end-24 lg:-translate-y-1/2"
            />
          </div>

          {/* The position, for anyone who cannot see the stack shrink behind the
              front card. Polite, so it is read after the quote itself. */}
          <p aria-live="polite" className="sr-only">
            الرأي {active + 1} من {n}
          </p>
        </>
      )}
    </div>
  );
}

/**
 * A lilac disc with a plum glyph — 7.55:1, and the one place on this band where
 * plum is legible, because it sits on lilac rather than on the plate. The focus
 * ring is lilac too and never touches the button (2px offset, see globals.css),
 * so both of its neighbours are the plum ground.
 *
 * `ChevronRight` for السابق and `ChevronLeft` for التالي — the direction the
 * page reads, and the same pairing `components/ui/carousel.tsx` ships.
 */
function Arrow({
  onClick,
  label,
  dir,
  className,
}: {
  onClick: () => void;
  label: string;
  dir: "prev" | "next";
  className?: string;
}) {
  const Glyph = dir === "prev" ? ChevronRight : ChevronLeft;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "tm-arrow flex size-11 shrink-0 items-center justify-center rounded-full bg-lilac text-primary transition-colors hover:bg-white focus-visible:outline-lilac",
        className,
      )}
    >
      <Glyph className="size-5" />
    </button>
  );
}
