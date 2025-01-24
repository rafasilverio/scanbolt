/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com']
  },
  transpilePackages: ['react-pdf-highlighter'],
  webpack: (config) => {
    config.resolve.alias.canvas = false
    config.resolve.alias.encoding = false
    
    return config
  }
}

module.exports = nextConfig
