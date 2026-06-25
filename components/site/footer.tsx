import Link from "next/link";
import type { SiteSettingsRow } from "@/lib/database.types";
import { waLink } from "@/lib/data";
import { NAV, LMS_URL } from "./nav";
import { SocialIcon, SOCIAL_KEYS, WhatsappGlyph } from "./icons";

export function Footer({ settings }: { settings: SiteSettingsRow | null }) {
  const social = (settings?.social_links ?? {}) as Record<string, string>;
  const email = settings?.contact_email;
  const wa = waLink(settings?.whatsapp_number);
  const year = "٢٠٢٦"; // Date APIs are unavailable here; keep stable, owner-evergreen copy below

  return (
    <footer className="bg-ink text-neutral-300">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <p className="text-xl font-extrabold text-white">الأستاذ علي العباد</p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-neutral-400">
              الأكاديمية المتخصصة في بناء العلاقات الزوجية — تعلّم، وافهم، وابنِ علاقةً تدوم.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {SOCIAL_KEYS.map((key) =>
                social[key] ? (
                  <a
                    key={key}
                    href={social[key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={key}
                    className="flex size-9 items-center justify-center rounded-full bg-white/10 text-neutral-200 transition-colors hover:bg-highlight hover:text-on-highlight"
                  >
                    <SocialIcon name={key} className="size-4" />
                  </a>
                ) : null,
              )}
            </div>
          </div>

          {/* Nav */}
          <nav aria-label="روابط" className="text-sm">
            <p className="mb-4 font-bold text-white">روابط</p>
            <ul className="space-y-2.5">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-neutral-400 transition-colors hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href={LMS_URL}
                  className="text-neutral-400 transition-colors hover:text-white"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  تسجيل دخول الطلاب
                </a>
              </li>
            </ul>
          </nav>

          {/* Contact */}
          <div className="text-sm">
            <p className="mb-4 font-bold text-white">تواصل معنا</p>
            <ul className="space-y-3">
              {wa && (
                <li>
                  <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-neutral-300 transition-colors hover:text-white"
                  >
                    <WhatsappGlyph className="size-4 text-[#25D366]" />
                    واتساب
                  </a>
                </li>
              )}
              {email && (
                <li dir="ltr" className="text-start">
                  <a href={`mailto:${email}`} className="text-neutral-400 transition-colors hover:text-white">
                    {email}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-center text-xs text-neutral-500">
          © {year} · الموقع الرسمي للأستاذ علي العباد · جميع الحقوق محفوظة
        </div>
      </div>
    </footer>
  );
}
