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
      AudioPlayer: 'src/components/AudioPlayer.js',
      Dots: 'src/components/Dots.js',
      EmailCapture: 'src/components/EmailCapture.js',
      EmailCaptureForm: 'src/components/EmailCaptureForm.js',
      HubCreate: 'src/components/HubCreate.js',
      HubCreateConfirm: 'src/components/HubCreateConfirm.js',
      HubCreateForm: 'src/components/HubCreateForm.js',
      ColorModal: 'src/components/ColorModal.js',
      DevnetIndicator: 'src/components/DevnetIndicator.js',
      PendingReleasesIndicator: 'src/components/PendingReleasesIndicator.js',
      ReleaseCreateForm: 'src/components/ReleaseCreateForm.js',
      ReleaseCreateConfirm: 'src/components/ReleaseCreateConfirm.js',
      ReleaseCreate: 'src/components/ReleaseCreate.js',
      NinaBox: 'src/components/NinaBox.js',
      QuillEditor: 'src/components/QuillEditor.js',
      MediaDropzone: 'src/components/MediaDropzone.js',
      MediaDropzones: 'src/components/MediaDropzones.js',
      UploadInfoModal: 'src/components/UploadInfoModal.js',
      BundlrModal: 'src/components/BundlrModal.js',
      CloseRelease: 'src/components/CloseRelease.js',
      Gates: 'src/components/Gates.js',
      NotFound: 'src/components/NotFound.js',
      ReleaseSettingsModal: 'src/components/ReleaseSettingsModal.js',
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
