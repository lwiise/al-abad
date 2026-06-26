"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useMagnetic } from "./use-magnetic";

// A Link with the magnetic pointer-follow effect (desktop + motion only).
export function MagneticLink({
  href,
  className,
  target,
  rel,
  children,
}: {
  href: string;
  className?: string;
  target?: string;
  rel?: string;
  children: ReactNode;
}) {
  const ref = useMagnetic<HTMLAnchorElement>();
  return (
    <Link ref={ref} href={href} className={className} target={target} rel={rel}>
      {children}
    </Link>
  );
}
