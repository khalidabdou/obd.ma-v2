import type { NextConfig } from "next";


require("events").EventEmitter.defaultMaxListeners = 20;

const nextConfig: NextConfig = {

    images: {
      remotePatterns: [
        // Dynamic pattern from environment variables
        ...(process.env.IMAGES_CONFIG_HOSTNAME ? [{
          protocol : (process.env.IMAGES_CONFIG_PROTOCOL || "http") as "http" | "https",
          hostname : process.env.IMAGES_CONFIG_HOSTNAME,
          port : process.env.IMAGES_CONFIG_PORT || '',
          pathname :'/api/images/**'
        }] : []),
        // Production domains (explicit fallback)
        {
          protocol: 'https',
          hostname: 'api-dev.obd.ma',
          pathname: '/api/images/**',
        },
        {
          protocol: 'https',
          hostname: 'api.obd.ma',
          pathname: '/api/images/**',
        },
        // Local development
        {
          protocol: 'http',
          hostname: 'localhost',
          port: '4001',
          pathname: '/api/images/**',
        },
        {
          protocol: 'http',
          hostname: 'localhost',
          port: '4000',
          pathname: '/api/images/**',
        },
        // Docker internal network
        {
          protocol: 'http',
          hostname: 'backend',
          port: '4001',
          pathname: '/api/images/**',
        }
      ],
    },

  
};


export default nextConfig;
