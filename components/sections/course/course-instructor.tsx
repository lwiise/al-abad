import Image from "next/image";
import Link from "next/link";
import { GraduationCap, Award, BadgeCheck, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonClasses } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { CountUp } from "@/components/motion/count-up";
import { Section } from "../section";
import type { StatRow } from "@/lib/database.types";

const FALLBACK_BIO =
  "يجمع الأستاذ علي العباد في دوراته بين العمق العلمي والخبرة العملية، ليقدّم لك أدواتٍ واضحةً وقابلةً للتطبيق — منهجٌ يأخذ بيدك من فهم الذات إلى بناء علاقةٍ متوازنةٍ وسعيدة.";

const CRED_ICONS = [GraduationCap, Award, BadgeCheck, Users];

function excerpt(md: string | null | undefined, n = 300): string {
  if (!md) return FALLBACK_BIO;
  const text = md.replace(/[#*_>`[\]()-]/g, " ").replace(/\s+/g, " ").trim();
  if (!text) return FALLBACK_BIO;
  return text.length > n ? text.slice(0, n).trim() + "…" : text;
}

/** "+1000" → { prefix:"+", num:1000, suffix:"" }; non-numeric → { num:null }. */
function splitStat(value: string) {
  const m = value.match(/^(\D*)(\d[\d,]*)(.*)$/);
  if (!m) return { prefix: "", num: null as number | null, suffix: value };
  return { prefix: m[1].trim(), num: parseInt(m[2].replace(/,/g, ""), 10), suffix: m[3].trim() };
}

export function CourseInstructor({
  aboutBody,
  imageUrl,
  name,
  markers,
  stats = [],
}: {
  aboutBody?: string | null;
  imageUrl?: string | null;
  name?: string | null;
  markers?: string[];
  stats?: StatRow[];
}) {
  const creds = markers && markers.length ? markers : ["منهج علميّ", "أدوات عملية", "خبرة ميدانية"];
  const topStats = stats.slice(0, 3);

  return (
    <Section bg="lilac">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <Reveal className="relative mx-auto w-full max-w-sm lg:order-2">
          <div className="absolute -bottom-5 -end-5 -z-10 size-28 rounded-3xl bg-secondary/15" aria-hidden="true" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-t-[5rem] rounded-b-3xl border border-border bg-surface shadow-lg">
            <Image
              src={imageUrl || "/coach.png"}
              alt={name || "الأستاذ علي العباد"}
              fill
              sizes="(max-width: 1024px) 80vw, 400px"
              className="object-cover object-top"
            />
          </div>
        </Reveal>

        <Reveal className="lg:order-1">
          <p className="text-sm font-medium text-secondary">مدرّب الدورة</p>
          <h2 className="mt-2 text-3xl font-bold text-foreground md:text-4xl">
            {name || "الأستاذ علي العباد"}
          </h2>
          <p className="mt-5 leading-loose text-foreground-muted">{excerpt(aboutBody)}</p>

          <ul className="mt-6 flex flex-wrap gap-2.5">
            {creds.map((c, i) => {
              const Icon = CRED_ICONS[i % CRED_ICONS.length];
              return (
                <li
                  key={c}
                  className="flex items-center gap-2 rounded-full border border-border bg-background px-3.5 py-1.5 text-sm font-medium text-primary"
                >
                  <Icon className="size-4 text-secondary" aria-hidden="true" />
                  {c}
                </li>
              );
            })}
          </ul>

          {topStats.length > 0 && (
            <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
              {topStats.map((s) => {
                const { prefix, num, suffix } = splitStat(s.value);
                return (
                  <div key={s.id}>
                    <dt className="text-2xl font-extrabold tabular-nums text-foreground md:text-3xl">
                      {num != null ? (
                        <CountUp value={num} prefix={prefix} suffix={suffix ? ` ${suffix}` : ""} />
                      ) : (
                        s.value
                      )}
                    </dt>
                    <dd className="text-xs text-foreground-subtle">{s.label}</dd>
                  </div>
                );
              })}
            </dl>
          )}

          <Link href="/نبذة" className={cn(buttonClasses("outline", "md"), "mt-8 rounded-full")}>
            نبذة عن الأستاذ
          </Link>
        </Reveal>
      </div>
    </Section>
  );
}
