const withPWA = require('next-pwa')

const isProduction = process.env.NODE_ENV === 'production'

module.exports = withPWA({
  dest: 'public',
  register: isProduction,
  skipWaiting: true,
  clientsClaim: true,
  runtimeCaching: [
    {
      url: '/_next/static/(.*)',
      handler: 'CacheFirst',
      options: {
        cacheName: 'next-static',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 86400 * 365,
        },
      },
    },
    {
      url: '/api/(.*)',
      handler: 'NetworkFirst',
      options: {
        cacheName: 'next-api',
        expiration: {
          maxEntries: 256,
          maxAgeSeconds: 86400,
        },
        networkTimeoutSeconds: 15,
      },
    },
  ],
  reactStrictMode: true,
  swcMinify: true,
  poweredByHeader: false,
  compress: true,
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@radix-ui/react', 'lucide-react'],
  },
  images: {
    domains: [],
    formats: ['image/webp', 'image/avif'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: isProduction ? 'https://your-api-domain.com/:path*' : 'http://localhost:3000/:path*',
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https:; frame-ancestors 'none';",
          },
        ],
      },
    ]
  },
})