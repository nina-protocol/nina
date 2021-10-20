import React from 'react'
import { styled } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack'
import { ThemeProvider } from '@mui/material/styles';
import {StyledEngineProvider} from '@mui/styled-engine';
import { NinaTheme } from './NinaTheme'
import Router from './routes'
import ninaCommon from 'nina-common'

const PREFIX = 'App';

const classes = {
  containerRoot: `${PREFIX}-containerRoot`,
  success: `${PREFIX}-success`,
  error: `${PREFIX}-error`,
  info: `${PREFIX}-info`
};

const StyledStyledEngineProvider = styled(StyledEngineProvider)({
  [`& .${classes.containerRoot}`]: { paddingTop: '75px' },
  [`& .${classes.success}`]: { backgroundColor: 'rgba(45, 129, 255, 1)' },
  [`& .${classes.error}`]: { backgroundColor: 'red' },
  [`& .${classes.info}`]: { backgroundColor: 'rgba(45, 129, 255, 1)' },
});

const {
  ConnectionContextProvider,
  ReleaseContextProvider,
  ExchangeContextProvider,
  AudioPlayerContextProvider,
  NameContextProvider,
  NinaContextProvider,
} = ninaCommon.contexts

const { extendBorsh } = ninaCommon.utils.metaplex.borsh

function App() {
  extendBorsh()


  return (
    <StyledStyledEngineProvider injectFirst>
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
    </StyledStyledEngineProvider>
  );
}

export default (App)
