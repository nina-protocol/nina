import React, { useMemo, useState } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { GlowWalletAdapter } from "@solana/wallet-adapter-glow";
import { SnackbarProvider } from "notistack";
import Box from "@mui/material/Box";
import dynamic from "next/dynamic";
import NinaSdk from '@nina-protocol/js-sdk'

NinaSdk.client.init(
  process.env.NINA_API_ENDPOINT,
  process.env.SOLANA_CLUSTER_URL,
  process.env.NINA_PROGRAM_ID
)

// Use require instead of import since order matters
// require('@solana/wallet-adapter-react-ui/styles.css');
// require('../styles/globals.css');
const NinaWrapper = dynamic(() => import("../components/NinaWrapper"));
const Dots = dynamic(() => import("../components/Dots"));
const Layout = dynamic(() => import("../components/Layout"));
// const lightTheme = createTheme(lightThemeOptions);

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
    process.env.SOLANA_CLUSTER === "mainnet-beta"
      ? WalletAdapterNetwork.MainnetBeta
      : WalletAdapterNetwork.Devnet;

  const endpoint = useMemo(() => {
    return process.env.SOLANA_CLUSTER_URL;
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
            <NinaWrapper network={process.env.SOLANA_CLUSTER}>
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
