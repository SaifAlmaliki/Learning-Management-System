/** 
 * @type {import('next').NextConfig}
 * This file defines the Next.js configuration for the application.
 * Specifically, it configures the handling of remote images by allowing images from an external domain (images.pexels.com)
 * to be optimized and displayed using the Next.js Image component.
 */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",  // Specifies the protocol (https)
        hostname: "images.pexels.com", // Allowed hostname for external images
        port: "",           // No specific port (default ports will be used)
        pathname: "/**",    // Allows all paths under the specified hostname
      },
    ],
  },
};

module.exports = nextConfig; // Exports the configuration for Next.js
