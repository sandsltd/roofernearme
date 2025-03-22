import { type NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.rooferschichester.co.uk',
      },
      {
        protocol: 'https',
        hostname: 'www.roofersworkington.co.uk',
      },
      {
        protocol: 'https',
        hostname: 'maps.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'maps.gstatic.com',
      },
      {
        protocol: 'https',
        hostname: '*.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: '*.gstatic.com',
      }
    ],
  },
};

export default nextConfig;
