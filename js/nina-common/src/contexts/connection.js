import { createContext, useState, useMemo } from 'react'
import { Connection } from '@solana/web3.js'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { WalletProvider } from '@solana/wallet-adapter-react'
import {
  getPhantomWallet,
  getSolflareWallet,
  getSolletWallet,
  getSolletExtensionWallet,
} from '@solana/wallet-adapter-wallets'

export const ConnectionContext = createContext()
const ConnectionContextProvider = ({ children, ENDPOINTS }) => {
  console.log('ENDPOINTS :>> ', ENDPOINTS);
  console.log('process.env.REACT_APP_CLUSTER :>> ', process.env.REACT_APP_CLUSTER);

  console.log('ENDPOINTS[process.env.REACT_APP_CLUSTER].endpoint :>> ', ENDPOINTS[`${process.env.REACT_APP_CLUSTER}`].endpoint);
  const network =
    process.env.REACT_APP_CLUSTER === 'mainnet'
      ? WalletAdapterNetwork.MainnetBeta
      : WalletAdapterNetwork.Devnet
  const [endpoint] = useState(ENDPOINTS[`${process.env.REACT_APP_CLUSTER}`].endpoint)

  const connection = useMemo(
    () => new Connection(endpoint, 'recent'),
    [endpoint]
  )

  const wallets = useMemo(
    () => [
      getPhantomWallet({ network }),
      getSolletWallet({ network }),
      getSolletExtensionWallet({ network }),
      getSolflareWallet({ network }),
    ],
    []
  )

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
