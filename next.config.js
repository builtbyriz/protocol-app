/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        unoptimized: true,
    },
    webpack: (config, { isServer }) => {
        // Mark available node modules as external (provided by nodejs_compat)
        config.externals.push({
            'net': 'node:net',
            'tls': 'node:tls',
            'fs': 'node:fs', // explicit node prefix might help if some dep tries to require it despite fallback
            'path': 'node:path',
            'stream': 'node:stream',
            // dns is NOT external because we are shimming it
        });

        // Add alias for dns to our shim
        const path = require('path');
        config.resolve.alias = {
            ...config.resolve.alias,
            'dns': path.resolve(__dirname, 'lib/shims/dns.js'),
        };

        config.resolve.fallback = {
            ...config.resolve.fallback,
            // Stub modules not available
            fs: false,
            child_process: false,
            "pg-native": false,
            path: false,
            stream: false,
            crypto: false,
        }
        return config
    },
}

module.exports = nextConfig
