import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Admin image uploads stream through Server Actions as multipart form data.
      // The default cap is 1MB, which a single photo blows past → 502. Images are
      // also downscaled client-side (admin ImageField), so this is just headroom.
      bodySizeLimit: "4mb",
    },
  },
  images: {
    // Serve AVIF first (smaller at equal quality), webp fallback. Next picks the
    // first format the browser accepts.
    formats: ["image/avif", "image/webp"],
    // Next 16 enforces an allowlist; default is [75]. 90 is needed for crisp
    // marketing photography — without it, a `quality={90}` prop coerces to 75.
    qualities: [75, 90],
    // Supabase Storage public URLs are served from <project-ref>.supabase.co.
    // Wildcard keeps this working across environments without editing config.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        // YouTube preview thumbnails for course hero video facades.
        protocol: "https",
        hostname: "i.ytimg.com",
        pathname: "/vi/**",
      },
    ],
  },
};

export default nextConfig;
