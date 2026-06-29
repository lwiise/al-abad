/**
 * Turn a course's free-form `body_markdown` into a small set of visual blocks so
 * the pitch never renders as one uninterrupted wall of text. Heuristic, tuned on
 * the real merged-from-old-site bodies (which mix `#`/`**bold**` headings,
 * "Label: desc" feature paragraphs, ordered/bulleted lists, an opening rhetorical
 * question, and repeated CTA filler lines). Anything unrecognized falls through
 * to a plain paragraph (rendered as constrained prose), never a full-bleed wall.
 */

export type PitchItem = { label: string | null; text: string };

export type PitchNode =
  | { type: "quote"; text: string }
  | { type: "callout"; text: string }
  | { type: "heading"; text: string }
  | { type: "para"; text: string }
  | { type: "cards"; ordered: boolean; items: PitchItem[] };

const CTA_FILLER = [
  "امتلك الدورة",
  "انضم إلى",
  "انضم الآن",
  "ابدأ التغيير",
  "ابدأ الآن",
  "تغلب على",
  "احصل على الدورة",
  "سجل الآن",
  "سجّل الآن",
  "ابدأ رحلتك",
  "ابدأ في تحقيق",
  "لا تدع",
];

const stripInline = (s: string) =>
  s.replace(/\*+/g, "").replace(/\s+/g, " ").replace(/^[-•]\s*/, "").trim();

type Tok =
  | { type: "quote"; text: string }
  | { type: "callout"; text: string }
  | { type: "heading"; text: string; introList: boolean }
  | { type: "para"; text: string }
  | { type: "item"; label: string | null; text: string }
  | { type: "cards"; ordered: boolean; items: PitchItem[] };

export function parsePitch(md: string | null | undefined): PitchNode[] {
  if (!md) return [];
  let text = md.replace(/\r\n/g, "\n").replace(/\\([-*._])/g, "$1");
  text = text.replace(/[ \t]+$/gm, ""); // strip trailing spaces (markdown soft breaks)
  const rawBlocks = text
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  const isFiller = (s: string) => CTA_FILLER.some((f) => s.includes(f));
  const single = (b: string) => !b.includes("\n");
  const linesOf = (b: string) => b.split("\n").map((l) => l.trim()).filter(Boolean);
  const stripBullet = (l: string) =>
    l.replace(/^[-*•]\s+/, "").replace(/^\d+[.)]\s+/, "").replace(/\*+/g, "").trim();

  const isHeadingHash = (b: string) => /^#{1,6}\s+/.test(b);
  const isAllBold = (b: string) => {
    const t = b.replace(/\n/g, " ").trim();
    return /^\*\*[\s\S]+\*\*[:：]?$/.test(t) && (t.match(/\*\*/g) || []).length === 2;
  };
  const isUnordered = (b: string) => {
    const ls = linesOf(b);
    return ls.length >= 2 && ls.every((l) => /^[-*•]\s+/.test(l));
  };
  const isOrdered = (b: string) => {
    const ls = linesOf(b);
    return ls.length >= 2 && ls.every((l) => /^\d+[.)]\s+/.test(l));
  };
  const isPlainHeading = (b: string) => single(b) && stripInline(b).length <= 55 && /[:：]\s*$/.test(b);
  const isSectionQuestion = (b: string) =>
    single(b) && stripInline(b).length <= 60 && /؟\s*$/.test(b) && !/^هل/.test(stripInline(b));
  const isHookQuestion = (b: string) => /؟\s*$/.test(stripInline(b)) && stripInline(b).length <= 220;
  const bulletPrefix = (b: string) => single(b) && /^[-*•]\s+/.test(b);
  const deBullet = (b: string) => b.replace(/^[-*•]\s+/, "").trim();
  const introducesList = (t: string) => /؟\s*$/.test(t) || /[:：]\s*$/.test(t);

  const featureSplit = (b: string): { label: string; text: string } | null => {
    if (b.includes("\n")) return null;
    const m = b.match(/^([^:：]{2,45})[:：]\s+(.+)$/);
    if (!m) return null;
    const itemText = stripInline(m[2]);
    if (!itemText || itemText.length < 8) return null;
    return { label: stripInline(m[1]), text: itemText };
  };

  // ── pass 1: blocks → tokens ────────────────────────────────────────────────
  const toks: Tok[] = [];
  rawBlocks.forEach((b, idx) => {
    if (idx === 0 && isHookQuestion(b)) {
      toks.push({ type: "quote", text: stripInline(b) });
    } else if (isFiller(b)) {
      // drop CTA exhortation line
    } else if (isHeadingHash(b)) {
      const t = b.replace(/^#{1,6}\s+/, "").trim();
      toks.push({ type: "heading", text: t, introList: introducesList(t) });
    } else if (isAllBold(b)) {
      const inner = stripInline(b).replace(/[:：]\s*$/, "");
      if (inner.length <= 45) toks.push({ type: "heading", text: inner, introList: introducesList(stripInline(b)) });
      else toks.push({ type: "callout", text: inner });
    } else if (isOrdered(b)) {
      toks.push({ type: "cards", ordered: true, items: linesOf(b).map((l) => ({ label: null, text: stripBullet(l) })) });
    } else if (isUnordered(b)) {
      toks.push({ type: "cards", ordered: false, items: linesOf(b).map((l) => ({ label: null, text: stripBullet(l) })) });
    } else if (isPlainHeading(b) || isSectionQuestion(b)) {
      toks.push({ type: "heading", text: stripInline(b).replace(/[:：]\s*$/, ""), introList: true });
    } else if (single(b) && /^هل/.test(stripInline(b)) && /؟\s*$/.test(stripInline(b)) && stripInline(b).length <= 90) {
      // mid-body "هل …؟" rhetorical engagement line — drop
    } else if (bulletPrefix(b)) {
      const feat = featureSplit(deBullet(b));
      toks.push(feat ? { type: "item", ...feat } : { type: "item", label: null, text: stripInline(deBullet(b)) });
    } else {
      const feat = featureSplit(b);
      if (feat) toks.push({ type: "item", ...feat });
      else toks.push({ type: "para", text: stripInline(b) });
    }
  });

  // ── pass 2: fold consecutive "item" tokens into one cards node ──────────────
  const folded: Tok[] = [];
  let run: PitchItem[] = [];
  const flush = () => {
    if (run.length === 0) return;
    if (run.length === 1) {
      const it = run[0];
      folded.push({ type: "para", text: it.label ? `${it.label}: ${it.text}` : it.text });
    } else {
      folded.push({ type: "cards", ordered: false, items: run });
    }
    run = [];
  };
  for (const t of toks) {
    if (t.type === "item") run.push({ label: t.label, text: t.text });
    else {
      flush();
      folded.push(t);
    }
  }
  flush();

  // ── pass 3: a list-introducing heading + ≥3 short paras → text cards ────────
  const out: PitchNode[] = [];
  for (let i = 0; i < folded.length; i++) {
    const t = folded[i];
    if (t.type === "heading") {
      out.push({ type: "heading", text: t.text });
      if (t.introList) {
        let j = i + 1;
        const para: PitchItem[] = [];
        while (j < folded.length && folded[j].type === "para" && (folded[j] as { text: string }).text.length <= 280) {
          para.push({ label: null, text: (folded[j] as { text: string }).text });
          j++;
        }
        if (para.length >= 3) {
          out.push({ type: "cards", ordered: false, items: para });
          i = j - 1;
        }
      }
    } else {
      out.push(t as PitchNode);
    }
  }

  return out;
}
