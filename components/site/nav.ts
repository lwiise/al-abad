// Shared nav model used by the (client) header and (server) footer.
export const NAV = [
  { href: "/", label: "الرئيسية" },
  { href: "/نبذة", label: "نبذة عن الأستاذ" },
  { href: "/الدورات", label: "الدورات" },
  { href: "/المدونة", label: "المدونة" },
  { href: "/تواصل", label: "تواصل" },
] as const;

// Student login goes to the separate LMS (left untouched in this rebuild).
export const LMS_URL = "https://academy.al-abbad.com";
