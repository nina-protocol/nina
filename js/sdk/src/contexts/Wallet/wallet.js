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
  const [pendingTransactionMessage, setPendingTransactionMessage] = useState()
  const [shortPendingTransactionMessage, setShortPendingTransactionMessage] =
    useState()

  const { connectMagicWallet, useMagic } = walletContextHelper({
    setMagicWallet,
    connection,
    magic,
    setMagic,
  })
  const wallet = useMemo(() => {
    return magicWallet || walletExtension || {}
  }, [walletExtension, magicWallet])

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
      connectMagicWallet(_magic)
    }
    checkIfMagicWalletIsLoggedIn()
  }, [])

  useEffect(() => {
    const transactionMessage = () => {
      if (wallet?.wallet?.adapter.name === 'Nina') {
        setPendingTransactionMessage('Completing transaction...')
        setShortPendingTransactionMessage('Completing...')
      } else {
        setPendingTransactionMessage('Please approve transaction in wallet...')
        setShortPendingTransactionMessage('Approve in wallet...')
      }
    }
    transactionMessage()
  }, [wallet])

  return (
    <WalletContext.Provider
      value={{
        connection,
        wallet,
        walletExtension,
        connectMagicWallet,
        useMagic,
        pendingTransactionMessage,
        shortPendingTransactionMessage,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

const walletContextHelper = ({
  setMagicWallet,
  connection,
  magic,
  setMagic,
}) => {
  const useMagic = async () => {
    let _magic = magic
    if (!_magic) {
      _magic = new Magic(process.env.MAGIC_KEY, {
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
          return await magic.solana.signMessage(message)
        },
        signTransaction: async (transaction) => {
          const serializeConfig = {
            requireAllSignatures: false,
            verifySignatures: true,
          }
          const signedTransaction = await magic.solana.signTransaction(
            transaction,
            serializeConfig
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
            user,
          },
        },
        wallets: [],
      }
      setMagicWallet(wallet)
    }
  }

  return {
    connectMagicWallet,
    useMagic,
  }
}

export default {
  Context: WalletContext,
  Provider: WalletContextProvider,
}
