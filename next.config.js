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
            'net': 'commonjs net',
            'tls': 'commonjs tls',
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
