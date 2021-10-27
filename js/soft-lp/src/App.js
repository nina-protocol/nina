import React from 'react'
import {withStyles} from '@mui/styles';
import { SnackbarProvider } from 'notistack'
import { ThemeProvider } from '@mui/styles'
import { StyledEngineProvider } from '@mui/styled-engine'
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

function App({classes}) {
  extendBorsh()

  return (
    <StyledEngineProvider injectFirst>
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
    </StyledEngineProvider>
  )
}

const styles = {
  containerRoot: {paddingTop: '75px'},
  success: {backgroundColor: 'rgba(45, 129, 255, 1)'},
  error: {backgroundColor: 'red'},
  info: {backgroundColor: 'rgba(45, 129, 255, 1)'},
}

export default withStyles(styles)(App)
