import React, { createContext, useContext, useState, useEffect } from 'react'
import * as anchor from '@project-serum/anchor'
import CoinGecko from 'coingecko-api'
import { useWallet } from '@solana/wallet-adapter-react'
import { ConnectionContext } from './connection'
import { findOrCreateAssociatedTokenAccount } from '../utils/web3'
import NinaClient from '../utils/client'

const CoinGeckoClient = new CoinGecko()

export const NinaContext = createContext()
const NinaContextProvider = ({ children, releasePubkey }) => {
  const { connection } = useContext(ConnectionContext)
  const wallet = useWallet()
  const [collection, setCollection] = useState({})
  const [usdcBalance, setUsdcBalance] = useState(0)
  const [solPrice, setSolPrice] = useState(0)
  const [npcAmountHeld, setNpcAmountHeld] = useState(0)

  useEffect(() => {
    if (wallet?.wallet && wallet.publicKey) {
      if (releasePubkey) {
        createCollectionForSingleRelease(releasePubkey)
      } else {
        createCollection()
      }
    } else {
      setCollection({})
      setUsdcBalance(0)
    }

    return () => {
      setCollection({})
    }
  }, [wallet.wallet, wallet.publicKey])

  const {
    createCollection,
    createCollectionForSingleRelease,
    addReleaseToCollection,
    removeReleaseFromCollection,
    shouldRemainInCollectionAfterSale,
    getAmountHeld,
    getSolPrice,
    getUsdcBalance,
    getNpcAmountHeld,
  } = ninaContextHelper({
    wallet,
    connection,
    collection,
    setCollection,
    setSolPrice,
    setUsdcBalance,
    npcAmountHeld,
    setNpcAmountHeld,
  })

  return (
    <NinaContext.Provider
      value={{
        collection,
        createCollection,
        createCollectionForSingleRelease,
        addReleaseToCollection,
        removeReleaseFromCollection,
        shouldRemainInCollectionAfterSale,
        getAmountHeld,
        getSolPrice,
        solPrice,
        getUsdcBalance,
        usdcBalance,
        getNpcAmountHeld,
        npcAmountHeld,
      }}
    >
      {children}
    </NinaContext.Provider>
  )
}
export default NinaContextProvider

const ninaContextHelper = ({
  wallet,
  connection,
  collection,
  setCollection,
  setSolPrice,
  setUsdcBalance,
  setNpcAmountHeld,
}) => {
  // Collection

  const provider = new anchor.Provider(
    connection,
    wallet,
    anchor.Provider.defaultOptions()
  )
  const createCollection = async () => {
    if (wallet?.connected) {
      try {
        const nina = await NinaClient.connect(provider)
        const updatedCollection = {}
        let tokenAccounts = await connection.getParsedTokenAccountsByOwner(
          wallet.publicKey,
          { programId: NinaClient.TOKEN_PROGRAM_ID }
        )
        const walletTokenAccounts = tokenAccounts.value.map(
          (value) => value.account.data.parsed.info
        )

        const releaseAmountMap = {}
        for await (let account of walletTokenAccounts) {
          const mint = new anchor.web3.PublicKey(account.mint)
          const balance = account.tokenAmount.uiAmount

          if (account.mint === NinaClient.ids().mints.usdc) {
            setUsdcBalance(balance.toFixed(2))
          } else if (balance > 0 && balance % 1 === 0) {
            const [release] = await anchor.web3.PublicKey.findProgramAddress(
              [
                Buffer.from(anchor.utils.bytes.utf8.encode('nina-release')),
                mint.toBuffer(),
              ],
              nina.program.programId
            )

            releaseAmountMap[release.toBase58()] = account.tokenAmount.uiAmount
          }
        }

        let releaseAccounts = await anchor.utils.rpc.getMultipleAccounts(
          connection,
          Object.keys(releaseAmountMap).map((r) => new anchor.web3.PublicKey(r))
        )
        releaseAccounts = releaseAccounts.filter((item) => item != null)
        releaseAccounts.map((releaseAccount) => {
          const releasePublicKey = releaseAccount.publicKey.toBase58()
          updatedCollection[releasePublicKey] =
            releaseAmountMap[releasePublicKey]
        })

        setCollection({
          ...collection,
          ...updatedCollection,
        })
      } catch (e) {
        console.warn('error: ', e)
        return
      }
    } else {
      console.warn('wallet not connected')
      return
    }
  }

  const createCollectionForSingleRelease = async (releasePubkey) => {
    if (wallet?.connected) {
      try {
        const updatedCollection = {}
        const nina = await NinaClient.connect(provider)
        const release = await nina.program.account.release.fetch(
          new anchor.web3.PublicKey(releasePubkey)
        )

        let tokenAccounts = await connection.getParsedTokenAccountsByOwner(
          wallet.publicKey,
          { programId: NinaClient.TOKEN_PROGRAM_ID }
        )
        const walletTokenAccounts = tokenAccounts.value.map(
          (value) => value.account.data.parsed.info
        )

        for await (let account of walletTokenAccounts) {
          const balance = account.tokenAmount.uiAmount

          if (account.mint === NinaClient.ids().mints.usdc) {
            setUsdcBalance(balance.toFixed(2))
          } else if (account.mint === release.releaseMint.toBase58()) {
            updatedCollection[releasePubkey] = account.tokenAmount.uiAmount
          }
        }

        setCollection({
          ...collection,
          ...updatedCollection,
        })
      } catch (e) {
        console.warn('error: ', e)
        return
      }
    } else {
      console.warn('wallet not connected')
      return
    }
  }
  const addReleaseToCollection = async (releasePubkey) => {
    const updatedCollection = { ...collection }
    if (updatedCollection[releasePubkey]) {
      updatedCollection[releasePubkey] += 1
    } else {
      updatedCollection[releasePubkey] = 1
    }
    setCollection({
      ...collection,
      ...updatedCollection,
    })
  }

  const removeReleaseFromCollection = async (releasePubkey, releaseMint) => {
    const remain = await shouldRemainInCollectionAfterSale(
      releasePubkey,
      releaseMint
    )
    if (!remain) {
      const updatedCollection = { ...collection }
      delete updatedCollection[releasePubkey]

      setCollection({ ...updatedCollection })
    }
  }

  const shouldRemainInCollectionAfterSale = async (
    releasePubkey,
    releaseMint
  ) => {
    let tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      wallet?.publicKey,
      { programId: NinaClient.TOKEN_PROGRAM_ID }
    )

    const account = tokenAccounts.value.filter(
      (value) => value.account.data.parsed.info.mint === releaseMint
    )

    if (
      account[0] &&
      account[0].account.data.parsed.info.tokenAmount.uiAmount >= 1
    ) {
      setCollection({
        ...collection,
        [releasePubkey]:
          account[0].account.data.parsed.info.tokenAmount.uiAmount,
      })
      return true
    }
    return false
  }

  const getAmountHeld = async (releaseMint) => {
    if (wallet?.connected) {
      let tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        wallet?.publicKey,
        { programId: NinaClient.TOKEN_PROGRAM_ID }
      )
      tokenAccounts.value.forEach((value) => {
        const account = value.account.data.parsed.info
        if (account.mint === releaseMint) {
          return account.tokenAmount.uiAmount
        }
      })
    }
    return 0
  }

  //Misc
  const getSolPrice = async () => {
    // const solPrice = await CoinGeckoClient.simple.price({
    //   ids: ['solana'],
    //   vs_currencies: 'usd',
    // })

    // setSolPrice(solPrice.data.solana.usd)
  }

  const getUsdcBalance = async () => {
    if (wallet?.connected && wallet?.publicKey) {
      try {
        let [usdcTokenAccountPubkey] = await findOrCreateAssociatedTokenAccount(
          connection,
          wallet.publicKey,
          wallet.publicKey,
          anchor.web3.SystemProgram.programId,
          anchor.web3.SYSVAR_RENT_PUBKEY,
          new anchor.web3.PublicKey(NinaClient.ids().mints.usdc)
        )

        if (usdcTokenAccountPubkey) {
          let usdcTokenAccount = await connection.getTokenAccountBalance(
            usdcTokenAccountPubkey
          )
          setUsdcBalance(usdcTokenAccount.value.uiAmount.toFixed(2))
          return
        }
      } catch {
        setUsdcBalance(0)
      }
    } else {
      setUsdcBalance(0)
    }
  }

  const getNpcAmountHeld = async () => {
    const publishingCreditMint = new anchor.web3.PublicKey(
      NinaClient.ids().mints.publishingCredit
    )

    if (wallet?.connected) {
      let npcAccount = await connection.getParsedTokenAccountsByOwner(
        wallet?.publicKey,
        { mint: publishingCreditMint }
      )
      if (npcAccount.value[0]) {
        setNpcAmountHeld(
          npcAccount.value[0].account.data.parsed.info.tokenAmount.uiAmount
        )
      }
    }
    return
  }

  return {
    createCollection,
    createCollectionForSingleRelease,
    addReleaseToCollection,
    removeReleaseFromCollection,
    shouldRemainInCollectionAfterSale,
    getAmountHeld,
    getSolPrice,
    getUsdcBalance,
    getNpcAmountHeld,
  }
}
