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
          pathname : '/**',
        }] : []),
        // Production domains (explicit fallback)
        {
          protocol: 'https',
          hostname: 'api-dev.obd.ma',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'api.obd.ma',
          pathname: '/**',
        },
        // Local development
        {
          protocol: 'http',
          hostname: 'localhost',
          port: '4001',
          pathname: '/**',
        },
        {
          protocol: 'http',
          hostname: 'localhost',
          port: '4000',
          pathname: '/**',
        },
        // Docker internal network
        {
          protocol: 'http',
          hostname: 'backend',
          port: '4001',
          pathname: '/**',
        }
      ],
    },

  
};


export default nextConfig;
