import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
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
