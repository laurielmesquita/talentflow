import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Alt-Svc",
            value: "clear",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
