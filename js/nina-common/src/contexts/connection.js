import { createContext, useState, useMemo, useEffect } from 'react'
import { Connection } from '@solana/web3.js'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { WalletProvider } from '@solana/wallet-adapter-react'
import {
  getPhantomWallet,
  getSolflareWallet,
  getSolletWallet,
  getSolletExtensionWallet,
} from '@solana/wallet-adapter-wallets'

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
  const [healthOk, setHealthOk] = useState(true)
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

  let timer = undefined

  const healthCheck = async () => {
    const performance = await connection._rpcRequest(
      'getRecentPerformanceSamples',
      [5]
    )
    const reducer = (_, currentSample) =>
      (currentSample.numTransactions / currentSample.samplePeriodSecs) > 1000
    const status = performance.result.reduce(reducer)
    setHealthOk(status)
  }

  useEffect(() => {
    if (!timer) {
      healthCheck()
      timer = setInterval(() => healthCheck(), 60000)
    }
    return () => {
      clearInterval(timer)
      timer = null
    }
  }, [healthCheck])

  return (
    <ConnectionContext.Provider
      value={{
        endpoint,
        connection,
        healthOk,
      }}
    >
      <WalletProvider wallets={wallets} autoConnect>
        {children}
      </WalletProvider>
    </ConnectionContext.Provider>
  )
}

export default ConnectionContextProvider
