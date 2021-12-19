import React from "react";
import dynamic from 'next/dynamic';
import Head from "next/head";
import { SnackbarProvider } from "notistack";
import { ThemeProvider } from "@mui/material/styles";
import { NinaTheme } from "../NinaTheme";
import ninaCommon from "nina-common";
import { CacheProvider } from "@emotion/react";
// import createEmotionCache from '../src/createEmotionCache';
import Layout from "../components/Layout";

const ConnectionContextProvider = dynamic(() =>
  import('nina-common/dist/esm/contexts/connection'),
  { ssr: false }
);

const {
  ReleaseContextProvider,
  ExchangeContextProvider,
  AudioPlayerContextProvider,
  NameContextProvider,
  NinaContextProvider,
} = ninaCommon.contexts
// const clientSideEmotionCache = createEmotionCache();

const ENDPOINTS = {
  devnet: {
    name: "devnet",
    endpoint: "https://api.devnet.solana.com",
    custom: false,
  },
  testnet: {
    name: "testnet",
    endpoint: "https://api.testnet.solana.com",
    custom: false,
  },
  mainnet: {
    name: "mainnet",
    endpoint: "https://nina.rpcpool.com",
    custom: true,
  },
};

function Application({ Component, clientSideEmotionCache, pageProps }) {
  React.useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector("#jss-server-side");
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  if (!ConnectionContextProvider) {
    return null
  }
  return (  
    <SnackbarProvider
      maxSnack={3}
      classes={
        {
          // containerRoot: classes.containerRoot,
          // variantSuccess: classes.success,
          // variantError: classes.error,
          // variantInfo: classes.info,
        }
      }
      anchorOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
    >
      <ConnectionContextProvider ENDPOINTS={ENDPOINTS}>
        <NinaContextProvider>
          <ReleaseContextProvider>
            <NameContextProvider>
              <AudioPlayerContextProvider>
                <ExchangeContextProvider>
                  <CacheProvider value={clientSideEmotionCache}>
                    <ThemeProvider theme={NinaTheme}>
                      <Layout>
                        <Component {...pageProps} />
                      </Layout>
                    </ThemeProvider>
                  </CacheProvider>
                </ExchangeContextProvider>
              </AudioPlayerContextProvider>
            </NameContextProvider>
          </ReleaseContextProvider>
        </NinaContextProvider>
      </ConnectionContextProvider>
    </SnackbarProvider>
  );
}

export default Application;
