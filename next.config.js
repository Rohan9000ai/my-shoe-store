/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  poweredByHeader: false,
  compress: true,

  images: {
    // ✅ Cloudinary + Unsplash allowed
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
    // ✅ Allow local development
    domains: ['localhost'],
    // ✅ Modern image formats
    formats: ["image/avif", "image/webp"],
    // ✅ Cache images for 1 day
    minimumCacheTTL: 60 * 60 * 24,
    // ✅ Responsive image sizes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    // ✅ CRITICAL FIX: Always unoptimized to prevent 17s Cloudinary timeout
    unoptimized: true,
  },

  // ✅ Remove console logs in production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // ✅ Optimize package imports
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns'],
  },

  // ✅ Cache headers for better performance
  async headers() {
    return [
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;