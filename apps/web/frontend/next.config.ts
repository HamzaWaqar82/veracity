import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/contact",
        destination: "/contact-us",
        permanent: true,
      },
      {
        source: "/early-access",
        destination: "/trial",
        permanent: true,
      },
      {
        source: "/blog/:path*",
        destination: "/resources/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
