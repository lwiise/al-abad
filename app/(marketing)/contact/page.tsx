import type { Metadata } from "next";
import { getSettings, waLink } from "@/lib/data";
import { ContactForm } from "@/components/sections/contact-form";
import { SocialIcon, SOCIAL_KEYS, SOCIAL_LABELS, WhatsappGlyph } from "@/components/site/icons";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "تواصل",
  description: "تواصل مع أكاديمية الأستاذ علي العباد.",
};

export default async function ContactPage() {
  const settings = await getSettings();
  const social = (settings?.social_links ?? {}) as Record<string, string>;
  const wa = waLink(settings?.whatsapp_number, "السلام عليكم، لدي استفسار");
  const email = settings?.contact_email;

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold text-foreground md:text-5xl">تواصل معنا</h1>
        <p className="mt-4 text-lg text-foreground-muted">
          سؤال عن دورة؟ أو رغبة في التسجيل؟ نحن هنا لمساعدتك.
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="rounded-2xl border border-border bg-background p-6 shadow-sm md:p-8">
          <ContactForm />
        </div>

        <aside className="space-y-6">
          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-border-strong"
            >
              <span className="flex size-11 items-center justify-center rounded-full bg-[#25D366]/10 text-[#25D366]">
                <WhatsappGlyph className="size-6" />
              </span>
              <span>
                <span className="block font-bold text-foreground">واتساب</span>
                <span className="text-sm text-foreground-muted">الأسرع للرد على استفساراتك</span>
              </span>
            </a>
          )}

          {email && (
            <div className="rounded-2xl border border-border bg-surface p-5">
              <p className="font-bold text-foreground">البريد الإلكتروني</p>
              <a
                href={`mailto:${email}`}
                dir="ltr"
                className="mt-1 block text-start text-sm text-secondary hover:underline"
              >
                {email}
              </a>
            </div>
          )}

          {SOCIAL_KEYS.some((k) => social[k]) && (
            <div className="rounded-2xl border border-border bg-surface p-5">
              <p className="mb-3 font-bold text-foreground">تابعنا</p>
              <div className="flex flex-wrap gap-2">
                {SOCIAL_KEYS.map((k) =>
                  social[k] ? (
                    <a
                      key={k}
                      href={social[k]}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={SOCIAL_LABELS[k]}
                      className="flex size-10 items-center justify-center rounded-full bg-background text-foreground-muted transition-colors hover:bg-primary hover:text-on-primary"
                    >
                      <SocialIcon name={k} className="size-4" />
                    </a>
                  ) : null,
                )}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
