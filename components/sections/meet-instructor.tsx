import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonClasses } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { MediaFallback } from "./media-fallback";
import { Section } from "./section";

const FALLBACK =
  "يجمع الأستاذ علي العباد في دوراته بين العمق العلمي والخبرة العملية، ليقدّم لك أدواتٍ واضحةً وقابلةً للتطبيق في حياتك الزوجية — منهجٌ يأخذ بيدك من فهم الذات إلى بناء علاقةٍ متوازنةٍ وسعيدة.";

function excerpt(md: string | null | undefined, n = 340): string {
  if (!md) return FALLBACK;
  const text = md.replace(/[#*_>`[\]()-]/g, " ").replace(/\s+/g, " ").trim();
  if (!text) return FALLBACK;
  return text.length > n ? text.slice(0, n).trim() + "…" : text;
}

const MARKERS = ["منهج علميّ", "أدوات عملية", "خبرة ميدانية"];

export function MeetInstructor({
  aboutBody,
  imageUrl,
  eyebrow,
  name,
  markers,
  ctaLabel,
}: {
  aboutBody?: string | null;
  imageUrl?: string | null;
  eyebrow?: string | null;
  name?: string | null;
  markers?: string[];
  ctaLabel?: string | null;
}) {
  const markerList = markers && markers.length ? markers : MARKERS;
  return (
    <Section bg="background">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <Reveal className="relative mx-auto w-full max-w-sm lg:order-2">
          {imageUrl ? (
            <div className="relative aspect-[4/5]">
              {/* soft brand halo behind the cutout so it blends into the page (no frame) */}
              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 top-6 -z-10 rounded-[100%] bg-gradient-to-b from-highlight/25 via-highlight/10 to-transparent blur-3xl"
              />
              <Image
                src={imageUrl}
                alt="الأستاذ علي العباد"
                fill
                sizes="(max-width: 1024px) 80vw, 400px"
                className="object-contain object-bottom"
              />
            </div>
          ) : (
            <div className="relative aspect-[4/5] overflow-hidden rounded-t-[6rem] rounded-b-3xl border border-border shadow-lg">
              <MediaFallback title="الأستاذ علي العباد" seed={4} />
            </div>
          )}
        </Reveal>

        <Reveal className="lg:order-1">
          <p className="text-sm font-medium text-secondary">{eyebrow || "تعرّف على مدرّبك"}</p>
          <h2 className="mt-3 text-3xl font-bold text-foreground md:text-4xl">{name || "الأستاذ علي العباد"}</h2>
          <p className="mt-5 text-lg leading-loose text-foreground-muted">{excerpt(aboutBody)}</p>

          <div className="mt-6 flex flex-wrap gap-2">
            {markerList.map((m) => (
              <span key={m} className="rounded-full bg-surface-strong px-3 py-1 text-sm text-primary">
                {m}
              </span>
            ))}
          </div>

          <Link href="/نبذة" className={cn(buttonClasses("outline", "md"), "mt-7 rounded-full")}>
            {ctaLabel || "نبذة عن الأستاذ"}
          </Link>
        </Reveal>
      </div>
    </Section>
  );
}
