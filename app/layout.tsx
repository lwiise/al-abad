import type { Metadata, Viewport } from "next";
import { Readex_Pro, IBM_Plex_Sans_Arabic, Aref_Ruqaa } from "next/font/google";
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

// Calligraphic face — ONE line in the hero ("علاقة تدوم") and nowhere else.
// Ruqʿah is a display script: it is illegible as UI text and its descenders and
// sweeping baselines need far more room than a sans, so it carries a much looser
// line-height wherever it is used. Deliberately NOT preloaded — only the primary
// display face is, per the performance spec.
const ruqaa = Aref_Ruqaa({
  variable: "--font-ruqaa",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  display: "swap",
  preload: false,
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
      // overflow-x-clip, not -hidden: decorative auras bleed past their
      // containers by design (-inset-8, scale-125), which made / and /about
      // scroll sideways at 375px. `clip` stops that without establishing a
      // scroll container — `hidden` would, and that breaks the sticky header.
      className={`${readex.variable} ${plex.variable} ${ruqaa.variable} overflow-x-clip`}
    >
      {/* Needed on <body> as well as <html> — clipping only the root still
          leaves the body box reporting the overflowing width. */}
      <body className="min-h-dvh overflow-x-clip bg-background text-foreground font-sans">
        {children}
      </body>
    </html>
  );
}
