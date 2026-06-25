import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "تسجيل الدخول" };

export default async function LoginPage(props: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await props.searchParams;

  return (
    <main className="flex min-h-dvh items-center justify-center bg-surface px-6">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-background p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-foreground">لوحة التحكم</h1>
          <p className="mt-1 text-sm text-foreground-muted">الأستاذ علي العباد</p>
        </div>
        <LoginForm next={next} initialError={error} />
      </div>
    </main>
  );
}
