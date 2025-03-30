/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'i.scdn.co',                    // Spotify images
      'occ-0-1001-999.1.nflxso.net',  // Netflix images
    ],
  },
  reactStrictMode: true,
};

module.exports = nextConfig; 