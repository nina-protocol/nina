import React, { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import Router from 'next/router'
import { SnackbarProvider } from 'notistack'
import { ThemeProvider } from '@mui/material/styles'
import { NinaTheme } from '../../NinaTheme'
import Head from 'next/head'
import NinaSdk from '@nina-protocol/js-sdk'
import { initSdkIfNeeded } from '@nina-protocol/nina-internal-sdk/src/utils/sdkInit'
import WalletWrapper from '@nina-protocol/nina-internal-sdk/esm/WalletWrapper'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
import 'react-dropzone-uploader/dist/styles.css'

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
      await initSdkIfNeeded()
      setSdkInitialized(true)
    }
    handleSdkInitialization()

    return () => {
      Router.events.off('routeChangeStart', start)
      Router.events.off('routeChangeComplete', end)
      Router.events.off('routeChangeError', end)
    }
  }, [])

  // if (!isMobile) {
  //   walletOptions.push(
  //     new SolletWalletAdapter({ network }),
  //     new SolletExtensionWalletAdapter({ network })
  //   )
  // }
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
      <WalletWrapper.Provider>
        <NinaWrapper network={process.env.REACT_APP_CLUSTER}>
          <ThemeProvider theme={NinaTheme}>
            <Layout>
              <Component {...pageProps} loading={loading || !sdkInitialized} />
            </Layout>
          </ThemeProvider>
        </NinaWrapper>
      </WalletWrapper.Provider>
    </SnackbarProvider>
  )
}

export default Application
