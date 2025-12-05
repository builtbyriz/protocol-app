// Shim for dns module to satisfy pg driver in Cloudflare Edge
// Cloudflare's connect() handles hostnames, so we can mock lookup to return the hostname.

const lookup = (hostname, options, callback) => {
    // Handle optional options argument
    if (typeof options === 'function') {
        callback = options;
        options = {};
    }

    // Mock response: just return the hostname as the address.
    // This assumes net.connect in Cloudflare accepts hostnames (which it does).
    // family 4 is IPv4
    if (callback) {
        callback(null, hostname, 4);
    }
};

const promises = {
    lookup: async (hostname, options) => {
        return { address: hostname, family: 4 };
    }
};

module.exports = {
    lookup,
    promises,
    // Add other dns methods if pg asks for them (usually just lookup is critical)
};
