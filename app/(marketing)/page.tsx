import Link from "next/link";

/**
 * Placeholder marketing home. Intentionally static (boots without Supabase env).
 * Its job for Phase 0 is to prove the brand token system + RTL Arabic type are
 * wired correctly. The real, content-driven sections arrive in Phase 2.
 */
export default function HomePage() {
  return (
    <>
      {/* Accent role — the promo bar lives here in production (coral = urgency). */}
      <div className="bg-accent text-on-accent text-center text-sm py-2 px-4">
        الموقع قيد التطوير — المرحلة الأولى
      </div>

      <section className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-surface-strong px-4 py-1.5 text-sm text-primary">
          منصة الوعي الزواجي والأسري
        </span>

        <h1 className="max-w-3xl text-5xl font-extrabold text-foreground sm:text-6xl">
          الأستاذ علي العباد
        </h1>

        <p className="mt-6 max-w-xl text-lg text-foreground-muted">
          دورات ومحتوى عملي في الوعي الزواجي والأسري، وتدريب الموجّهين الزواجيين
          بطريقة مهنية. تجربة الموقع الجديدة قادمة قريباً.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/admin"
            className="rounded-lg bg-primary px-6 py-3 font-medium text-on-primary transition-colors hover:bg-primary-hover"
          >
            لوحة التحكم
          </Link>
          <a
            href="https://www.al-abbad.com"
            className="rounded-lg border border-border-strong px-6 py-3 font-medium text-foreground transition-colors hover:bg-surface"
          >
            الموقع الحالي
          </a>
        </div>
      </section>

      {/* Surface tint band — establishes section rhythm without a hard divider. */}
      <section className="bg-surface-strong px-6 py-16 text-center">
        <p className="mx-auto max-w-2xl text-xl leading-relaxed text-ink">
          تدريب وإعداد 100 ألف موجّه زواجي محترف، بهدف نشر الوعي الزواجي والأسري
          وتطوير مجتمع واعٍ وسعيد.
        </p>
      </section>

      {/* Dark section — on ink, primary actions use lilac/white (plum is too close). */}
      <footer className="bg-ink px-6 py-10 text-center text-sm text-neutral-300">
        © الأستاذ علي العباد · جميع الحقوق محفوظة
      </footer>
    </>
  );
}
