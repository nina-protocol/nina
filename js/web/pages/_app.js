import React from 'react'
import {Helmet} from 'react-helmet'
import {withStyles} from '@mui/styles'
import {SnackbarProvider} from 'notistack'
import {ThemeProvider} from '@mui/material/styles'
import {StyledEngineProvider} from '@mui/styled-engine'
import {NinaTheme} from '../NinaTheme'
import ninaCommon from 'nina-common'

const {
  ConnectionContextProvider,
  ReleaseContextProvider,
  ExchangeContextProvider,
  AudioPlayerContextProvider,
  NameContextProvider,
  NinaContextProvider,
} = ninaCommon.contexts


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


function Application({Component, pageProps}) {
  return( 
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={NinaTheme}>
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
            <NinaContextProvider
              releasePubkey={process.env.REACT_APP_RELEASE_PUBKEY}
            >
              <ReleaseContextProvider>
                <NameContextProvider>
                  <AudioPlayerContextProvider>
                    <ExchangeContextProvider>
                      <Component {...pageProps} />
                    </ExchangeContextProvider>
                  </AudioPlayerContextProvider>
                </NameContextProvider>
              </ReleaseContextProvider>
            </NinaContextProvider>
          </ConnectionContextProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  )
}

export default Application