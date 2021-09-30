import React from 'react'
import { SnackbarProvider } from 'notistack'
import { withStyles } from '@material-ui/core/styles'
import { ThemeProvider } from '@material-ui/styles'
import { SlpTheme } from './SlpTheme'
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

const styles = {
  containerRoot: { paddingTop: '75px' },
  success: { backgroundColor: 'rgba(45, 129, 255, 1)' },
  error: { backgroundColor: 'red' },
  info: { backgroundColor: 'rgba(45, 129, 255, 1)' },
}

function App({ classes }) {
  extendBorsh()

  return (
    <ThemeProvider theme={SlpTheme}>
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
  )
}

export default withStyles(styles)(App)
