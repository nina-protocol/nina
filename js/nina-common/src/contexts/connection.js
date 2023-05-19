import { createContext, useState, useMemo } from 'react'
import { Connection } from '@solana/web3.js'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { WalletProvider } from '@solana/wallet-adapter-react'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare'

export const ENDPOINTS = {
  devnet: {
    name: 'devnet',
    endpoint: 'https://api.devnet.solana.com',
    custom: false,
  },
  testnet: {
    name: 'testnet',
    endpoint: 'https://api.testnet.solana.com',
    custom: false,
  },
  mainnet: {
    name: 'mainnet',
    endpoint: 'https://nina.rpcpool.com',
    custom: true,
  },
}

export const ConnectionContext = createContext()
const ConnectionContextProvider = ({ children }) => {
  const network =
    process.env.REACT_APP_CLUSTER === 'mainnet'
      ? WalletAdapterNetwork.MainnetBeta
      : WalletAdapterNetwork.Devnet
  const [endpoint] = useState(ENDPOINTS[process.env.REACT_APP_CLUSTER].endpoint)

  const connection = useMemo(
    () => new Connection(endpoint, 'recent'),
    [endpoint]
  )

  const walletOptions = [
    new PhantomWalletAdapter({ network }),
    new SolflareWalletAdapter({ network }),
  ]
  const wallets = useMemo(() => walletOptions, [network])

  return (
    <ConnectionContext.Provider
      value={{
        endpoint,
        connection,
      }}
    >
      <WalletProvider wallets={wallets} autoConnect>
        {children}
      </WalletProvider>
    </ConnectionContext.Provider>
  )
}

export default ConnectionContextProvider
