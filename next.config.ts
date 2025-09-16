/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/dashboard',
  assetPrefix: '/dashboard',
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;