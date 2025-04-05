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
  // Add permanent redirects for canonical URLs
  async redirects() {
    return [
      // Redirect HTTP to HTTPS
      {
        source: 'http://localroofernearme.co.uk/:path*',
        destination: 'https://localroofernearme.co.uk/:path*',
        permanent: true,
      },
      // Redirect www to non-www
      {
        source: 'https://www.localroofernearme.co.uk/:path*',
        destination: 'https://localroofernearme.co.uk/:path*',
        permanent: true,
      },
      // Also handle HTTP www to HTTPS non-www
      {
        source: 'http://www.localroofernearme.co.uk/:path*',
        destination: 'https://localroofernearme.co.uk/:path*',
        permanent: true,
      },
    ];
  },
}

module.exports = nextConfig 