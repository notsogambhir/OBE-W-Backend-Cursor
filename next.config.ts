import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true, // Enable React strict mode for better error handling
  serverExternalPackages: ['@radix-ui'],
  // Optimize for faster navigation
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  // Improve caching and performance
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 24 * 60 * 60, // 60 days
  },
  // Turbopack configuration (empty to avoid webpack/turbopack conflict)
  turbopack: {},
  // Suppress WebSocket errors in preview environments
  webpack: (config, { dev, isServer }) => {
      if (!dev || process.env.NODE_ENV === 'production') {
        return config;
      }
    
    // Suppress WebSocket errors in development
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      {
        module: /webpack-hot-middleware/,
        message: /WebSocket connection failed/,
      },
      {
        message: /WebSocket connection failed/,
      },
    ];
    
    return config;
  },
};

export default nextConfig;