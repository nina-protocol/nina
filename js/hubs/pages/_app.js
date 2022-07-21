import React, { useMemo, useContext, useEffect, useState } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { GlowWalletAdapter } from "@solana/wallet-adapter-glow";
// import {ThemeProvider, createTheme} from "@mui/material/styles";
import { CacheProvider } from "@emotion/react";
import { SnackbarProvider } from "notistack";
import Box from "@mui/material/Box";
import Router from "next/router";
import dynamic from "next/dynamic";
import nina from "@nina-protocol/nina-sdk";

import createEmotionCache from "../utils/createEmotionCache";
import { lightThemeOptions } from "../styles/theme/lightThemeOptions";

// Use require instead of import since order matters
// require('@solana/wallet-adapter-react-ui/styles.css');
// require('../styles/globals.css');
const NinaWrapper = dynamic(() => import("../components/NinaWrapper"));
const Dots = dynamic(() => import("../components/Dots"));
const Layout = dynamic(() => import("../components/Layout"));
const clientSideEmotionCache = createEmotionCache();
// const lightTheme = createTheme(lightThemeOptions);
const { HubContext } = nina.contexts;

const App = ({ Component, pageProps }) => {
  const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   const start = () => {
  //     setLoading(true);
  //   };
  //   const end = () => {
  //     setLoading(false);
  //   };
  //   Router.events.on("routeChangeStart", start);
  //   Router.events.on("routeChangeComplete", end);
  //   Router.events.on("routeChangeError", end);

  //   const jssStyles = document.querySelector("#jss-server-side");
  //   if (jssStyles) {
  //     jssStyles.parentElement.removeChild(jssStyles);
  //   }

  //   return () => {
  //     Router.events.off("routeChangeStart", start);
  //     Router.events.off("routeChangeComplete", end);
  //     Router.events.off("routeChangeError", end);
  //   };
  // }, []);
  // Can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network =
    process.env.REACT_APP_CLUSTER === "mainnet-beta"
      ? WalletAdapterNetwork.MainnetBeta
      : WalletAdapterNetwork.Devnet;

  const endpoint = useMemo(() => {
    if (network === WalletAdapterNetwork.MainnetBeta) {
      return "https://nina.rpcpool.com";
    } else if (network === WalletAdapterNetwork.Devnet) {
      return "https://nina.devnet.rpcpool.com";
    }
    return clusterApiUrl(network);
  }, [network]);

  // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking and lazy loading --
  // Only the wallets you configure here will be compiled into your application, and only the dependencies
  // of wallets that your users connect to will be loaded
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter({ network }),
      new GlowWalletAdapter({ network }),
    ],
    [network]
  );

  return (
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
    >
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <NinaWrapper network={process.env.REACT_APP_CLUSTER}>
              <Layout>
                {loading ? (
                  <Box width="100%" margin="auto">
                    <Dots size="80px" />
                  </Box>
                ) : (
                  <Component {...pageProps} />
                )}
              </Layout>
            </NinaWrapper>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </SnackbarProvider>
  );
};

export default App;
