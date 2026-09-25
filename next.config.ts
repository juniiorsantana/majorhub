import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Apresentações estáticas de clientes em public/apresentacao/<slug>/index.html
  async rewrites() {
    return [
      {
        source: "/apresentacao/:slug",
        destination: "/apresentacao/:slug/index.html",
      },
    ];
  },
};

export default nextConfig;
