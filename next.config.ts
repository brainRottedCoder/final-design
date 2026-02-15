import type { NextConfig } from "next";

const BACKEND_URL = process.env.BACKEND_URL || 'http://103.248.122.182:8000';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/external/:path*',
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
