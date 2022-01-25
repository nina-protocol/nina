import { createContext, useState, useMemo, useEffect, useCallback } from 'react'
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
  const network =
    process.env.REACT_APP_CLUSTER === 'mainnet'
      ? WalletAdapterNetwork.MainnetBeta
      : WalletAdapterNetwork.Devnet
  const [endpoint] = useState(ENDPOINTS[process.env.REACT_APP_CLUSTER].endpoint)
  const [healthOk, setHealthOk] = useState(true)
  const [healthTimestamp, setHealthTimestamp] = useState(0)
  const connection = useMemo(
    () => new Connection(endpoint, 'recent'),
    [endpoint, network]
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

  const healthCheck = useCallback(async() => {
    const timeSinceLastCheck = (Date.now() - healthTimestamp) / 1000
    if (timeSinceLastCheck > 30) {
      try {
        setHealthTimestamp(Date.now())
        const performance = await connection._rpcRequest(
          'getRecentPerformanceSamples',
          [5]
        )
        let status = false
        performance.result.forEach(sample => {
          status = (sample.numTransactions / sample.samplePeriodSecs) > 1000
        })
        setHealthOk(status)
        console.log('OK');
      } catch (error) {
        console.warn(error)
      }
    }
  }, [healthTimestamp, healthOk])

  useEffect(() => {
    healthCheck();
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
