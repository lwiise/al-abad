import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonClasses } from "@/components/ui/button";

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
    <section className="relative overflow-hidden bg-surface">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 md:py-24 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Copy */}
        <div className="text-center lg:text-start">
          <p className="reveal text-sm font-medium text-secondary" style={{ animationDelay: "0ms" }}>
            {EYEBROW}
          </p>
          <h1
            className="reveal mt-4 text-4xl font-extrabold leading-tight text-foreground sm:text-5xl lg:text-6xl"
            style={{ animationDelay: "80ms" }}
          >
            {headline || "زواجٌ أكثر وعياً… وعلاقةٌ تدوم"}
          </h1>
          <p
            className="reveal mt-6 text-lg leading-relaxed text-foreground-muted lg:max-w-xl"
            style={{ animationDelay: "160ms" }}
          >
            {subhead ||
              "تعلّم — مع الأستاذ علي العباد — كيف تفهم نفسك وشريكك، وتبني علاقةً زوجيةً متوازنةً وسعيدة، عبر دوراتٍ عمليّة تأخذ بيدك خطوة بخطوة."}
          </p>

          <div
            className="reveal mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
            style={{ animationDelay: "240ms" }}
          >
            <Link href={primaryUrl || "#courses"} className={buttonClasses("primary", "md")}>
              {primaryLabel || "ابدأ رحلتك"}
            </Link>
            <Link href={secondaryUrl || "/نبذة"} className={buttonClasses("outline", "md")}>
              {secondaryLabel || "تعرّف على الأستاذ علي"}
            </Link>
          </div>

          {proof.length > 0 && (
            <ul
              className="reveal mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm text-foreground-subtle lg:justify-start"
              style={{ animationDelay: "320ms" }}
            >
              {proof.map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  {i > 0 && <span className="text-border-strong">·</span>}
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Portrait */}
        <div className="reveal relative mx-auto w-full max-w-sm" style={{ animationDelay: "200ms" }}>
          <div className="aura pointer-events-none absolute -inset-8 -z-10" aria-hidden="true" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-border-strong bg-surface-strong shadow-xl">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt="الأستاذ علي العباد"
                fill
                priority
                sizes="(max-width: 1024px) 80vw, 400px"
                className="object-cover"
              />
            ) : (
              <PortraitPlaceholder />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function PortraitPlaceholder() {
  return (
    <div className={cn("flex h-full w-full items-center justify-center bg-surface-strong")}>
      <span className="text-7xl font-extrabold text-primary/30">ع</span>
    </div>
  );
}
