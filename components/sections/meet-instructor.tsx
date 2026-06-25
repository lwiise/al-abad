import Image from "next/image";
import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { Section } from "./section";

const FALLBACK =
  "يجمع الأستاذ علي العباد في دوراته بين العمق العلمي والخبرة العملية، ليقدّم لك أدواتٍ واضحةً وقابلةً للتطبيق في حياتك الزوجية — منهجٌ يأخذ بيدك من فهم الذات إلى بناء علاقةٍ متوازنةٍ وسعيدة.";

function excerpt(md: string | null | undefined, n = 340): string {
  if (!md) return FALLBACK;
  const text = md
    .replace(/[#*_>`[\]()-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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
        {/* Portrait */}
        <div className="relative mx-auto w-full max-w-sm lg:order-2">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-border bg-surface-strong shadow-lg">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt="الأستاذ علي العباد"
                fill
                sizes="(max-width: 1024px) 80vw, 400px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="text-7xl font-extrabold text-primary/30">ع</span>
              </div>
            )}
          </div>
        </div>

        {/* Text */}
        <div className="lg:order-1">
          <p className="text-sm font-medium text-secondary">تعرّف على مدرّبك</p>
          <h2 className="mt-3 text-3xl font-bold text-foreground md:text-4xl">الأستاذ علي العباد</h2>
          <p className="mt-5 text-lg leading-loose text-foreground-muted">{excerpt(aboutBody)}</p>

          <div className="mt-6 flex flex-wrap gap-2">
            {MARKERS.map((m) => (
              <span
                key={m}
                className="rounded-full bg-surface-strong px-3 py-1 text-sm text-primary"
              >
                {m}
              </span>
            ))}
          </div>

          <p className="mt-6 text-lg font-medium text-foreground">— أ. علي العباد</p>

          <Link href="/نبذة" className={buttonClasses("outline", "md") + " mt-6"}>
            نبذة عن الأستاذ
          </Link>
        </div>
      </div>
    </Section>
  );
}
