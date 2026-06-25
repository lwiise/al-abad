"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonClasses } from "@/components/ui/button";
import { NAV, LMS_URL } from "./nav";

export function Header() {
  const pathname = decodeURIComponent(usePathname() || "/");
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-colors",
        scrolled || open
          ? "border-b border-border bg-background/90 backdrop-blur"
          : "border-b border-transparent bg-background/0",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-lg font-extrabold text-on-primary">
            ع
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-base font-extrabold text-foreground">علي العباد</span>
            <span className="text-[0.65rem] tracking-wide text-foreground-subtle">الأكاديمية</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="التنقل الرئيسي">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm transition-colors",
                isActive(item.href)
                  ? "font-medium text-primary"
                  : "text-foreground-muted hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <a
            href={LMS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden text-sm text-foreground-muted transition-colors hover:text-foreground sm:inline"
          >
            تسجيل الدخول
          </a>
          <Link href="/#courses" className={cn(buttonClasses("primary", "sm"), "hidden sm:inline-flex")}>
            ابدأ الآن
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
            aria-expanded={open}
            className="rounded-lg p-2 text-foreground hover:bg-surface lg:hidden"
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown panel */}
      {open && (
        <div className="absolute inset-x-0 top-full border-b border-border bg-background shadow-lg lg:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-6 py-4" aria-label="التنقل للجوال">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-sm transition-colors",
                  isActive(item.href)
                    ? "bg-surface-strong font-medium text-primary"
                    : "text-foreground-muted hover:bg-surface hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
            <a
              href={LMS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg px-3 py-2.5 text-sm text-foreground-muted hover:bg-surface"
            >
              تسجيل الدخول (المنصة)
            </a>
            <Link
              href="/#courses"
              onClick={() => setOpen(false)}
              className={cn(buttonClasses("primary", "md"), "mt-2 w-full")}
            >
              ابدأ الآن
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
