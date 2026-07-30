import type { ReactNode } from "react";
import { getSettings, waLink } from "@/lib/data";
import { AnnouncementBar } from "@/components/site/announcement-bar";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { WhatsappFloat } from "@/components/site/whatsapp-float";
import { ScrollRefresh } from "@/components/motion/scroll-refresh";
import { SmoothScroll } from "@/components/motion/smooth-scroll";

export default async function MarketingLayout({ children }: { children: ReactNode }) {
  const settings = await getSettings();

  return (
    <>
      <a
        href="#main"
        className="sr-only z-[60] rounded-lg bg-primary px-4 py-2 text-on-primary focus:not-sr-only focus:fixed focus:start-4 focus:top-4"
      >
        تخطَّ إلى المحتوى
      </a>
      <AnnouncementBar
        enabled={settings?.promo_enabled}
        text={settings?.promo_bar_text}
        code={settings?.promo_code}
      />
      {/* 1px sentinel parked 24px down the document. The nav observes it with
          an IntersectionObserver instead of a scroll listener, and it stops
          intersecting exactly at the 24px trigger point. Absolutely positioned
          so it costs no layout. */}
      <div
        data-nav-sentinel
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-6 h-px"
      />
      <Header />
      {/* The nav is fixed, so it reserves no space — every page needs its own
          clearance. The hero cancels this with a matching negative margin,
          which is how it alone runs underneath the nav with no seam. */}
      <main id="main" tabIndex={-1} className="pt-[var(--nav-h)]">
        {children}
      </main>
      <Footer settings={settings} />
      <WhatsappFloat
        href={waLink(settings?.whatsapp_number, "السلام عليكم، لدي استفسار عن الدورات")}
      />
      <ScrollRefresh />
      {/* Marketing pages only. The admin panel is a tool — it has forms, long
          tables and a sidebar that must answer the scroll wheel exactly and
          immediately, and interpolating that would make it feel slower to use,
          not more expensive. */}
      <SmoothScroll />
    </>
  );
}
