import React from 'react'
import { Helmet } from 'react-helmet'
import { withStyles } from '@mui/styles'
import { SnackbarProvider } from 'notistack'
import { ThemeProvider } from '@mui/material/styles'
import { StyledEngineProvider } from '@mui/styled-engine'
import { NinaTheme } from './NinaTheme'
import Router from './routes'
import ninaCommon from 'nina-common'

const {
  ConnectionContextProvider,
  ReleaseContextProvider,
  ExchangeContextProvider,
  AudioPlayerContextProvider,
  NameContextProvider,
  NinaContextProvider,
} = ninaCommon.contexts

const { extendBorsh } = ninaCommon.utils.metaplex.borsh

function App({ classes }) {
  extendBorsh()

  return (
    <>
      <Helmet>
        <title>{`Nina`}</title>
        <meta
          name="description"
          content={'A new way to publish, stream, and purchase music.'}
        />
      </Helmet>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={NinaTheme}>
          <SnackbarProvider
            maxSnack={3}
            classes={{
              containerRoot: classes.containerRoot,
              variantSuccess: classes.success,
              variantError: classes.error,
              variantInfo: classes.info,
            }}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
          >
            <ConnectionContextProvider>
              <NinaContextProvider
                releasePubkey={process.env.REACT_APP_RELEASE_PUBKEY}
              >
                <ReleaseContextProvider>
                  <NameContextProvider>
                    <AudioPlayerContextProvider>
                      <ExchangeContextProvider>
                        <Router />
                      </ExchangeContextProvider>
                    </AudioPlayerContextProvider>
                  </NameContextProvider>
                </ReleaseContextProvider>
              </NinaContextProvider>
            </ConnectionContextProvider>
          </SnackbarProvider>
        </ThemeProvider>
      </StyledEngineProvider>
    </>
  )
}

const styles = {
  containerRoot: { paddingTop: '75px' },
  success: { backgroundColor: 'rgba(45, 129, 255, 1)' },
  error: { backgroundColor: 'red' },
  info: { backgroundColor: 'rgba(45, 129, 255, 1)' },
}

export default withStyles(styles)(App)
