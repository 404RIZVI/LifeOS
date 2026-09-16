import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // don't leak "X-Powered-By: Next.js" in production
};

export default nextConfig;
