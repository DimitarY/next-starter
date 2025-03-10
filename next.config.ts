import "@/env";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@t3-oss/env-nextjs", "@t3-oss/env-core"],
  images: {
    remotePatterns: [
      // User uploaded images
      {
        protocol: "https",
        hostname: "*.ufs.sh", // Replace * with your app ID
        pathname: "/f/**",
      },
      // Google OAuth profile images
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**", // Allow all Google profile images
      },
      // GitHub profile images
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        pathname: "/u/**", // GitHub user avatars use `/u/{userID}?...`
      },
    ],
  },
};

export default nextConfig;
