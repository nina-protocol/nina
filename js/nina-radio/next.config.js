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
      react: path.resolve('../node_modules/react')
    }

    return config;
  },
  env: {
    REACT_APP_CLUSTER: "mainnet",
  },
  images: {
    domains: ["www.arweave.net"],
  },
});
