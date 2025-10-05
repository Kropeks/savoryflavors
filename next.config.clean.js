const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['www.themealdb.com', 'localhost', 'edamam-product-images.s3.amazonaws.com', 'via.placeholder.com'],
  },
  experimental: {
    serverActions: true,
  },
  outputFileTracingRoot: path.resolve(__dirname),
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    // Guard against Node core modules referenced by dependencies on the client
    if (!isServer) {
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
        process: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
