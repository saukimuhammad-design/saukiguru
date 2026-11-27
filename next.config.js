/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },
  experimental: {
    serverActions: { bodySizeLimit: '2mb' },
  },
  // Enable standalone output for Docker
  output: 'standalone',
  // Optional: Compress responses
  compress: true,
  // Optional: Powered by header
  poweredByHeader: false,
}

module.exports = nextConfig