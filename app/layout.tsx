import type { Metadata, Viewport } from "next";
import { Readex_Pro, IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";

// Display face — distinctive, warm, editorial Arabic for headings.
const readex = Readex_Pro({
  variable: "--font-readex",
  subsets: ["arabic", "latin"],
  display: "swap",
});

// Body face — clean, highly readable modern Arabic.
const plex = IBM_Plex_Sans_Arabic({
  variable: "--font-plex",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "الأستاذ علي العباد",
    template: "%s · الأستاذ علي العباد",
  },
  description:
    "دورات ومحتوى في الوعي الزواجي والأسري مع الأستاذ علي العباد — تدريب الموجهين الزواجيين بطريقة عملية ومهنية.",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${readex.variable} ${plex.variable} overflow-x-clip`}
    >
      {/* overflow-x-clip, not -hidden: decorative auras and orbit art bleed
          past their containers by design (-inset-8, scale-125, inset-x-[-50%]),
          which made the page scroll sideways on narrow screens. `clip` stops
          that without establishing a scroll container — `hidden` would, and
          that breaks the sticky header. */}
      <body className="min-h-dvh overflow-x-clip bg-background text-foreground font-sans">
        {children}
      </body>
    </html>
  );
}
