import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700", "800"],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={tajawal.variable}>
      <body className="min-h-dvh bg-background text-foreground font-sans">
        {children}
      </body>
    </html>
  );
}
