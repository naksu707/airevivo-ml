/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    qualities: [100, 75],
  },
  async rewrites() {
    const backend = process.env.BACKEND_URL || 'http://localhost:8000'

    return {
      afterFiles: [
        { source: '/api/stats', destination: `${backend}/api/stats` },
        { source: '/api/stations', destination: `${backend}/api/stations` },
        { source: '/api/analytics', destination: `${backend}/api/analytics` },
        { source: '/api/records', destination: `${backend}/api/records` },
        { source: '/api/model', destination: `${backend}/api/model` },
        { source: '/api/health', destination: `${backend}/api/health` },
        { source: '/api/predict', destination: `${backend}/api/predict` },
      ],
    }
  },
}

export default nextConfig
