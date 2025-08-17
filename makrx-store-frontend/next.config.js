const path = require("path");

const isProduction = process.env.NODE_ENV === "production";
const experimentalDemosPath = path.join(
  "..",
  "experimental",
  "makrx-store-demos",
  "**"
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Suppress hydration warnings caused by browser extensions
  compiler: {
    removeConsole: isProduction
      ? {
          exclude: ["error"],
        }
      : false,
  },
  // Add development server configuration to fix RSC payload issues
  devIndicators: {
    buildActivity: false,
  },
  // Improve development experience
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Disable fast refresh in production-like environments
  fastRefresh: process.env.NODE_ENV === "development",
  // Reduce development noise
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === "development",
    },
  },
  images: {
    domains: ["localhost", "makrx.store", "images.unsplash.com"],
    unoptimized: true,
  },
  env: {
    CUSTOM_KEY: "makrx-store",
  },
  experimental: {
    externalDir: true,
    ...(isProduction
      ? {
          outputFileTracingExcludes: {
            "*": [experimentalDemosPath],
          },
        }
      : {}),
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@makrx/ui": path.resolve(__dirname, "../packages/ui"),
      "@makrx/types": path.resolve(__dirname, "../packages/types"),
    };
    return config;
  },
};

module.exports = nextConfig;
