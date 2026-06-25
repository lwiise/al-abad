// Promo bar — coral (accent = urgency). Renders only while a sale is live.
export function AnnouncementBar({
  enabled,
  text,
  code,
}: {
  enabled?: boolean | null;
  text?: string | null;
  code?: string | null;
}) {
  if (!enabled || !text) return null;

  return (
    <div className="bg-accent text-on-accent">
      <p className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-2 gap-y-1 px-4 py-2 text-center text-sm">
        <span>{text}</span>
        {code && (
          <span className="rounded-md bg-on-accent/15 px-2 py-0.5 font-bold tracking-wide">
            {code}
          </span>
        )}
      </p>
    </div>
  );
}
