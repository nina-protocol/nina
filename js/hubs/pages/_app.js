import React, { useMemo } from "react";
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
import dynamic from "next/dynamic";

// Use require instead of import since order matters
// require('@solana/wallet-adapter-react-ui/styles.css');
// require('../styles/globals.css');
const NinaWrapper = dynamic(() => import("../components/NinaWrapper"));
const Layout = dynamic(() => import("../components/Layout"));
// const lightTheme = createTheme(lightThemeOptions);

const App = ({ Component, pageProps }) => {

  // Can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network =
    process.env.REACT_APP_CLUSTER === "devnet"
      ? WalletAdapterNetwork.Devnet
      : WalletAdapterNetwork.MainnetBeta;

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
                <Component {...pageProps} />
               </Layout>
            </NinaWrapper>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </SnackbarProvider>
  );
};

export default App;
