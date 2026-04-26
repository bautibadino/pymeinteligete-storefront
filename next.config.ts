import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  outputFileTracingRoot: process.cwd(),
  async headers() {
    const frameAncestors = [
      "'self'",
      "https://pymeinteligente.com.ar",
      "https://www.pymeinteligente.com.ar",
      "https://*.pymeinteligente.com.ar",
      "https://bymlubricentro.com.ar",
      "https://www.bymlubricentro.com.ar",
      "https://www.bymlubricentro.com",
      "https://bym-lubricentro.com.ar",
      "https://*.vercel.app",
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
      "http://localhost:3003",
      "http://localhost:3004",
      "http://localhost:3005",
    ].join(" ");

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `frame-ancestors ${frameAncestors}`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
