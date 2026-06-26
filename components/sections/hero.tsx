import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonClasses } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { MediaFallback } from "./media-fallback";

const EYEBROW = "الأكاديمية المتخصصة في بناء العلاقات الزوجية";

export function Hero({
  headline,
  subhead,
  microproof,
  primaryLabel,
  primaryUrl,
  secondaryLabel,
  secondaryUrl,
  imageUrl,
}: {
  headline?: string | null;
  subhead?: string | null;
  microproof?: string | null;
  primaryLabel?: string | null;
  primaryUrl?: string | null;
  secondaryLabel?: string | null;
  secondaryUrl?: string | null;
  imageUrl?: string | null;
}) {
  const proof = (microproof ?? "")
    .split("·")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <section className="relative overflow-hidden bg-background">
      {/* soft warm field, top-start — not a flat lavender block */}
      <div
        className="pointer-events-none absolute -start-32 -top-40 -z-10 size-[36rem] rounded-full opacity-70 aura"
        aria-hidden="true"
      />

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 md:py-24 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Copy */}
        <div className="text-center lg:text-start">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-sm text-secondary">
              <span className="size-1.5 rounded-full bg-secondary" aria-hidden="true" />
              {EYEBROW}
            </span>
          </Reveal>

          <Reveal delay={0.08}>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.15] text-foreground sm:text-5xl lg:text-6xl">
              {headline || "زواجٌ أكثر وعياً… وعلاقةٌ تدوم"}
            </h1>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="mt-6 text-lg leading-loose text-foreground-muted lg:max-w-xl">
              {subhead ||
                "تعلّم — مع الأستاذ علي العباد — كيف تفهم نفسك وشريكك، وتبني علاقةً زوجيةً متوازنةً وسعيدة، عبر دوراتٍ عمليّة تأخذ بيدك خطوة بخطوة."}
            </p>
          </Reveal>

          <Reveal delay={0.24}>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <Link
                href={primaryUrl || "#courses"}
                className={cn(
                  buttonClasses("primary", "md"),
                  "shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg",
                )}
              >
                {primaryLabel || "ابدأ رحلتك"}
              </Link>
              <Link
                href={secondaryUrl || "/نبذة"}
                className={cn(buttonClasses("outline", "md"), "transition-transform hover:-translate-y-0.5")}
              >
                {secondaryLabel || "تعرّف على الأستاذ علي"}
              </Link>
            </div>
          </Reveal>

          {proof.length > 0 && (
            <Reveal delay={0.32}>
              <ul className="mt-10 flex flex-wrap items-center justify-center gap-2.5 lg:justify-start">
                {proof.map((item, i) => (
                  <li
                    key={i}
                    className="inline-flex items-center gap-2 rounded-full bg-surface px-3.5 py-1.5 text-sm text-foreground-muted"
                  >
                    <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          )}
        </div>

        {/* Portrait — arched mask, aura, accent */}
        <Reveal delay={0.18} className="relative mx-auto w-full max-w-md">
          <div className="aura pointer-events-none absolute -inset-10 -z-10" aria-hidden="true" />
          <div className="absolute -bottom-5 -start-5 -z-10 size-28 rounded-3xl bg-accent/10" aria-hidden="true" />
          <div className="absolute -end-4 -top-4 -z-10 size-24 rounded-full bg-highlight/10" aria-hidden="true" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-t-[7rem] rounded-b-3xl border border-border-strong shadow-xl">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt="الأستاذ علي العباد"
                fill
                priority
                sizes="(max-width: 1024px) 85vw, 460px"
                className="object-cover"
              />
            ) : (
              <MediaFallback title="الأستاذ علي العباد" seed={2} />
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
