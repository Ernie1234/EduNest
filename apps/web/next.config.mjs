/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
  transpilePackages: ["@workspace/ui"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // Most common Google avatar host
        pathname: "**",
      },
      {
        protocol: "http",
        hostname: "googleusercontent.com", // To match your current log
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "googleusercontent.com",
        pathname: "**",
      },
    ],
  },
}

export default nextConfig
