import React, { useState, useMemo } from 'react'
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare'
import { GlowWalletAdapter } from '@solana/wallet-adapter-glow'
import { SolletWalletAdapter } from '@solana/wallet-adapter-sollet'
import { clusterApiUrl } from '@solana/web3.js'
import dynamic from 'next/dynamic'
import Router from 'next/router'
import { SnackbarProvider } from 'notistack'
import { ThemeProvider } from '@mui/material/styles'
import { NinaTheme } from '../../NinaTheme'
import Dots from '../components/Dots'
import Head from 'next/head'
import NinaSdk from '@nina-protocol/js-sdk'

const NinaWrapper = dynamic(() => import('../components/NinaWrapper'))
const Layout = dynamic(() => import('../components/Layout'))

function Application({ Component, pageProps }) {
  const [loading, setLoading] = useState(false)
  const [sdkInitialized, setSdkInitialized] = useState(false)
  React.useEffect(() => {
    const start = () => {
      setLoading(true)
    }
    const end = async () => {
      setLoading(false)
    }
    Router.events.on('routeChangeStart', start)
    Router.events.on('routeChangeComplete', end)
    Router.events.on('routeChangeError', end)

    const jssStyles = document.querySelector('#jss-server-side')
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles)
    }

    const handleSdkInitialization = async () => {
      await NinaSdk.client.init(
        process.env.NINA_API_ENDPOINT,
        process.env.SOLANA_CLUSTER_URL,
        process.env.NINA_PROGRAM_ID
      )
      setSdkInitialized(true)
    }
    handleSdkInitialization()

    return () => {
      Router.events.off('routeChangeStart', start)
      Router.events.off('routeChangeComplete', end)
      Router.events.off('routeChangeError', end)
    }
  }, [])
  // Can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network =
    process.env.REACT_APP_CLUSTER === 'devnet'
      ? WalletAdapterNetwork.Devnet
      : WalletAdapterNetwork.MainnetBeta

  // You can also provide a custom RPC endpoint
  const endpoint = useMemo(() => {
    return process.env.SOLANA_CLUSTER_URL
  }, [network])

  const walletOptions = [
    new PhantomWalletAdapter({ network }),
    new SolflareWalletAdapter({ network }),
    new GlowWalletAdapter({ network }),
    new SolletWalletAdapter({ network }),
  ]

  // if (!isMobile) {
  //   walletOptions.push(
  //     new SolletWalletAdapter({ network }),
  //     new SolletExtensionWalletAdapter({ network })
  //   )
  // }
  const wallets = useMemo(() => walletOptions, [network])
  return (
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
    >
      <Head>
        <meta name="theme-color" content={'#ffffff'} key="theme" />
      </Head>

      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <NinaWrapper network={process.env.REACT_APP_CLUSTER}>
              <ThemeProvider theme={NinaTheme}>
                <Layout>
                  {loading || !sdkInitialized ? (
                    <Dots size="80px" />
                  ) : (
                    <Component {...pageProps} />
                  )}
                </Layout>
              </ThemeProvider>
            </NinaWrapper>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </SnackbarProvider>
  )
}

export default Application
