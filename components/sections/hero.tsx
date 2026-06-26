import Image from "next/image";
import Link from "next/link";
import { BookOpen, Users, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonClasses } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import type { StatRow } from "@/lib/database.types";
import { MediaFallback } from "./media-fallback";

const STAT_ICONS = [BookOpen, Users, Target];

export function Hero({
  headline,
  subhead,
  primaryLabel,
  primaryUrl,
  secondaryLabel,
  secondaryUrl,
  imageUrl,
  stats = [],
}: {
  headline?: string | null;
  subhead?: string | null;
  primaryLabel?: string | null;
  primaryUrl?: string | null;
  secondaryLabel?: string | null;
  secondaryUrl?: string | null;
  imageUrl?: string | null;
  stats?: StatRow[];
}) {
  const topStats = stats.slice(0, 3);

  const trust = (
    <div className="flex items-center gap-3">
      <div className="flex flex-row-reverse">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={cn(
              "size-8 rounded-full bg-gradient-to-br from-plum to-teal ring-2 ring-background",
              i > 0 && "-ms-2",
            )}
            aria-hidden="true"
          />
        ))}
      </div>
      <span className="text-sm text-foreground-muted">موثوق من آلاف المتدربين</span>
    </div>
  );

  const headlineBlock = (
    <div className="max-w-md text-start">
      <h1 className="text-4xl font-extrabold leading-[1.12] text-foreground sm:text-5xl">
        {headline || "زواجٌ أكثر وعياً… وعلاقةٌ تدوم"}
      </h1>
      <p className="mt-4 leading-relaxed text-foreground-muted">
        {subhead ||
          "تعلّم — مع الأستاذ علي العباد — كيف تفهم نفسك وشريكك، وتبني علاقةً متوازنةً وسعيدة."}
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={primaryUrl || "#courses"}
          className={cn(
            buttonClasses("primary", "md"),
            "rounded-full shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg",
          )}
        >
          {primaryLabel || "ابدأ رحلتك"}
        </Link>
        <Link href={secondaryUrl || "/نبذة"} className={cn(buttonClasses("outline", "md"), "rounded-full")}>
          {secondaryLabel || "تعرّف على الأستاذ علي"}
        </Link>
      </div>
    </div>
  );

  const statsList =
    topStats.length > 0 ? (
      <ul className="space-y-7">
        {topStats.map((s, i) => {
          const Icon = STAT_ICONS[i % STAT_ICONS.length];
          return (
            <li key={s.id} className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface text-secondary">
                <Icon className="size-5" />
              </span>
              <span>
                <span className="block text-2xl font-extrabold tabular-nums text-foreground">{s.value}</span>
                <span className="block text-xs text-foreground-subtle">{s.label}</span>
              </span>
            </li>
          );
        })}
      </ul>
    ) : null;

  const portrait = (
    <div className="relative h-full w-full">
      <div className="aura pointer-events-none absolute -inset-6 -z-10" aria-hidden="true" />
      <div className="relative h-full w-full overflow-hidden rounded-t-[6rem] rounded-b-[2rem] border border-border-strong/50 bg-surface-strong shadow-xl">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt="الأستاذ علي العباد"
            fill
            priority
            sizes="(max-width: 1024px) 80vw, 460px"
            className="object-cover"
          />
        ) : (
          <MediaFallback title="الأستاذ علي العباد" seed={2} />
        )}
      </div>
    </div>
  );

  return (
    <section className="relative overflow-hidden bg-background">
      <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        {/* Desktop: coach centered, headline bottom-start, stats end, trust top-start */}
        <div className="hidden min-h-[36rem] gap-6 lg:grid lg:grid-cols-[1fr_1.05fr_0.75fr]">
          <div className="relative z-10 flex flex-col justify-between py-6 lg:-me-10">
            <Reveal>{trust}</Reveal>
            <Reveal delay={0.12}>{headlineBlock}</Reveal>
          </div>
          <Reveal delay={0.06} className="relative min-h-[34rem]">
            {portrait}
          </Reveal>
          <div className="flex items-center justify-end">
            <Reveal delay={0.18}>{statsList}</Reveal>
          </div>
        </div>

        {/* Mobile: stacked */}
        <div className="space-y-8 lg:hidden">
          <Reveal>{trust}</Reveal>
          <Reveal delay={0.06}>
            <div className="relative mx-auto h-[24rem] w-full max-w-xs">{portrait}</div>
          </Reveal>
          <Reveal delay={0.12}>{headlineBlock}</Reveal>
          {statsList && <Reveal delay={0.18}>{statsList}</Reveal>}
        </div>
      </div>
    </section>
  );
}
