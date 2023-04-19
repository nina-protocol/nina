import React, { createContext, useMemo, useState, useEffect } from 'react'
import {
  useWallet as useWalletWalletAdapter,
  useConnection,
} from '@solana/wallet-adapter-react'
import { Magic } from 'magic-sdk'
import { SolanaExtension } from '@magic-ext/solana'
import * as anchor from '@project-serum/anchor'

const WalletContext = createContext()
const WalletContextProvider = ({ children }) => {
  const { connection } = useConnection()
  const walletExtension = useWalletWalletAdapter()
  const [magicWallet, setMagicWallet] = useState(null)
  const [magic, setMagic] = useState(null)

  const { connectMagicWallet, useMagic } = walletContextHelper({
    setMagicWallet,
    connection,
    magic,
    setMagic
  })

  useEffect(() => {
    const checkIfMagicWalletIsLoggedIn = async () => {
      const _magic = new Magic(process.env.MAGIC_KEY, {
        extensions: {
          solana: new SolanaExtension({
            rpcUrl: process.env.SOLANA_CLUSTER_URL,
          }),
        },
      })
      setMagic(_magic)
      // const isLoggedIn = await _magic.user.isLoggedIn()
      // if (isLoggedIn) {
        connectMagicWallet(_magic)
      // }
    }
    checkIfMagicWalletIsLoggedIn()
  }, [])

  const wallet = useMemo(() => {
    //local storage set here
    if (typeof window !== 'undefined') {
      console.log('setting local storage')
      if (magicWallet) {
        localStorage.setItem('nina_magic_wallet', 'true')
      } else if (walletExtension) {
        localStorage.setItem('nina_magic_wallet', 'false')
      }
    }
    return magicWallet || walletExtension || {}
  }, [walletExtension, magicWallet])

  return (
    <WalletContext.Provider
      value={{
        connection,
        wallet,
        walletExtension,
        connectMagicWallet,
        useMagic,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

const walletContextHelper = ({ setMagicWallet, connection, magic, setMagic }) => {
  const useMagic = async () => {
    console.log('magic', magic)
    let _magic = magic
    if (!_magic) {
      magicInstance = new Magic(process.env.MAGIC_KEY, {
        extensions: {
          solana: new SolanaExtension({
            rpcUrl: process.env.SOLANA_CLUSTER_URL,
          }),
        },
      })
      setMagic(_magic)
    }

    return _magic
  }

  const connectMagicWallet = async (magic) => {
    const isLoggedIn = await magic.user.isLoggedIn()
    console.log('bruv')
    if (isLoggedIn) {
      const user = await magic.user.getMetadata()
      console.log('user: ', user)
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
          // const messageBytes = decodeBase64(message)
          return await magic.solana.signMessage(message)
        },
        signTransaction: async (transaction) => {
          console.log('transaction: ', transaction)        
          const serializeConfig = {
            requireAllSignatures: false,
            verifySignatures: true,
          }
          console.log('transaction.signatures: ', transaction.signatures)
          for (signature of transaction.signatures) {
            console.log('publicKey: ', signature.publicKey.toBase58())
          }
          // const serializedTransaction = transaction.serializeMessage()
          // console.log('serializedTransaction: ', serializedTransaction)
          const signedTransaction = await magic.solana.signTransaction(
            transaction,
            serializeConfig
          )
          console.log('signedTransaction: ', signedTransaction)
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
    useMagic
  }
}

export default {
  Context: WalletContext,
  Provider: WalletContextProvider,
}
