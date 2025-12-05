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
            // fs, path, etc are NOT external because they are NOT in the runtime. 
            // We must stub them below.
        });

        // Add alias for dns to our shim
        const path = require('path');
        config.resolve.alias = {
            ...config.resolve.alias,
            'dns': path.resolve(__dirname, 'lib/shims/dns.js'),
        };

        config.resolve.fallback = {
            ...config.resolve.fallback,
            // Stub modules not available in Edge Runtime
            fs: false,
            path: false,
            stream: false,
            child_process: false,
            "pg-native": false,
            crypto: false,
        }
        return config
    },
}

module.exports = nextConfig
