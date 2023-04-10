import React, { createContext, useMemo, useState } from 'react'
import {
  useWallet as useWalletWalletAdapter,
  useConnection,
} from '@solana/wallet-adapter-react'
import * as anchor from '@project-serum/anchor'
import tweetnaclUtil from 'tweetnacl-util'

const { decodeBase64 } = tweetnaclUtil

const WalletContext = createContext()
const WalletContextProvider = ({ children }) => {
  const { connection } = useConnection()
  const walletExtension = useWalletWalletAdapter()
  const [magicWallet, setMagicWallet] = useState(null)

  const wallet = useMemo(() => {
    //local storage set here
    if (typeof window !== 'undefined') {
      console.log('setting local storage');
      if (magicWallet) {
        localStorage.setItem('nina_magic_wallet', 'true')
      } else if (walletExtension) {
        localStorage.setItem('nina_magic_wallet', 'false')
      } 
    }
    return magicWallet || walletExtension || {}
  }, [walletExtension, magicWallet])

  const { connectMagicWallet } = walletContextHelper({
    setMagicWallet,
    connection,
  })

  return (
    <WalletContext.Provider
      value={{
        connection,
        wallet,
        walletExtension,
        connectMagicWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

const walletContextHelper = ({ setMagicWallet, connection }) => {
  const connectMagicWallet = async (magic) => {
    const isLoggedIn = await magic.user.isLoggedIn()
    if (isLoggedIn) {
      const user = await magic.user.getMetadata()

      const wallet = {
        connected: true,
        connecting: false,
        disconnecting: false,
        disconnect: async () => {
          await magic.user.logout()
          setMagicWallet(null)
        },
        publicKey: new anchor.web3.PublicKey(user.publicAddress),
        signMessage: async (message) => {
          const messageBytes = decodeBase64(message)
          return await magic.solana.signMessage(messageBytes)
        },
        signTransaction: async (transaction) => {
          const serializedTransaction = transaction.serializeMessage()
          const signedTransaction = await magic.solana.signTransaction(
            serializedTransaction
          )
          return signedTransaction
        },
        sendTransaction: async (transaction) => {
          const serializeConfig = {
            requireAllSignatures: false,
            verifySignatures: true,
          }

          const signedTransaction = await magic.solana.signTransaction(
            transaction,
            serializeConfig
          )
          const txid = await connection.sendRawTransaction(
            signedTransaction.rawTransaction
          )
          return txid
        },
        wallet: {
          adapter: {
            name: 'Nina',
            url: 'https://ninaprotocol.com',
          },
        },
        wallets: [],
      }
      setMagicWallet(wallet)
    }
  }

  return {
    connectMagicWallet,
  }
}

export default {
  Context: WalletContext,
  Provider: WalletContextProvider,
}
