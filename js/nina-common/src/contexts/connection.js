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

export const ConnectionContext = createContext()
const ConnectionContextProvider = ({ children, ENDPOINTS }) => {
  const network =
    process.env.REACT_APP_CLUSTER === 'mainnet'
      ? WalletAdapterNetwork.MainnetBeta
      : WalletAdapterNetwork.Devnet
  const [endpoint] = useState(ENDPOINTS[process.env.REACT_APP_CLUSTER].endpoint)
  const [healthOk, setHealthOk] = useState(true)
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

  let timer = undefined

  const healthCheck = async () => {
    const performance = await connection._rpcRequest(
      'getRecentPerformanceSamples',
      [5]
    )
      
    let status = false
    performance.result.forEach(sample => {
      status = (sample.numTransactions / sample.samplePeriodSecs) > 1000
    })
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
