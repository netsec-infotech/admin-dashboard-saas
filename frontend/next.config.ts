import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const backendBase = backendUrl.replace(/\/api\/?$/, '');
    return [
      {
        source: '/api/:path*',
        destination: `${backendBase}/api/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${backendBase}/uploads/:path*`,
      },
      {
        source: '/:filename((?!_next|assets|favicon|icon).*\\.(?:jpg|jpeg|png|webp|gif|pdf|svg))',
        destination: `${backendBase}/uploads/:filename`,
      },
    ];
  },
};

export default nextConfig;
