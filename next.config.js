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
    webpack: (config) => {
        config.resolve.fallback = {
            ...config.resolve.fallback,
            // Mock Node.js modules that are not available in Edge Runtime
            fs: false,
            child_process: false,
            "pg-native": false,
            // Also these reported errors
            path: false,
            stream: false,
            crypto: false,
        }
        return config
    },
}

module.exports = nextConfig
