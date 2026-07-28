import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * ===========================================================================
 * Palette discipline
 * ===========================================================================
 *
 * The site had two competing palettes live at once and drifted for months
 * before anyone measured it. These rules exist so the next colour that enters
 * the codebase has to come from `app/globals.css` `@theme`, not from whatever
 * was convenient at the time.
 *
 * Each selector matches a string LITERAL or template chunk anywhere in JSX or
 * TS — broader than just `className`, because the real offenders were an SVG
 * `stopColor` and three copies of a raw hex in `style` props.
 *
 * Scoped in `files` below to components/ and app/. `scripts/` is exempt: the
 * contrast audit legitimately handles raw hex.
 */
const TOKEN_HINT =
  "Use a token from app/globals.css @theme (plum/primary, teal/secondary, coral/accent, " +
  "violet/highlight, lilac, ink, the neutral-* ramp, or a semantic role like " +
  "bg-surface / text-foreground-muted / border-border). See the palette table in CLAUDE.md.";

const paletteRules = [
  {
    // bg-[#fff], text-[rgb(...)], border-[hsl(...)], shadow-[0_1px_#000] …
    // Non-colour arbitrary values (text-[1.75rem], size-[70svh]) stay legal.
    selector:
      "Literal[value=/(?:bg|text|border|from|via|to|ring|fill|stroke|divide|outline|shadow|decoration|accent|caret|placeholder)-\\[(?:#|rgb|hsl|oklch|oklab|lab|lch|color:|--)/]",
    message: `Arbitrary colour value. ${TOKEN_HINT}`,
  },
  {
    // Tailwind's default numbered scales. Our tokens are BARE names — `bg-teal`
    // and `text-violet` are ours and must stay legal, while `bg-teal-500` and
    // `text-violet-400` are Tailwind's and must not. Hence the required
    // numeric suffix. `neutral-*` is deliberately absent: that ramp IS ours.
    selector:
      "Literal[value=/\\b(?:bg|text|border|from|via|to|ring|fill|stroke|divide|outline|decoration|accent|caret|placeholder)-(?:gray|slate|zinc|stone|purple|indigo|red|green|blue|amber|yellow|emerald|rose|pink|orange|lime|cyan|sky|fuchsia|teal|violet)-(?:50|[1-9]00|950)\\b/]",
    message: `Tailwind's default palette is not this project's palette. ${TOKEN_HINT}`,
  },
  {
    // Raw hex anywhere — SVG stop colours, style props, config objects.
    selector: "Literal[value=/#[0-9a-fA-F]{6}\\b/]",
    message: `Raw hex colour. Reference the token instead, e.g. var(--color-primary). ${TOKEN_HINT}`,
  },
  {
    // Same three checks again for template literals — `` `bg-[${x}]` `` and
    // friends slip past Literal because they parse as TemplateElement.
    selector:
      "TemplateElement[value.raw=/#[0-9a-fA-F]{6}\\b|(?:bg|text|border|from|via|to|ring|fill|stroke)-\\[(?:#|rgb|hsl|oklch)/]",
    message: `Raw or arbitrary colour in a template literal. ${TOKEN_HINT}`,
  },
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["components/**/*.{ts,tsx}", "app/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": ["error", ...paletteRules],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Local build artifacts (gitignored, but ESLint flat config ignores .gitignore).
    ".netlify/**",
    ".agents/**",
    ".claude/**",
  ]),
]);

export default eslintConfig;
