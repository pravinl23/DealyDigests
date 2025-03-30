/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Handle Node.js packages in server components
  serverExternalPackages: ['@auth0/nextjs-auth0']
}

module.exports = nextConfig 