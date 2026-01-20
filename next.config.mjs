/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'docs.google.com'
      }
    ]
  }
};

export default nextConfig;
