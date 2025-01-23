import "@/env";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      // User uploaded images
      {
        protocol: "https",
        hostname: "utfs.io",
        // pathname: "/a/<APP_ID>/*", // Replace <APP_ID> with your app ID
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
