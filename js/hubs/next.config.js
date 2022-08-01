const path = require("path");
const { withSentryConfig } = require('@sentry/nextjs');
const sentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin. Keep in mind that
  // the following options are set automatically, and overriding them is not
  // recommended:
  //   release, url, org, project, authToken, configFile, stripPrefix,
  //   urlPrefix, include, ignore
  silent: true, // Suppresses all logs
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
};

// const cluster = "mainnet-beta";
const cluster = "devnet";
const IMGIX_URL = cluster === "devnet" 
  ? "nina-dev.imgix.net"
  : "nina.imgix.net"
const NEXT_PUBLIC_IMGIX_TOKEN = cluster === "devnet" ? process.env.NEXT_PUBLIC_IMGIX_TOKEN_DEV : process.env.NEXT_PUBLIC_IMGIX_TOKEN
/** @type {import('next').NextConfig} */
const moduleExports = {
  reactStrictMode: true,
  webpack5: true,
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      os: false,
      https: false,
      path: require.resolve("path-browserify"),
      process: require.resolve("process/browser"),
      stream: require.resolve("stream-browserify"),
      buffer: require.resolve("buffer"),
    };
    config.resolve.alias = {
      ...config.resolve.alias,
      "@nina-protocol/nina-sdk": path.resolve(
        "../node_modules/@nina-protocol/nina-sdk"
      ),
      path: require.resolve("path-browserify"),
      react: path.resolve("../node_modules/react"),
      crypto: require.resolve("crypto-browserify"),
      stream: require.resolve("stream-browserify"),
      process: require.resolve("process/browser"),
      zlib: require.resolve("zlib-browserify"),
      "bn.js": path.resolve("../node_modules/bn.js"),
      "@solana/web3.js": path.resolve("../node_modules/@solana/web3.js"),
      "@project-serum/serum": path.resolve(
        "../node_modules/@project-serum/serum"
      ),
      "@project-serum/anchor": path.resolve(
        "../node_modules/@project-serum/anchor"
      ),
      axios: path.resolve("../node_modules/axios"),
      buffer: path.resolve("../node_modules/buffer"),
      "buffer-layout": path.resolve("../node_modules/buffer-layout"),
      arweave: path.resolve("../node_modules/arweave"),
    };
    return config;
  },
  env: {
    IMGIX_URL,
    NEXT_PUBLIC_IMGIX_TOKEN,
    REACT_APP_CLUSTER: cluster,
    REACT_APP_CLUSTER_URL:
      cluster === "devnet"
        ? "https://nina.devnet.rpcpool.com"
        : "https://nina.rpcpool.com",
    REACT_PROGRAM_ID:
      cluster === "devnet"
        ? "77BKtqWTbTRxj5eZPuFbeXjx3qz4TTHoXRnpCejYWiQH"
        : "ninaN2tm9vUkxoanvGcNApEeWiidLMM2TdBX8HoJuL4",
    INDEXER_URL:
      cluster === "devnet"
        ? "https://api-dev.nina.market"
        : "https://api.nina.market",
  },
  images: {
    deviceSizes: [320, 420, 640, 750, 828, 1080, 1200, 1920, 2048],
    loader: 'imgix',
    path: `https://${IMGIX_URL}/`,
    domains: ["www.arweave.net", "arweave.net", IMGIX_URL],
  },
};

module.exports = withSentryConfig(moduleExports, sentryWebpackPluginOptions)
