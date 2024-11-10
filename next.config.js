/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  // This tells Next.js to look for pages in src/app instead of app
  useFileSystemPublicRoutes: true,
}

module.exports = nextConfig
