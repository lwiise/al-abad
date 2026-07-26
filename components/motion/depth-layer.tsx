import type { CSSProperties, ElementType, ReactNode } from "react";
import { SCENE_PERSPECTIVE } from "./scene-3d";

/**
 * A layer sitting at a real Z distance inside a `Scene3D`.
 *
 * `z` is in pixels: negative pushes the layer away (background), positive brings
 * it toward the viewer (foreground). The counter-scale cancels the apparent
 * size change perspective would otherwise cause, so the layer occupies exactly
 * the same screen area it would have without the transform — only its
 * behaviour under scene rotation changes. That is the whole trick: identical
 * layout, genuinely different depth.
 *
 * Server component — pure CSS, no JS. Under reduced motion the parent scene
 * simply never rotates, so these sit flat and static.
 */
export function DepthLayer({
  as,
  z = 0,
  perspective = SCENE_PERSPECTIVE,
  className,
  style,
  children,
}: {
  as?: ElementType;
  z?: number;
  perspective?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const Tag = (as ?? "div") as ElementType;
  const counterScale = (perspective - z) / perspective;

  return (
    <Tag
      className={className}
      style={{
        transform: `translateZ(${z}px) scale(${counterScale})`,
        transformStyle: "preserve-3d",
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}
