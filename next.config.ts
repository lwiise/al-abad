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
    // Supabase Storage public URLs are served from <project-ref>.supabase.co.
    // Wildcard keeps this working across environments without editing config.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
