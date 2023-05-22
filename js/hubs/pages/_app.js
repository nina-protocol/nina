import React, { useMemo, useState, useEffect } from 'react'
import { SnackbarProvider } from 'notistack'
import dynamic from 'next/dynamic'
import { initSdkIfNeeded } from '@nina-protocol/nina-internal-sdk/src/utils/sdkInit'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
import 'react-dropzone-uploader/dist/styles.css'
import WalletWrapper from '@nina-protocol/nina-internal-sdk/esm/WalletWrapper'

const NinaWrapper = dynamic(() => import('../components/NinaWrapper'))
const Layout = dynamic(() => import('../components/Layout'))
// const lightTheme = createTheme(lightThemeOptions);
const App = ({ Component, pageProps }) => {
  const [loading, setLoading] = useState(false)
  const [sdkInitialized, setSdkInitialized] = useState(false)

  useEffect(() => {
    // const start = () => {
    //   setLoading(true);
    // };
    // const end = () => {
    //   setLoading(false);
    // };
    // Router.events.on("routeChangeStart", start);
    // Router.events.on("routeChangeComplete", end);
    // Router.events.on("routeChangeError", end);

    // const jssStyles = document.querySelector("#jss-server-side");
    // if (jssStyles) {
    //   jssStyles.parentElement.removeChild(jssStyles);
    // }

    const handleSdkInitialization = async () => {
      await initSdkIfNeeded()
      setSdkInitialized(true)
    }
    handleSdkInitialization()

    // return () => {
    //   Router.events.off("routeChangeStart", start);
    //   Router.events.off("routeChangeComplete", end);
    //   Router.events.off("routeChangeError", end);
    // };
  }, [])
  // Can be set to 'devnet', 'testnet', or 'mainnet-beta'

  return (
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
    >
      <WalletWrapper.Provider>
        <NinaWrapper network={process.env.SOLANA_CLUSTER}>
          <Layout loading={!sdkInitialized}>
            <Component {...pageProps} loading={!sdkInitialized} />
          </Layout>
        </NinaWrapper>
      </WalletWrapper.Provider>
    </SnackbarProvider>
  )
}

export default App
