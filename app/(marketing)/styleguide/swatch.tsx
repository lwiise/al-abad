"use client";

import { useCallback, useState } from "react";

/**
 * A token swatch that reports its OWN colour.
 *
 * The hex is read from the live computed style rather than written into this
 * page, so the styleguide can never disagree with `app/globals.css`. Hardcoding
 * the values here would recreate exactly the drift this page exists to catch.
 *
 * `--color-<token>` is read off :root; the block beside it is painted by the
 * real utility class, so a broken token shows up as a missing colour rather
 * than a stale-but-plausible one.
 */
export function Swatch({
  token,
  className,
  role,
  onDark,
}: {
  /** Token name without the `--color-` prefix, e.g. "primary". */
  token: string;
  /** The utility that paints the block, e.g. "bg-primary". */
  className: string;
  role?: string;
  onDark?: boolean;
}) {
  const [value, setValue] = useState<string>("");

  // Callback ref rather than an effect: the value is read exactly once, when
  // the node mounts, and never changes afterwards. Reading it here also means
  // it lands before paint instead of causing a second frame.
  const measure = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) return;
      const raw = getComputedStyle(document.documentElement)
        .getPropertyValue(`--color-${token}`)
        .trim();
      // Fallback for anything not defined as a custom property (e.g. white).
      setValue(raw || getComputedStyle(node).backgroundColor);
    },
    [token],
  );

  return (
    <div className="flex items-center gap-3">
      <div
        ref={measure}
        className={`size-12 shrink-0 rounded-lg border ${
          onDark ? "border-white/20" : "border-border-strong"
        } ${className}`}
      />
      <div className="min-w-0">
        <p
          dir="ltr"
          className={`truncate text-start font-mono text-xs ${
            onDark ? "text-white" : "text-foreground"
          }`}
        >
          {token}
        </p>
        <p
          dir="ltr"
          className={`truncate text-start font-mono text-[0.7rem] ${
            onDark ? "text-white/55" : "text-foreground-subtle"
          }`}
        >
          {value || "…"}
        </p>
        {role && (
          <p
            className={`mt-0.5 text-[0.7rem] leading-snug ${
              onDark ? "text-white/74" : "text-foreground-muted"
            }`}
          >
            {role}
          </p>
        )}
      </div>
    </div>
  );
}
