const config = {
  babel: {
    presets: [ '@babel/preset-env', '@babel/preset-typescript' ],
    plugins: [
      "@babel/plugin-proposal-nullish-coalescing-operator",
      "@babel/plugin-proposal-optional-chaining",
      "@babel/plugin-transform-shorthand-properties",
      "@babel/plugin-proposal-logical-assignment-operators",
    ],
  },
};
export default config;
