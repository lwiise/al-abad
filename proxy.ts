import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// Arabic public URLs → ascii route folders. Next 16 cannot serve percent-encoded
// (non-ASCII) route paths, so we keep folders in English and rewrite here. The
// browser keeps the Arabic URL; Next renders the ascii route.
const REWRITES: Array<[string, string]> = [
  ["/الدورات", "/courses"],
  ["/المدونة", "/blog"],
  ["/نبذة", "/about"],
  ["/تواصل", "/contact"],
];

function safeDecode(p: string): string {
  try {
    return decodeURIComponent(p);
  } catch {
    return p;
  }
}

export async function proxy(request: NextRequest) {
  const decoded = safeDecode(request.nextUrl.pathname);

  for (const [ar, en] of REWRITES) {
    if (decoded === ar || decoded.startsWith(ar + "/")) {
      const url = request.nextUrl.clone();
      url.pathname = en + decoded.slice(ar.length);
      return NextResponse.rewrite(url);
    }
  }

  // Auth gate + session refresh for the admin area only.
  if (decoded.startsWith("/admin")) return updateSession(request);

  return NextResponse.next();
}

export const config = {
  // Run on all page requests; skip Next internals and static files.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
