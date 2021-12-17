import React from 'react'
import {Helmet} from 'react-helmet'
import {withStyles} from '@mui/styles'
import Head from 'next/head';
import {SnackbarProvider} from 'notistack'
import {ThemeProvider} from '@mui/material/styles'
import {NinaTheme} from '../NinaTheme'
import ninaCommon from 'nina-common'
import { CacheProvider } from '@emotion/react';
import createEmotionCache from '../src/createEmotionCache';

const {
  ConnectionContextProvider,
  ReleaseContextProvider,
  ExchangeContextProvider,
  AudioPlayerContextProvider,
  NameContextProvider,
  NinaContextProvider,
} = ninaCommon.contexts

const clientSideEmotionCache = createEmotionCache();

export const ENDPOINTS = {
  devnet: {
    name: 'devnet',
    endpoint: 'https://api.devnet.solana.com',
    custom: false,
  },
  testnet: {
    name: 'testnet',
    endpoint: 'https://api.testnet.solana.com',
    custom: false,
  },
  mainnet: {
    name: 'mainnet',
    endpoint: 'https://nina.rpcpool.com',
    custom: true,
  },
}


function Application({Component, clientSideEmotionCache, pageProps}) {

  React.useEffect(() => {
      // Remove the server-side injected CSS.
      const jssStyles = document.querySelector('#jss-server-side');
      if (jssStyles) {
          jssStyles.parentElement.removeChild(jssStyles);
      }
  }, []);

  return( 
        <SnackbarProvider
          maxSnack={3}
          classes={{
            // containerRoot: classes.containerRoot,
            // variantSuccess: classes.success,
            // variantError: classes.error,
            // variantInfo: classes.info,
          }}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
        >
          <ConnectionContextProvider ENDPOINTS={ENDPOINTS}>
            <NinaContextProvider>
              <ReleaseContextProvider>
                <NameContextProvider>
                  <AudioPlayerContextProvider>
                    <ExchangeContextProvider>
                      <CacheProvider value={clientSideEmotionCache}>
                        <Head>
                          <title>My page</title>
                          <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
                        </Head>
                          <ThemeProvider theme={NinaTheme}>
                            <Component {...pageProps} />
                          </ThemeProvider>
                      </CacheProvider>
                    </ExchangeContextProvider>
                  </AudioPlayerContextProvider>
                </NameContextProvider>
              </ReleaseContextProvider>
            </NinaContextProvider>
          </ConnectionContextProvider>
        </SnackbarProvider>
  )
}

export default Application