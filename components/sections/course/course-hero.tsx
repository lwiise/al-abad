"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, Layers, SignalHigh, Infinity as InfinityIcon, ShieldCheck, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonClasses } from "@/components/ui/button";
import { gsap, useGSAP, SplitText } from "@/lib/gsap";
import { useMagnetic } from "@/components/motion/use-magnetic";
import type { CourseRow, CourseModuleRow } from "@/lib/database.types";

/** "190 ر.س" for SAR, otherwise "190 <currency>". */
function formatPrice(amount: number, currency: string): string {
  const n = Number(amount).toLocaleString("en-US");
  return currency === "SAR" ? `${n} ر.س` : `${n} ${currency}`;
}

/** Pull the 11-char video id from a YouTube watch/share/embed URL. */
function youTubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

export function CourseHero({
  course,
  modules = [],
}: {
  course: CourseRow;
  modules?: CourseModuleRow[];
}) {
  const root = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const magnetic = useMagnetic<HTMLAnchorElement>();

  const price = course.price;
  const priceOriginal = course.price_original;
  const currency = course.currency ?? "SAR";
  const hasAnchor = price != null && priceOriginal != null && priceOriginal > price;
  const discountPct = hasAnchor
    ? Math.round((1 - (price as number) / (priceOriginal as number)) * 100)
    : 0;

  const lessonsTotal = modules.reduce((sum, m) => sum + (m.lessons ?? 0), 0);
  const facts = [
    modules.length > 0 && { icon: Layers, label: `${modules.length} محاور` },
    lessonsTotal > 0 && { icon: BookOpen, label: `${lessonsTotal} درساً` },
    { icon: SignalHigh, label: "لكل المستويات" },
    { icon: InfinityIcon, label: "وصول مدى الحياة" },
  ].filter(Boolean) as { icon: typeof BookOpen; label: string }[];

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Split by WORDS (never characters — Arabic is cursive). No mask.
        const split = SplitText.create(headlineRef.current, {
          type: "words",
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.words, {
              y: 26,
              opacity: 0,
              duration: 0.8,
              ease: "power3.out",
              stagger: 0.08,
              delay: 0.05,
            }),
        });
        gsap.from("[data-hero-rise]", {
          opacity: 0,
          y: 20,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.1,
          delay: 0.25,
        });
        return () => split.revert();
      });

      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        gsap.to("[data-orb]", {
          y: "+=24",
          x: "+=12",
          duration: 7,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          stagger: { each: 1.5, from: "random" },
        });
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section
      id="course-hero"
      ref={root}
      className="relative isolate overflow-hidden bg-background"
    >
      <div className="hero-aurora pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div data-orb className="absolute -top-12 start-[14%] size-72 rounded-full bg-highlight/20 blur-3xl" />
        <div data-orb className="absolute top-1/3 end-[8%] size-80 rounded-full bg-secondary/15 blur-3xl" />
        <div data-orb className="absolute -bottom-10 start-[10%] size-72 rounded-full bg-primary/15 blur-3xl" />
      </div>
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-b from-transparent to-surface"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        <Link
          href="/الدورات"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-foreground-muted transition-colors hover:text-foreground"
        >
          <span aria-hidden="true">→</span> كل الدورات
        </Link>

        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Text column */}
          <div className="text-start">
            {course.category && (
              <p data-hero-rise className="mb-4 text-sm font-medium text-secondary">
                {course.category}
              </p>
            )}

            <h1
              ref={headlineRef}
              style={{ lineHeight: 1.45 }}
              className="text-4xl font-extrabold text-foreground [text-wrap:balance] md:text-5xl"
            >
              {course.title}
            </h1>

            {course.subtitle && (
              <p
                data-hero-rise
                className="mt-5 max-w-xl text-lg leading-loose text-foreground-muted"
              >
                {course.subtitle}
              </p>
            )}

            {/* key facts */}
            <ul data-hero-rise className="mt-7 flex flex-wrap gap-x-6 gap-y-3">
              {facts.map((f) => (
                <li key={f.label} className="flex items-center gap-2 text-sm text-foreground">
                  <f.icon className="size-4 text-secondary" aria-hidden="true" />
                  {f.label}
                </li>
              ))}
            </ul>

            {/* price */}
            {price != null && (
              <div data-hero-rise className="mt-8 flex items-end gap-3">
                <span className="text-4xl font-extrabold text-foreground">
                  {formatPrice(price, currency)}
                </span>
                {hasAnchor && (
                  <>
                    <span className="pb-1 text-lg text-foreground-subtle line-through">
                      {formatPrice(priceOriginal as number, currency)}
                    </span>
                    <span className="mb-1.5 rounded-full bg-accent/12 px-2.5 py-1 text-xs font-semibold text-accent">
                      وفّر {discountPct}%
                    </span>
                  </>
                )}
              </div>
            )}

            {/* CTAs */}
            <div data-hero-rise className="mt-6 flex flex-wrap items-center gap-3">
              {course.cta_url ? (
                <a
                  ref={magnetic}
                  href={course.cta_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonClasses("danger", "md"),
                    "rounded-full px-7 shadow-lg shadow-accent/25 transition-shadow hover:shadow-xl",
                  )}
                >
                  اشترك الآن
                </a>
              ) : (
                <Link
                  href="/تواصل"
                  className={cn(buttonClasses("danger", "md"), "rounded-full px-7")}
                >
                  للتسجيل تواصل معنا
                </Link>
              )}
              <Link
                href="#curriculum"
                className={cn(buttonClasses("outline", "md"), "rounded-full bg-background/70 backdrop-blur")}
              >
                استعراض المنهج
              </Link>
            </div>

            {/* guarantee */}
            {course.guarantee_text && (
              <p data-hero-rise className="mt-5 flex items-center gap-2 text-sm text-foreground-muted">
                <ShieldCheck className="size-4 text-secondary" aria-hidden="true" />
                {course.guarantee_text}
              </p>
            )}
          </div>

          {/* Media column */}
          <div data-hero-rise className="relative mx-auto w-full max-w-sm lg:mx-0">
            <div
              className="absolute -bottom-5 -end-5 -z-10 size-28 rounded-3xl bg-secondary/10"
              aria-hidden="true"
            />
            <HeroMedia course={course} />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroMedia({ course }: { course: CourseRow }) {
  const [playing, setPlaying] = useState(false);
  const videoId = youTubeId(course.video_preview_url);

  // Coach portrait on a soft brand panel. The asset is a transparent cutout, so
  // object-contain + object-bottom shows the whole figure (no crop) standing on
  // the panel; the lilac→surface gradient fills the space above the head.
  const panel =
    "relative aspect-[4/5] w-full overflow-hidden rounded-t-[4rem] rounded-b-3xl border border-border-strong/40 bg-gradient-to-b from-surface-strong to-surface shadow-xl";

  if (videoId) {
    return (
      <div className={panel}>
        {playing ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
            title={course.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group absolute inset-0 h-full w-full"
            aria-label={`تشغيل المعاينة: ${course.title}`}
          >
            <Image
              src="/coach.png"
              alt="الأستاذ علي العباد"
              fill
              priority
              sizes="(max-width: 1024px) 90vw, 420px"
              className="object-contain object-bottom"
            />
            <span className="absolute inset-0 grid place-items-center bg-ink/15 transition-colors group-hover:bg-ink/25">
              <span className="flex size-16 items-center justify-center rounded-full bg-white/90 text-primary shadow-lg transition-transform group-hover:scale-110">
                <Play className="size-7 translate-x-0.5 fill-current" aria-hidden="true" />
              </span>
            </span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={panel}>
      <Image
        src="/coach.png"
        alt="الأستاذ علي العباد"
        fill
        priority
        sizes="(max-width: 1024px) 90vw, 420px"
        className="object-contain object-bottom"
      />
    </div>
  );
}
