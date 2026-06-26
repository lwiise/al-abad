import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getSettings } from "@/lib/data";
import { Markdown } from "@/components/ui/markdown";
import { Vision } from "@/components/sections/vision";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "نبذة عن الأستاذ",
  description: "تعرّف على الأستاذ علي العباد ومنهجه في بناء العلاقات الزوجية.",
};

const ABOUT_FALLBACK = `الأستاذ علي العباد مختصٌّ في بناء العلاقات الزوجية والأسرية، يقدّم محتوى تدريبياً يجمع بين العمق العلمي والخبرة العملية.

تقوم فلسفته على أن العلاقة الزوجية الناجحة مهارةٌ تُتعلَّم لا صدفة، وأن كثيراً من المشكلات الزوجية يبدأ حلّها بفهم الذات وفهم الشريك.

عبر دوراته يأخذ بيدك خطوة بخطوة — من فهم دوافع السلوك وإدارة المشاعر، إلى التواصل الفعّال وحل الخلافات وبناء علاقةٍ متوازنةٍ تدوم.`;

export default async function AboutPage() {
  const settings = await getSettings();
  const about = settings?.about_body || ABOUT_FALLBACK;

  return (
    <>
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative mx-auto w-full max-w-sm">
            <div className="aura pointer-events-none absolute -inset-8 -z-10" aria-hidden="true" />
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-border bg-surface-strong shadow-xl">
              {settings?.hero_image_url ? (
                <Image
                  src={settings.hero_image_url}
                  alt="الأستاذ علي العباد"
                  fill
                  priority
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

          <div>
            <p className="text-sm font-medium text-secondary">نبذة عن الأستاذ</p>
            <h1 className="mt-3 text-4xl font-extrabold text-foreground md:text-5xl">
              الأستاذ علي العباد
            </h1>
            <div className="mt-6">
              <Markdown>{about}</Markdown>
            </div>
            <Link href="/الدورات" className={cn(buttonClasses("primary", "md"), "mt-8 rounded-full")}>
              تصفّح الدورات
            </Link>
          </div>
        </div>
      </div>

      <Vision
        text={settings?.vision_text}
        ctaLabel={settings?.vision_cta_label}
        ctaUrl={settings?.vision_cta_url}
      />
    </>
  );
}
