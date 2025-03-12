/** @type {import('next').NextConfig} */
const nextConfig = {
    // Enables the experimental App Router
    reactStrictMode: true,
    // Allow images from any domain (you may want to restrict this in production)
    images: {
        domains: ['localhost'],
    },
    // Environment variables available on client-side
    env: {
        NEXT_PUBLIC_WEBSOCKET_URL: process.env.NEXT_PUBLIC_WEBSOCKET_URL,
        NEXT_PUBLIC_PREVIEW_WIDTH: process.env.NEXT_PUBLIC_PREVIEW_WIDTH,
        NEXT_PUBLIC_PREVIEW_HEIGHT: process.env.NEXT_PUBLIC_PREVIEW_HEIGHT,
        NEXT_PUBLIC_PREVIEW_URL: process.env.NEXT_PUBLIC_PREVIEW_URL
    },
    // Server-side environment variables
    serverRuntimeConfig: {
        JWT_SECRET: process.env.JWT_SECRET,
        UPLOAD_DIR: process.env.UPLOAD_DIR,
    },
};

module.exports = nextConfig;