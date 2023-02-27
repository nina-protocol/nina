import React, { createContext, useEffect, useMemo, useState } from 'react';
import { useWallet as useWalletWalletAdapter, useConnection } from '@solana/wallet-adapter-react'
import Torus from '@toruslabs/customauth'
import { getED25519Key } from '@toruslabs/openlogin-ed25519'
import * as anchor from '@project-serum/anchor'
import nacl from "tweetnacl";
import { decodeUTF8 } from "tweetnacl-util";

const GOOGLE = 'google'
const AUTH_DOMAIN = 'https://torus-test.auth0.com'

const verifierMap = {
  [GOOGLE]: {
    name: 'Google',
    typeOfLogin: 'google',
    clientId:
      '909687642844-3ejteujpuh416mu7lv12moufiis0ha19.apps.googleusercontent.com',
    verifier: 'nina-google-testnet',
  },
}

const WalletContext = createContext();
const WalletContextProvider = ({ children }) => {
  const { connection } = useConnection()
  const walletExtension = useWalletWalletAdapter()
  const [walletEmbed, setWalletEmbed] = useState(null)
  const [torus, setTorus] = useState()

  useEffect(() => {
    setupTorus()
  }, [])

  const wallet = useMemo(() => {
    return walletEmbed || walletExtension || {}
  }, [walletExtension, walletEmbed])

  const setupTorus = async () => {
    const torusWallet = new Torus({
      baseUrl: window.location.origin,
      enableLogging: true,
      network: 'testnet'
    })
    await torusWallet.init()
    setTorus(torusWallet)
  }

  const {
    connectWalletEmbed,
  } = walletContextHelper({
    setWalletEmbed,
    torus,
    connection
  })

  return (
    <WalletContext.Provider
      value={{
        wallet,
        walletExtension,
        connectWalletEmbed,
      }}>
      {children}
    </WalletContext.Provider>
  )
}

const walletContextHelper = ({
  setWalletEmbed,
  torus,
  connection
}) => {
  const connectWalletEmbed = async () => {
    const { typeOfLogin, clientId, verifier } =
    verifierMap['google']
    const loginDetails = await torus.triggerLogin({
      typeOfLogin,
      clientId,
      verifier,
      jwtParams: {
        domain: AUTH_DOMAIN,
      },
    })
    const { sk } = getED25519Key(loginDetails.privateKey)
    const keypair = anchor.web3.Keypair.fromSecretKey(sk)

    const wallet = {
      connected: true,
      connecting: false,
      disconnecting: false,
      disconnect: () => {
        setWalletEmbed(null)
      },
      publicKey: keypair.publicKey,
      signMessage: async (message) => {
        const messageBytes = decodeUTF8(message);
        const signature = nacl.sign.detached(messageBytes, keypair.secretKey);
        return signature;
      },
      signTransaction: async (transaction) => {
        const serializedTransaction = transaction.serializeMessage();
        const signedTransaction = nacl.sign.detached(
          serializedTransaction,
        )
        return signedTransaction;
      },
      sendTransaction: async (transaction) => {
        const txid = await anchor.web3.sendAndConfirmTransaction(
          connection,
          transaction,
          [keypair]
        );
        return txid;
      },
      wallet: {
        adapter: {
          name: 'Nina',
          url: 'https://ninaprotocol.com',
        }
      },
      wallets: [],
    }
    setWalletEmbed(wallet)
  }

  return {
    connectWalletEmbed,
  }
}

export default {
  Context: WalletContext,
  Provider: WalletContextProvider,
}