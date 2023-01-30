import React, { useMemo, useState, useEffect } from 'react'
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare'
import { GlowWalletAdapter } from '@solana/wallet-adapter-glow'
import { BackpackWalletAdapter } from '@solana/wallet-adapter-backpack'
import { SnackbarProvider } from 'notistack'
import dynamic from 'next/dynamic'
import { initSdkIfNeeded } from '@nina-protocol/nina-internal-sdk/src/utils/sdkInit'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
import 'react-dropzone-uploader/dist/styles.css'
import Dots from '@nina-protocol/nina-internal-sdk/esm/Dots'
const NinaWrapper = dynamic(() => import('../components/NinaWrapper'))
const Layout = dynamic(() => import('../components/Layout'))
// const lightTheme = createTheme(lightThemeOptions);

const App = ({ Component, pageProps }) => {
  const [loading, setLoading] = useState(false)
  const [sdkInitialized, setSdkInitialized] = useState(false)

  useEffect(() => {
    // const start = () => {
    //   setLoading(true);
    // };
    // const end = () => {
    //   setLoading(false);
    // };
    // Router.events.on("routeChangeStart", start);
    // Router.events.on("routeChangeComplete", end);
    // Router.events.on("routeChangeError", end);

    // const jssStyles = document.querySelector("#jss-server-side");
    // if (jssStyles) {
    //   jssStyles.parentElement.removeChild(jssStyles);
    // }

    const handleSdkInitialization = async () => {
      await initSdkIfNeeded()
      setSdkInitialized(true)
    }
    handleSdkInitialization()

    // return () => {
    //   Router.events.off("routeChangeStart", start);
    //   Router.events.off("routeChangeComplete", end);
    //   Router.events.off("routeChangeError", end);
    // };
  }, [])
  // Can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network =
    process.env.SOLANA_CLUSTER === 'mainnet-beta'
      ? WalletAdapterNetwork.MainnetBeta
      : WalletAdapterNetwork.Devnet

  const endpoint = useMemo(() => {
    return process.env.SOLANA_CLUSTER_URL
  }, [network])

  // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking and lazy loading --
  // Only the wallets you configure here will be compiled into your application, and only the dependencies
  // of wallets that your users connect to will be loaded
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter({ network }),
      new GlowWalletAdapter({ network }),
      new BackpackWalletAdapter({ network }),
    ],
    [network]
  )

  return (
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
    >
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <NinaWrapper network={process.env.SOLANA_CLUSTER}>
              <Layout loading={!sdkInitialized}>
                <Component {...pageProps} loading={!sdkInitialized} />
              </Layout>
            </NinaWrapper>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </SnackbarProvider>
  )
}

export default App
