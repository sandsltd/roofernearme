/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['res.cloudinary.com', 'via.placeholder.com'],
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // Add canonical URL configuration
  async rewrites() {
    return {
      beforeFiles: [
        // These rewrites are checked before any files
        // including _next/public files which are served before the filesystem
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: 'www.localroofernearme.co.uk',
            },
          ],
          destination: 'https://localroofernearme.co.uk/:path*',
        },
      ],
    };
  },
}

module.exports = nextConfig 