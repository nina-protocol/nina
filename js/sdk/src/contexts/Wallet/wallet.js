import React, { createContext, useMemo, useState, useEffect } from 'react'
import {
  useWallet as useWalletWalletAdapter,
  useConnection,
} from '@solana/wallet-adapter-react'
import { Magic } from 'magic-sdk'
import { SolanaExtension } from '@magic-ext/solana'
import * as anchor from '@coral-xyz/anchor'
import axios from 'axios'

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
        setPendingTransactionMessage('Completing transaction')
        setShortPendingTransactionMessage('Completing...')
      } else {
        setPendingTransactionMessage('Please approve transaction in wallet')
        setShortPendingTransactionMessage('Approve in wallet')
      }
    }
    transactionMessage()
  }, [wallet])

  const email = useMemo(() => {
    if (magicWallet?.wallet.adapter.user.email) {
      return magicWallet?.wallet.adapter.user.email
    } else {
      return 'n/a'
    }
  }, [magicWallet])

  return (
    <WalletContext.Provider
      value={{
        connection,
        email,
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
      const user = await magic.user.getInfo()
      if (user) {
        try {
          await axios.post(`${process.env.NINA_IDENTITY_ENDPOINT}/login`, {
            issuer: user.issuer,
            publicKey: user.publicAddress,
          })
        } catch (error) {
          console.error(error)
        }
      }
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
          if (transaction instanceof anchor.web3.VersionedTransaction) {
            const message = transaction.message.serialize()
            const signedMessage = await magic.solana.signMessage(message)
            transaction.addSignature(
              new anchor.web3.PublicKey(user.publicAddress),
              signedMessage
            )
            return transaction
          } else {
            const serializeConfig = {
              requireAllSignatures: false,
              verifySignatures: true,
            }
            const signedTransaction = await magic.solana.signTransaction(
              transaction,
              serializeConfig
            )
            let deserializedTransaction = anchor.web3.Transaction.from(
              signedTransaction.rawTransaction
            )

            transaction.signatures.forEach((signature) => {
              if (signature.signature) {
                deserializedTransaction.addSignature(
                  signature.publicKey,
                  signature.signature
                )
              }
            })
            signedTransaction.rawTransaction =
              deserializedTransaction.serialize()
            signedTransaction.signature = deserializedTransaction.signatures
            let deserializedSignedTransaction = anchor.web3.Transaction.from(
              signedTransaction.rawTransaction
            )

            return deserializedSignedTransaction
          }
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
          if (transaction.signatures.length > 1) {
            let deserializedTransaction = anchor.web3.Transaction.from(
              signedTransaction.rawTransaction
            )

            transaction.signatures.forEach((signature) => {
              if (signature.signature) {
                deserializedTransaction.addSignature(
                  signature.publicKey,
                  signature.signature
                )
              }
            })
            signedTransaction.rawTransaction =
              deserializedTransaction.serialize()
          }
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
        supportedTransactionVersions: ['legacy', 0],
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
