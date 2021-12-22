import React, { useState } from "react";
import Router from "next/router";
import { SnackbarProvider } from "notistack";
import { ThemeProvider } from "@mui/material/styles";
import ninaCommon from "nina-common";
import { CacheProvider } from "@emotion/react";
import { NinaTheme } from "../NinaTheme";
import Layout from "../components/Layout";

const {
  ReleaseContextProvider,
  ExchangeContextProvider,
  AudioPlayerContextProvider,
  NameContextProvider,
  NinaContextProvider,
  ConnectionContextProvider,
} = ninaCommon.contexts;

const { Dots } = ninaCommon.components

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
  const [loading, setLoading] = useState(false);
  React.useEffect(() => {
    const start = () => {
      setLoading(true);
    };
    const end = () => {
      setLoading(false);
    };
    Router.events.on("routeChangeStart", start);
    Router.events.on("routeChangeComplete", end);
    Router.events.on("routeChangeError", end);

    const jssStyles = document.querySelector("#jss-server-side");
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }

    return () => {
      Router.events.off("routeChangeStart", start);
      Router.events.off("routeChangeComplete", end);
      Router.events.off("routeChangeError", end);
    };
  }, []);

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
                      {loading ?(
                        <Dots size="80px" />
                      ) : (
                        <Component {...pageProps} />
                      )}
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
