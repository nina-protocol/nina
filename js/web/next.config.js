const path = require('path')
const withTM = require('next-transpile-modules')([
  '@project-serum/sol-wallet-adapter',
  '@solana/wallet-adapter-base',
  '@solana/wallet-adapter-react',
  '@solana/wallet-adapter-wallets',
  '@solana/wallet-adapter-material-ui',
  '@solana/wallet-adapter-react-ui',
  '@solana/wallet-adapter-phantom',
  '@solana/wallet-adapter-solflare',
  '@solana/wallet-adapter-sollet',
]) // pass the modules you would like to see transpiled

const { withSentryConfig } = require('@sentry/nextjs')
const sentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin. Keep in mind that
  // the following options are set automatically, and overriding them is not
  // recommended:
  //   release, url, org, project, authToken, configFile, stripPrefix,
  //   urlPrefix, include, ignore

  silent: true, // Suppresses all logs
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
}

const cluster = process.env.SOLANA_CLUSTER
const IMGIX_URL = cluster === 'devnet' ? 'nina-dev.imgix.net' : 'nina.imgix.net'
const NEXT_PUBLIC_IMGIX_TOKEN =
  cluster === 'devnet'
    ? process.env.NEXT_PUBLIC_IMGIX_TOKEN_DEV
    : process.env.NEXT_PUBLIC_IMGIX_TOKEN
const moduleExports = withTM({
  distDir: './build',
  webpack5: true,
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      path: false,
      os: false,
      crypto: false,
      stream: false,
      https: false,
      http: false,
    }
    config.resolve.alias = {
      ...config.resolve.alias,
      '@nina-protocol/nina-internal-sdk': path.resolve(
        '../node_modules/@nina-protocol/nina-internal-sdk'
      ),
      https: path.resolve('../node_modules/https-browserify'),
      http: path.resolve('../node_modules/http-browserify'),
      react: path.resolve('../node_modules/react'),
      crypto: path.resolve('../node_modules/crypto-browserify'),
      stream: path.resolve('../node_modules/stream-browserify'),
      zlib: path.resolve('../node_modules/zlib-browserify'),
      'bn.js': path.resolve('../node_modules/bn.js'),
      '@solana/web3.js': path.resolve('../node_modules/@solana/web3.js'),
      '@project-serum/serum': path.resolve(
        '../node_modules/@project-serum/serum'
      ),
      '@project-serum/anchor': path.resolve(
        '../node_modules/@coral-xyz/anchor'
      ),
      axios: path.resolve('../node_modules/axios'),
      buffer: path.resolve('../node_modules/buffer'),
      'buffer-layout': path.resolve('../node_modules/buffer-layout'),
      arweave: path.resolve('../node_modules/arweave'),
    }
    return config
  },
  env: {
    IMGIX_URL,
    NEXT_PUBLIC_IMGIX_TOKEN,
    REACT_APP_CLUSTER: cluster,
    NINA_API_ENDPOINT: process.env.NINA_API_ENDPOINT,
    NINA_PROGRAM_ID: process.env.NINA_PROGRAM_ID,
    NINA_SUBSCRIPTION_PUBKEY: process.env.NINA_SUBSCRIPTION_PUBKEY,
    SOLANA_CLUSTER_URL: process.env.SOLANA_CLUSTER_URL,
    SOLANA_CLUSTER: process.env.SOLANA_CLUSTER,
    NINA_IDENTITY_ENDPOINT: process.env.NINA_IDENTITY_ENDPOINT,
    ETH_CLUSTER_URL: process.env.ETH_CLUSTER_URL,
    IDENTITY_REDIRECT_URI: process.env.IDENTITY_REDIRECT_URI,
    SC_CLIENT_ID: process.env.SC_CLIENT_ID,
    IG_CLIENT_ID: process.env.IG_CLIENT_ID,
    TWITTER_AUTH_CLIENT_ID: process.env.TWITTER_AUTH_CLIENT_ID,
    AIRTABLE_API_KEY: process.env.AIRTABLE_API_KEY,
    NINA_HUBS_URL: process.env.NINA_HUBS_URL,
    NINA_API_KEY: process.env.NINA_API_KEY,
    SOLANA_CLUSTER_URL_BUNDLR: process.env.SOLANA_CLUSTER_URL_BUNDLR,
    NINA_GATE_URL: process.env.NINA_GATE_URL,
    MAGIC_KEY: process.env.MAGIC_KEY,
  },
  images: {
    loader: 'imgix',
    path: `https://${IMGIX_URL}/`,
    domains: ['www.arweave.net', 'arweave.net', IMGIX_URL],
    deviceSizes: [320, 420, 640, 750, 828, 1080, 1200, 1920, 2048],
  },
})

module.exports = withSentryConfig(moduleExports, sentryWebpackPluginOptions)
