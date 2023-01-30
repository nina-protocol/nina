import commonjs from 'rollup-plugin-commonjs'
import babel from 'rollup-plugin-babel'
import { terser } from 'rollup-plugin-terser'

export default [
  {
    external: [
      '@project-serum/anchor',
      'react',
      'axios',
      '@imgix/js-core',
      'idb-keyval',
      '@bundlr-network/client/build/web',
    ],
    plugins: [
      babel({
        exclude: 'node_modules/**',
        presets: ['@babel/env', '@babel/preset-react'],
      }),
      commonjs(),
      terser(),
    ],
    input: {
      Audio: 'src/contexts/Audio/index.js',
      Exchange: 'src/contexts/Exchange/index.js',
      Hub: 'src/contexts/Hub/index.js',
      Nina: 'src/contexts/Nina/index.js',
      Release: 'src/contexts/Release/index.js',
      client: 'src/client.js',
      utils: 'src/utils/index.js',
      EmailCapture: 'src/components/EmailCapture.js',
      EmailCaptureForm: 'src/components/EmailCaptureForm.js',
      AudioPlayer: 'src/components/AudioPlayer.js',
    },
    output: [
      {
        dir: 'esm',
        format: 'esm',
        exports: 'auto',
      },
      {
        dir: 'cjs',
        format: 'cjs',
        exports: 'auto',
      },
    ],
  },
]
