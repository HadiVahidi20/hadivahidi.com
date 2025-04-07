/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['placehold.co'], // For placeholder images
  },
  experimental: {
    mdxRs: true, // Enable the new MDX compiler
  },
};

module.exports = nextConfig;
