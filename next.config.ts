import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  swcMinify: true,
  
  // Configuración para variables de entorno
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
  
  // Configuración para imágenes
  images: {
    domains: ['images.unsplash.com', 'assets.mixkit.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
