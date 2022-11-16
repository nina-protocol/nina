const path = require('path');
const withTM = require("next-transpile-modules")([
  "@project-serum/sol-wallet-adapter",
  "@solana/wallet-adapter-base",
  "@solana/wallet-adapter-react",
  "@solana/wallet-adapter-wallets",
  "@solana/wallet-adapter-material-ui",
  "@solana/wallet-adapter-react-ui",
  "@solana/wallet-adapter-phantom",
  "@solana/wallet-adapter-solflare",
  "@solana/wallet-adapter-sollet",
]); // pass the modules you would like to see transpiled

module.exports = withTM({
  distDir: "./build",
  webpack5: true,
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      path: false,
      os: false,
      crypto: false,
      stream: false,
      https: false,
    };
    config.resolve.alias = {
      ...config.resolve.alias,
      '@nina-protocol/nina-internal-sdk': path.resolve('../node_modules/@nina-protocol/nina-internal-sdk'),
      react: path.resolve('../node_modules/react'),
      zlib: require.resolve('zlib-browserify'),
    }

    return config;
  },
  env: {
    IMGIX_URL: process.env.IMGIX_URL,
    NEXT_PUBLIC_IMGIX_TOKEN: process.env.NEXT_PUBLIC_IMGIX_TOKEN,
    NINA_API_ENDPOINT: process.env.NINA_API_ENDPOINT,
    NINA_PROGRAM_ID: process.env.NINA_PROGRAM_ID,
    SOLANA_CLUSTER_URL: process.env.SOLANA_CLUSTER_URL,
    SOLANA_CLUSTER: process.env.SOLANA_CLUSTER,
  },
  images: {
    deviceSizes: [320, 420, 640, 750, 828, 1080, 1200, 1920, 2048],
    loader: "imgix",
    path: `${process.env.IMGIX_URL}/`,
    domains: ["www.arweave.net", "arweave.net", process.env.IMGIX_URL],
  },
});
