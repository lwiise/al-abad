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
}: {
  aboutBody?: string | null;
  imageUrl?: string | null;
}) {
  return (
    <Section bg="background">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <Reveal className="relative mx-auto w-full max-w-sm lg:order-2">
          <div className="absolute -bottom-5 -end-5 -z-10 size-28 rounded-3xl bg-secondary/10" aria-hidden="true" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-t-[6rem] rounded-b-3xl border border-border shadow-lg">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt="الأستاذ علي العباد"
                fill
                sizes="(max-width: 1024px) 80vw, 400px"
                className="object-cover"
              />
            ) : (
              <MediaFallback title="الأستاذ علي العباد" seed={4} />
            )}
          </div>
        </Reveal>

        <Reveal className="lg:order-1">
          <p className="text-sm font-medium text-secondary">تعرّف على مدرّبك</p>
          <h2 className="mt-3 text-3xl font-bold text-foreground md:text-4xl">الأستاذ علي العباد</h2>
          <p className="mt-5 text-lg leading-loose text-foreground-muted">{excerpt(aboutBody)}</p>

          <div className="mt-6 flex flex-wrap gap-2">
            {MARKERS.map((m) => (
              <span key={m} className="rounded-full bg-surface-strong px-3 py-1 text-sm text-primary">
                {m}
              </span>
            ))}
          </div>

          <Link href="/نبذة" className={cn(buttonClasses("outline", "md"), "mt-7 rounded-full")}>
            نبذة عن الأستاذ
          </Link>
        </Reveal>
      </div>
    </Section>
  );
}
