const path = require('path')
const webpack = require('webpack')
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const cluster = 'devnet'
/** @type {import('next').NextConfig} */
module.exports = withBundleAnalyzer({
  reactStrictMode: true,
  webpack5: true,
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      os: false,
      https: false,
      path: require.resolve('path-browserify'),
      process: require.resolve('process/browser'),
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer'),
    }
    config.resolve.alias = {
      ...config.resolve.alias,
      path: require.resolve('path-browserify'),
      react: path.resolve('../node_modules/react'),
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      process: require.resolve('process/browser'),
      zlib: require.resolve('zlib-browserify'),
      'bn.js': path.resolve('../node_modules/bn.js'),
      '@solana/web3.js': path.resolve('../node_modules/@solana/web3.js'),
      '@project-serum/serum': path.resolve(
        '../node_modules/@project-serum/serum'
      ),
      '@project-serum/anchor': path.resolve(
        '../node_modules/@project-serum/anchor'
      ),
      axios: path.resolve('../node_modules/axios'),
      buffer: path.resolve('../node_modules/buffer'),
      'buffer-layout': path.resolve('../node_modules/buffer-layout'),
      arweave: path.resolve('../node_modules/arweave'),
    }
    return config
  },
  env: {
    REACT_APP_CLUSTER: cluster,
    REACT_APP_CLUSTER_URL:
      cluster === 'devnet'
        ? 'https://nina.devnet.rpcpool.com'
        : 'https://nina.rpcpool.com',
    REACT_PROGRAM_ID:
      cluster === 'devnet'
        ? '77BKtqWTbTRxj5eZPuFbeXjx3qz4TTHoXRnpCejYWiQH'
        : 'ninaN2tm9vUkxoanvGcNApEeWiidLMM2TdBX8HoJuL4',
    INDEXER_URL: cluster === 'devnet' ? 'https://api-dev.nina.market/' : 'https://hubs.ninaprotocol.com/',
  },
  images: {
    domains: ['www.arweave.net', 'arweave.net'],
  },
})
