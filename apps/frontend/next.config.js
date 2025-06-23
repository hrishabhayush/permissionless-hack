/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      appDir: true,
    },
    transpilePackages: ["@referral-bridge/shared"],
  }
  
  module.exports = nextConfig