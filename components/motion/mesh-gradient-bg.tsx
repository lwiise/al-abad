"use client";

import { MeshGradient } from "@paper-design/shaders-react";

// Living brand-tone mesh gradient (WebGL canvas). Rendered behind hero content;
// lazy-loaded + gated to desktop + no-reduced-motion by the caller. Soft, light
// palette so dark foreground text stays legible.
export function MeshGradientBg() {
  return (
    <MeshGradient
      className="absolute inset-0 h-full w-full"
      colors={["#ebe3f7", "#f6f1fb", "#d9c7f5", "#cfe3ee", "#ffffff"]}
      speed={0.25}
    />
  );
}
