import { WhatsappGlyph } from "./icons";

// Floating WhatsApp button (bottom-start). WhatsApp green is an intentional
// platform affordance, kept outside the brand palette on purpose.
export function WhatsappFloat({ href }: { href: string | null }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصل عبر واتساب"
      className="fixed bottom-5 start-5 z-40 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 focus-visible:scale-105"
    >
      <WhatsappGlyph className="size-7" />
    </a>
  );
}
