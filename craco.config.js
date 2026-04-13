// Craco lets us tweak CRA's webpack config without ejecting. The only thing
// we override is splitChunks: instead of CRA's default (which puts all
// node_modules into one giant `vendors` chunk that gets re-downloaded on
// every app update), we slice the heavy long-lived libraries into their own
// vendor chunks so they stay in the browser cache across deploys.
//
// How this saves bytes:
//   - framer-motion / recharts / react-aria rarely change between releases.
//     Once the user has them cached, an app update that only touches our
//     own code re-downloads the small `app` chunks but keeps the vendor
//     chunks from cache.
//   - We do NOT split react / react-dom / scheduler — they're tiny relative
//     to the others and putting them in the runtime chunk avoids a network
//     waterfall on the very first load.
//
// We don't change anything else: the SW precache injector still runs as the
// build's second step and picks up whatever hashed chunks webpack emits.
module.exports = {
    webpack: {
        configure: (webpackConfig, { env }) => {
            if (env !== 'production') return webpackConfig;

            // Match a package by its node_modules path. Webpack passes the
            // resolved module path here; we extract the package name and
            // compare. Scoped packages (`@react-aria/...`) are handled via
            // a startsWith check on the full directory name.
            const matchPackage = (names) => (module) => {
                if (!module.context) return false;
                const m = module.context.match(/[\\/]node_modules[\\/](?:(@[^\\/]+)[\\/])?([^\\/]+)/);
                if (!m) return false;
                const pkg = m[1] ? `${m[1]}/${m[2]}` : m[2];
                return names.some((name) => pkg === name || pkg.startsWith(`${name}/`));
            };

            webpackConfig.optimization = webpackConfig.optimization || {};
            webpackConfig.optimization.splitChunks = {
                chunks: 'all',
                maxInitialRequests: 25,
                minSize: 20000,
                cacheGroups: {
                    framerMotion: {
                        name: 'vendor-framer-motion',
                        test: matchPackage(['framer-motion']),
                        chunks: 'all',
                        priority: 40,
                        enforce: true,
                    },
                    recharts: {
                        name: 'vendor-recharts',
                        test: matchPackage(['recharts', 'd3-shape', 'd3-scale', 'd3-array', 'd3-time', 'd3-time-format', 'd3-format', 'd3-interpolate', 'd3-color', 'victory-vendor']),
                        chunks: 'all',
                        priority: 39,
                        enforce: true,
                    },
                    reactAria: {
                        name: 'vendor-react-aria',
                        test: matchPackage(['react-aria-components', '@react-aria', '@react-stately', '@react-types', '@internationalized']),
                        chunks: 'all',
                        priority: 38,
                        enforce: true,
                    },
                    socketIO: {
                        name: 'vendor-socket-io',
                        test: matchPackage(['socket.io-client', 'engine.io-client', 'engine.io-parser', 'socket.io-parser']),
                        chunks: 'all',
                        priority: 37,
                        enforce: true,
                    },
                    reactIcons: {
                        name: 'vendor-react-icons',
                        test: matchPackage(['react-icons']),
                        chunks: 'all',
                        priority: 36,
                        enforce: true,
                    },
                    // Default vendors bucket for everything else on the
                    // cold-boot path (react, react-dom, react-router, axios,
                    // tanstack/query, etc). Kept separate from app code so a
                    // small app-only update doesn't bust the vendor hash.
                    //
                    // `chunks: 'initial'` is critical here — without it,
                    // vendor code reachable only from lazy route chunks
                    // would get hoisted into this always-loaded bundle.
                    defaultVendors: {
                        name: 'vendors',
                        test: /[\\/]node_modules[\\/]/,
                        chunks: 'initial',
                        priority: 10,
                        reuseExistingChunk: true,
                    },
                    // Vendor code reachable only from a single lazy chunk
                    // stays inside that chunk (webpack's default). When the
                    // same vendor is shared across 2+ lazy routes, it gets
                    // its own async vendors chunk so we don't double-ship
                    // it.
                    asyncVendors: {
                        name: 'async-vendors',
                        test: /[\\/]node_modules[\\/]/,
                        chunks: 'async',
                        minChunks: 2,
                        priority: 9,
                        reuseExistingChunk: true,
                    },
                    // Same idea for our own src/ code: anything used by 2+
                    // lazy routes gets a shared chunk.
                    common: {
                        name: 'common',
                        minChunks: 2,
                        chunks: 'async',
                        priority: 5,
                        reuseExistingChunk: true,
                    },
                },
            };

            return webpackConfig;
        },
    },
};
