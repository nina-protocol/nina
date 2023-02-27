import React, { createContext, useMemo } from 'react'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare'
import { GlowWalletAdapter } from '@solana/wallet-adapter-glow'
import { BackpackWalletAdapter } from '@solana/wallet-adapter-backpack'
import Wallet from '../Wallet'

const WalletWrapperContext = createContext()
const WalletWrapperContextProvider = ({ children }) => {
  // Can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network =
    process.env.REACT_APP_CLUSTER === 'devnet'
      ? WalletAdapterNetwork.Devnet
      : WalletAdapterNetwork.MainnetBeta

  // You can also provide a custom RPC endpoint
  const endpoint = useMemo(() => {
    return process.env.SOLANA_CLUSTER_URL
  }, [network])

  const walletOptions = [
    new PhantomWalletAdapter({ network }),
    new SolflareWalletAdapter({ network }),
    new GlowWalletAdapter({ network }),
    new BackpackWalletAdapter({ network }),
  ]

  const wallets = useMemo(() => walletOptions, [network])

  return (
    <WalletWrapperContext.Provider>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <Wallet.Provider>{children}</Wallet.Provider>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </WalletWrapperContext.Provider>
  )
}

export default {
  Context: WalletWrapperContext,
  Provider: WalletWrapperContextProvider,
}
