import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    'https://intervocalic-jasiah-ornithoid.ngrok-free.dev',
  ],
  env: {
    // Make the auth state available to the client
    NEXT_PUBLIC_AUTH_DISABLED: process.env.DISABLE_AUTH === 'true' ? 'true' : 'false',
  },
  images: {
    domains: ['www.themealdb.com', 'localhost', 'edamam-product-images.s3.amazonaws.com', 'via.placeholder.com', 'www.edamam.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  serverExternalPackages: ['mysql2'],
  outputFileTracingRoot: path.resolve(process.cwd()),
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
