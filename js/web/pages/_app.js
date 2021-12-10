import React from 'react'
import {Helmet} from 'react-helmet'
import {withStyles} from '@mui/styles'
import {SnackbarProvider} from 'notistack'
import {ThemeProvider} from '@mui/material/styles'
import {StyledEngineProvider} from '@mui/styled-engine'
// import {NinaTheme} from './NinaTheme'
import ninaCommon from 'nina-common'

const {
  ConnectionContextProvider,
  ReleaseContextProvider,
  ExchangeContextProvider,
  AudioPlayerContextProvider,
  NameContextProvider,
  NinaContextProvider,
} = ninaCommon.contexts

function Application({Component, pageProps}) {
  return <Component {...pageProps} />
}

export default Application