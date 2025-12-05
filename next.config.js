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
    webpack: (config, { isServer, nextRuntime }) => {
        // Mark node modules as external so Webpack preserves the require()
        // allowing Cloudflare's nodejs_compat to provide them
        config.externals.push({
            'net': 'commonjs net',
            'tls': 'commonjs tls',
            'dns': 'commonjs dns',
        });

        config.resolve.fallback = {
            ...config.resolve.fallback,
            // Stub modules not needed at runtime or not available
            fs: false,
            child_process: false,
            "pg-native": false,
            // string_decoder should be handled by npm install, but stub path if needed
            path: false,
            stream: false,
            crypto: false,
        }
        return config
    },
}

module.exports = nextConfig
