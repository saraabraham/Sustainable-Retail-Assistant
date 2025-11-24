/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['storage.azure.com'],
  },
  env: {
    AZURE_COGNITIVE_ENDPOINT: process.env.AZURE_COGNITIVE_ENDPOINT,
    AZURE_SEARCH_ENDPOINT: process.env.AZURE_SEARCH_ENDPOINT,
    BACKEND_API_URL: process.env.BACKEND_API_URL,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.BACKEND_API_URL}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
