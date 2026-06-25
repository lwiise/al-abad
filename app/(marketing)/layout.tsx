import type { ReactNode } from "react";
import { getSettings, waLink } from "@/lib/data";
import { AnnouncementBar } from "@/components/site/announcement-bar";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { WhatsappFloat } from "@/components/site/whatsapp-float";

export default async function MarketingLayout({ children }: { children: ReactNode }) {
  const settings = await getSettings();

  return (
    <>
      <AnnouncementBar
        enabled={settings?.promo_enabled}
        text={settings?.promo_bar_text}
        code={settings?.promo_code}
      />
      <Header />
      <main>{children}</main>
      <Footer settings={settings} />
      <WhatsappFloat
        href={waLink(settings?.whatsapp_number, "السلام عليكم، لدي استفسار عن الدورات")}
      />
    </>
  );
}
