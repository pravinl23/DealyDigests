/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    turbo: {
      rules: {
        "*.ts": ["typescript"],
        "*.tsx": ["typescript"],
      },
    },
  },
};

module.exports = nextConfig;
