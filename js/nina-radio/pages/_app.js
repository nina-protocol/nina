import React, { useState, useContext } from "react";
import {AnchorProvider} from '@project-serum/anchor'
import Router from "next/router";
import { SnackbarProvider } from "notistack";
import { ThemeProvider } from "@mui/material/styles";
import Nina from "@nina-protocol/nina-internal-sdk/esm/Nina";
import Release from "@nina-protocol/nina-internal-sdk/esm/Release";
import NinaClient from "@nina-protocol/nina-internal-sdk/esm/client";
import { CacheProvider } from "@emotion/react";
import createCache from '@emotion/cache';
import { NinaTheme } from "../../NinaTheme";
import Layout from "../components/Layout";
import Dots from '../components/Dots'
import WalletWrapper from '@nina-protocol/nina-internal-sdk/esm/WalletWrapper'
import { useConnection } from '@solana/wallet-adapter-react'
import Wallet from '@nina-protocol/nina-internal-sdk/esm/Wallet'

const createEmotionCache = () => {
  return createCache({key: 'css'});
}

function Application({ Component, pageProps }) {
  const [loading, setLoading] = useState(false);
  const clientSideEmotionCache = createEmotionCache();
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
      anchorOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
    >
      <WalletWrapper.Provider>
        <NinaWrapper>
          <CacheProvider value={clientSideEmotionCache}>
            <ThemeProvider theme={NinaTheme}>
              <Layout>
                {loading ? (
                  <Dots size="80px" />
                ) : (
                  <Component {...pageProps} />
                )}
              </Layout>
            </ThemeProvider>
          </CacheProvider>
        </NinaWrapper>
      </WalletWrapper.Provider>
    </SnackbarProvider>
  );
}

const NinaWrapper = ({children}) => {
  const { wallet } = useContext(Wallet.Context)
  const connection = useConnection();
  const provider = new AnchorProvider(
    connection,
    wallet,
    {
      commitment: 'confirmed',
      preflightCommitment: 'processed'
    }
  )  

  const ninaClient = NinaClient(provider, process.env.REACT_APP_CLUSTER)

  return (
    <Nina.Provider ninaClient={ninaClient}>
      <Release.Provider>
        {children}
      </Release.Provider>
    </Nina.Provider>
  )
}
export default Application;
