import React, { useState, useMemo } from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import {WalletAdapterNetwork} from '@solana/wallet-adapter-base';
import {WalletModalProvider} from '@solana/wallet-adapter-react-ui';
import {PhantomWalletAdapter} from '@solana/wallet-adapter-phantom';
import {SolflareWalletAdapter} from '@solana/wallet-adapter-solflare';
import { clusterApiUrl } from '@solana/web3.js'
import dynamic from 'next/dynamic'
import Router from 'next/router'
import { SnackbarProvider } from 'notistack'
import { isMobile } from 'react-device-detect'
import { ThemeProvider } from "@mui/material/styles";
import { CacheProvider } from '@emotion/react'
import createCache from '@emotion/cache';
import { NinaTheme } from '../../NinaTheme'
import Layout from '../components/Layout'
import Dots from '../components/Dots'

const createEmotionCache = () => {
  return createCache({key: 'css'});
}

const NinaWrapper = dynamic(() => import('../components/NinaWrapper'))

const clientSideEmotionCache = createEmotionCache();

console.log('clientSideEmotionCache :>> ', clientSideEmotionCache);

function Application({ Component, pageProps }) {
  const [loading, setLoading] = useState(false)
  React.useEffect(() => {
    const start = () => {
      setLoading(true)
    }
    const end = () => {
      setLoading(false)
    }
    Router.events.on('routeChangeStart', start)
    Router.events.on('routeChangeComplete', end)
    Router.events.on('routeChangeError', end)

    const jssStyles = document.querySelector('#jss-server-side')
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles)
    }

    return () => {
      Router.events.off('routeChangeStart', start)
      Router.events.off('routeChangeComplete', end)
      Router.events.off('routeChangeError', end)
    }
  }, [])
  // Can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network = process.env.REACT_APP_CLUSTER === 'devnet' ? 
    WalletAdapterNetwork.Devnet : 
    WalletAdapterNetwork.MainnetBeta

  // You can also provide a custom RPC endpoint
  const endpoint = useMemo(() => {
    if (network === WalletAdapterNetwork.MainnetBeta) {
      return 'https://nina.rpcpool.com'
    } else if (network === WalletAdapterNetwork.Devnet) {
      return 'https://nina.devnet.rpcpool.com'
    }
    return clusterApiUrl(network)
  }, [network]);

  const walletOptions = [
    new PhantomWalletAdapter({ network }),
    new SolflareWalletAdapter({ network }),
  ]

  // if (!isMobile) {
  //   walletOptions.push(
  //     new SolletWalletAdapter({ network }),
  //     new SolletExtensionWalletAdapter({ network })
  //   )
  // }
  const wallets = useMemo(
      () => walletOptions,
      [network]
  );
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
            <NinaWrapper network={process.env.REACT_APP_CLUSTER}>
              <CacheProvider value={clientSideEmotionCache}>
                <ThemeProvider theme={NinaTheme}>
                  <Layout>
                    {loading ? (
                      <Dots size="80px" />
                    ) : (
                      <Component {...pageProps} />
                    )}
                  </Layout>
                </ThemeProvider>
              </CacheProvider>
            </NinaWrapper>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </SnackbarProvider>
  )
}

export default Application
