// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.freepik.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn-icons-png.flaticon.com',
      },
    ],
  },
  trailingSlash: false,
  async redirects() {
    return [];
  },
  async rewrites() {
    return [];
  }
}

module.exports = nextConfig
