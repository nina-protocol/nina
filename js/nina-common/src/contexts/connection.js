import { createContext, useState, useMemo, useEffect } from 'react'
import { Connection } from '@solana/web3.js'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { WalletProvider } from '@solana/wallet-adapter-react'
import {
  PhantomWallet,
  SolflareWallet,
  SolletWallet,
  SolletExtensionWallet,
} from '@solana/wallet-adapter-wallets'
import { isMobile } from 'react-device-detect'

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

  const walletOptions = [
    PhantomWallet({ network }),
    SolflareWallet({ network }),
  ]

  if (!isMobile) {
    walletOptions.push(
      SolletWallet({ network }),
      SolletExtensionWallet({ network })
    )
  }

  const wallets = useMemo(() => walletOptions, [])

  let timer = undefined

  const healthCheck = async () => {
    const timeSinceLastCheck = (Date.now() - healthTimestamp) / 1000
    if (timeSinceLastCheck > 30) {
      try {
        setHealthTimestamp(Date.now())
        const performance = await connection._rpcRequest(
          'getRecentPerformanceSamples',
          [5]
        )
        let status = false
        performance.result.forEach((sample) => {
          status = sample.numTransactions / sample.samplePeriodSecs > 1000
        })
        setHealthOk(status)
      } catch (error) {
        console.warn(error)
      }
    }
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
