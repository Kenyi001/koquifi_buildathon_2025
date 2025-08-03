/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Configuración para Vercel deployment
  trailingSlash: false,
  
  // Supresión de hydration warnings (para extensiones del navegador)
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  
  // Configuración del compilador
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Configuración experimental para mejorar hydration
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['react-icons', '@heroicons/react'],
  },
  
  // Optimización de imágenes
  images: {
    unoptimized: true,
    domains: ['localhost', 'ui-avatars.com'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Configuración de variables de entorno
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Configuración para integración con backend
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
    ];
  },
  
  // Headers para CORS y seguridad
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
  
  // Optimización del bundle
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Configuración para Web3
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    return config;
  },
};

module.exports = nextConfig;
