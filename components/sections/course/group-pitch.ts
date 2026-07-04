import type { PitchNode } from "./parse-pitch";

export type PitchSubsectionData = { heading: string; nodes: PitchNode[] };

export type PitchGroups = {
  /** Opening display headline (`# hook`), when the body has one. */
  hook: string | null;
  /** Prose before the first section heading (may include a leading pull-quote). */
  intro: PitchNode[];
  /** Heading-delimited subsections ("ماذا ستكتسب…", "ما يميز…"). */
  sections: PitchSubsectionData[];
};

/**
 * Group the flat parsePitch() stream into the canonical landing structure:
 * hook + intro split, then heading-delimited subsections. Pure and total —
 * content that doesn't follow the template ends up with `sections: []`, which
 * the renderer treats as "fall back to the flat layout".
 */
export function groupPitch(nodes: PitchNode[]): PitchGroups {
  const groups: PitchGroups = { hook: null, intro: [], sections: [] };
  let i = 0;

  // A leading pull-quote belongs to the intro (it may become the headline).
  while (i < nodes.length && nodes[i].type === "quote") {
    groups.intro.push(nodes[i]);
    i++;
  }

  // A document-opening heading followed by prose is the hook headline; one
  // followed directly by cards is already a section heading ("ماذا ستكتسب…").
  const first = nodes[i];
  if (first?.type === "heading" && nodes[i + 1] && nodes[i + 1].type !== "cards") {
    groups.hook = first.text;
    i++;
  }

  while (i < nodes.length && nodes[i].type !== "heading") {
    groups.intro.push(nodes[i]);
    i++;
  }

  let current: PitchSubsectionData | null = null;
  for (; i < nodes.length; i++) {
    const n = nodes[i];
    if (n.type === "heading") {
      current = { heading: n.text, nodes: [] };
      groups.sections.push(current);
    } else {
      current?.nodes.push(n);
    }
  }

  return groups;
}
