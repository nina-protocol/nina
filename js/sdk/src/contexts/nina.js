import React, { createContext, useState, useEffect } from 'react'
import * as anchor from '@project-serum/anchor'
import axios from 'axios'
import {
  findOrCreateAssociatedTokenAccount,
  TOKEN_PROGRAM_ID,
} from '../utils/web3'
import { ninaErrorHandler } from '../utils/errors'

export const NinaContext = createContext()
const NinaContextProvider = ({ children, releasePubkey, ninaClient }) => {
  const [collection, setCollection] = useState({})
  const [postState, setPostState] = useState({})
  const [usdcBalance, setUsdcBalance] = useState(0)
  const [npcAmountHeld, setNpcAmountHeld] = useState(0)
  const [solPrice, setSolPrice] = useState(0)
  const [healthOk, setHealthOk] = useState(true)
  const [healthTimestamp, setHealthTimestamp] = useState(0)
  const [bundlrBalance, setBundlrBalance] = useState(0.0)
  const [bundlr, setBundlr] = useState()
  const [bundlrPricePerMb, setBundlrPricePerMb] = useState()
  const bundlrHttpAddress = 'https://node1.bundlr.network'
  const { provider } = ninaClient

  useEffect(() => {
    if (provider.wallet?.wallet && provider.wallet.publicKey) {
      getNpcAmountHeld()
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
  }, [provider.wallet.wallet, provider.wallet.publicKey])

  let timer = undefined
  const healthCheck = async () => {
    const timeSinceLastCheck = (Date.now() - healthTimestamp) / 1000
    if (timeSinceLastCheck > 30) {
      try {
        setHealthTimestamp(Date.now())
        const performance = await provider.connection._rpcRequest(
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

  const {
    subscriptionSubscribe,
    subscriptionUnsubscribe,
    savePostsToState,
    createCollection,
    createCollectionForSingleRelease,
    addReleaseToCollection,
    removeReleaseFromCollection,
    shouldRemainInCollectionAfterSale,
    getAmountHeld,
    getUsdcBalance,
    getNpcAmountHeld,
    bundlrFund,
    bundlrWithdraw,
    getBundlrBalance,
    getBundlrPricePerMb,
    getSolPrice,
    bundlrUpload,
    initBundlr,
  } = ninaContextHelper({
    ninaClient,
    postState,
    setPostState,
    collection,
    setCollection,
    setUsdcBalance,
    npcAmountHeld,
    setNpcAmountHeld,
    bundlr,
    setBundlr,
    setBundlrBalance,
    setBundlrPricePerMb,
    solPrice,
    setSolPrice,
    bundlrHttpAddress,
  })

  return (
    <NinaContext.Provider
      value={{
        subscriptionSubscribe,
        subscriptionUnsubscribe,
        savePostsToState,
        postState,
        collection,
        createCollection,
        createCollectionForSingleRelease,
        addReleaseToCollection,
        removeReleaseFromCollection,
        shouldRemainInCollectionAfterSale,
        getAmountHeld,
        getUsdcBalance,
        usdcBalance,
        getNpcAmountHeld,
        npcAmountHeld,
        healthOk,
        ninaClient,
        bundlrFund,
        bundlrWithdraw,
        getBundlrBalance,
        bundlrBalance,
        getBundlrPricePerMb,
        bundlrPricePerMb,
        solPrice,
        getSolPrice,
        bundlrUpload,
        initBundlr,
        savePostsToState,
        bundlr,
      }}
    >
      {children}
    </NinaContext.Provider>
  )
}
export default NinaContextProvider

const ninaContextHelper = ({
  ninaClient,
  postState,
  setPostState,
  collection,
  setCollection,
  setUsdcBalance,
  setNpcAmountHeld,
  bundlr,
  setBundlr,
  setBundlrBalance,
  setBundlrPricePerMb,
  setSolPrice,
  bundlrHttpAddress,
}) => {
  const { provider, ids, uiToNative, nativeToUi } = ninaClient

  const subscriptionSubscribe = async (subscribeToAccount, isHub) => {
    try {
      const program = await ninaClient.useProgram()
      subscribeToAccount = new anchor.web3.publicKey(subscribeToAccount)
      const [subscription] = await anchor.web3.PublicKey.findProgramAddress(
        Buffer.from(anchor.utils.bytes.utf8.encode('nina-subscription')),
        provider.wallet.publicKey.toBuffer(),
        subscribeToAccount.toBuffer(),
        program.programId
      )

      const request = {
        accounts: {
          from: provider.wallet.publicKey,
          subscription,
          to: subscribeToAccount,
        },
      }

      let txid
      if (isHub) {
        txid = await program.rpc.subscriptionSubscribeHub(request)
      } else {
        txid = await program.rpc.subscriptionSubscribeAccount(request)
      }

      await provider.connection.getParsedConfirmedTransaction(txid, 'confirmed')
      return {
        success: true,
        msg: 'Now Following Account',
      }
    } catch (error) {
      console.warn(error)
      return ninaErrorHandler(error)
    }
  }

  const subscriptionUnsubscribe = async (unsubscribeAccount) => {
    try {
      const program = await ninaClient.useProgram()
      unsubscribeAccount = new anchor.web3.publicKey(unsubscribeAccount)
      const [subscription] = await anchor.web3.PublicKey.findProgramAddress(
        Buffer.from(anchor.utils.bytes.utf8.encode('nina-subscription')),
        provider.wallet.publicKey.toBuffer(),
        unsubscribeAccount.toBuffer(),
        program.programId
      )

      const txid = await program.rpc.subscriptionUnsubscribe({
        accounts: {
          from: provider.wallet.publicKey,
          subscription,
          to: unsubscribeAccount,
        },
      })
      await provider.connection.getParsedConfirmedTransaction(txid, 'confirmed')
      return {
        success: true,
        msg: 'Account Unfollowed',
      }
    } catch (error) {
      console.warn(error)
      return ninaErrorHandler(error)
    }
  }

  const savePostsToState = async (posts) => {
    let updatedState = { ...postState }
    posts.forEach((post) => {
      updatedState = {
        ...updatedState,
        [post.id]: {
          ...post,
          publicKey: post.id,
          createdAt: new Date(post.createdAt),
        },
      }
    })
    setPostState(updatedState)
  }

  // Collection

  const createCollection = async () => {
    if (provider.wallet?.connected) {
      try {
        const program = await ninaClient.useProgram()
        const updatedCollection = {}
        let tokenAccounts =
          await provider.connection.getParsedTokenAccountsByOwner(
            provider.wallet.publicKey,
            { programId: TOKEN_PROGRAM_ID }
          )
        const walletTokenAccounts = tokenAccounts.value.map(
          (value) => value.account.data.parsed.info
        )

        const releaseAmountMap = {}
        for await (let account of walletTokenAccounts) {
          const mint = new anchor.web3.PublicKey(account.mint)
          const balance = account.tokenAmount.uiAmount

          if (account.mint === ids.mints.usdc) {
            setUsdcBalance(balance.toFixed(2))
          } else if (balance > 0 && balance % 1 === 0) {
            const [release] = await anchor.web3.PublicKey.findProgramAddress(
              [
                Buffer.from(anchor.utils.bytes.utf8.encode('nina-release')),
                mint.toBuffer(),
              ],
              program.programId
            )

            releaseAmountMap[release.toBase58()] = account.tokenAmount.uiAmount
          }
        }

        let releaseAccounts = await anchor.utils.rpc.getMultipleAccounts(
          provider.connection,
          Object.keys(releaseAmountMap).map((r) => new anchor.web3.PublicKey(r))
        )
        releaseAccounts = releaseAccounts.filter((item) => item != null)
        releaseAccounts.map((releaseAccount) => {
          const releasePublicKey = releaseAccount.publicKey.toBase58()
          // Don't include soft lp + cafe katja test releases
          if (
            releasePublicKey !==
              'BpZ5zoBehKfKUL2eSFd3SNLXmXHi4vtuV4U6WxJB3qvt' &&
            releasePublicKey !== 'FNZbs4pdxKiaCNPVgMiPQrpzSJzyfGrocxejs8uBWnf'
          ) {
            updatedCollection[releasePublicKey] =
              releaseAmountMap[releasePublicKey]
          }
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
    if (provider.wallet?.connected) {
      try {
        const updatedCollection = {}
        const program = await ninaClient.useProgram()
        const release = await program.account.release.fetch(
          new anchor.web3.PublicKey(releasePubkey)
        )

        let tokenAccounts =
          await provider.connection.getParsedTokenAccountsByOwner(
            provider.wallet.publicKey,
            { programId: TOKEN_PROGRAM_ID }
          )
        const walletTokenAccounts = tokenAccounts.value.map(
          (value) => value.account.data.parsed.info
        )

        for await (let account of walletTokenAccounts) {
          const balance = account.tokenAmount.uiAmount

          if (account.mint === ids.mints.usdc) {
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
    let tokenAccounts = await provider.connection.getParsedTokenAccountsByOwner(
      provider.wallet?.publicKey,
      { programId: TOKEN_PROGRAM_ID }
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
    if (provider.wallet?.connected) {
      let tokenAccounts =
        await provider.connection.getParsedTokenAccountsByOwner(
          provider.wallet?.publicKey,
          { programId: TOKEN_PROGRAM_ID }
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

  const getUsdcBalance = async () => {
    if (provider.wallet?.connected && provider.wallet?.publicKey) {
      try {
        let [usdcTokenAccountPubkey] = await findOrCreateAssociatedTokenAccount(
          provider.connection,
          provider.wallet.publicKey,
          provider.wallet.publicKey,
          anchor.web3.SystemProgram.programId,
          anchor.web3.SYSVAR_RENT_PUBKEY,
          new anchor.web3.PublicKey(ids.mints.usdc)
        )

        if (usdcTokenAccountPubkey) {
          let usdcTokenAccount =
            await provider.connection.getTokenAccountBalance(
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
      ids.mints.publishingCredit
    )

    if (provider.wallet?.connected) {
      let npcAccount = await provider.connection.getParsedTokenAccountsByOwner(
        provider.wallet?.publicKey,
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

  const bundlrFund = async (fundAmount) => {
    try {
      if (bundlr && fundAmount) {
        const value = uiToNative(fundAmount, ids.mints.wsol)
        if (!value) return
        await bundlr.fund(value)
        await getBundlrBalance()
        return {
          success: true,
          msg: `${fundAmount} Sol successfully deposited`,
        }
      }
    } catch (error) {
      console.warn('Bundlr fund error: ', error)
      return ninaErrorHandler(error)
    }
  }

  const bundlrWithdraw = async (withdrawAmount) => {
    try {
      if (bundlr && withdrawAmount) {
        const value = uiToNative(withdrawAmount, ids.mints.wsol)
        if (!value) return
        await bundlr.withdrawBalance(value)
        await getBundlrBalance()
        return {
          success: true,
          msg: `${withdrawAmount} Sol successfully withdrawn`,
        }
      }
    } catch (error) {
      console.warn('Bundlr withdraw error: ', error)
      return ninaErrorHandler(error)
    }
  }

  const getBundlrBalance = async (bundlrInstance) => {
    try {
      if (!bundlrInstance) {
        bundlrInstance = bundlr
      }
      const bundlrBalanceRequest = await bundlrInstance.getLoadedBalance()
      setBundlrBalance(nativeToUi(bundlrBalanceRequest, ids.mints.wsol))
    } catch (error) {
      console.warn('Unable to get Bundlr Balance: ', error)
    }
  }

  const getBundlrPricePerMb = async (bundlrInstance) => {
    try {
      if (!bundlrInstance) {
        bundlrInstance = bundlr
      }
      const price = await bundlrInstance.getPrice(1000000)
      setBundlrPricePerMb(nativeToUi(price, ids.mints.wsol))
    } catch (error) {
      return ninaErrorHandler(error)
    }
  }

  const getSolPrice = async () => {
    try {
      const priceResult = await axios.get(
        `https://price.jup.ag/v1/price?id=SOL&vsAmount=${ninaClient.nativeToUi(release.price.toNumber(), ids.mints.usdc)}`
      )
      setSolPrice(priceResult.data.data.price)
    } catch (error) {
      return ninaErrorHandler(error)
    }
  }

  const bundlrUpload = async (file) => {
    try {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = async () => {
          const data = reader.result
          let res
          try {
            res = await bundlr.uploader.upload(data, [
              { name: 'Content-Type', value: file.type },
            ])
          } catch (error) {
            ninaErrorHandler(error)
          }
          getBundlrBalance()
          resolve(res)
        }
        reader.onerror = (error) => {
          reject(error)
        }
        reader.readAsArrayBuffer(file)
      })
    } catch (error) {
      return ninaErrorHandler(error)
    }
  }

  const initBundlr = async () => {
    try {
      import('@bundlr-network/client/build/web').then(async (module) => {
        const bundlrInstance = new module.WebBundlr(
          bundlrHttpAddress,
          'solana',
          provider.wallet.wallet.adapter,
          { timeout: 1000000000000000 }
        )
        await bundlrInstance.ready()
        setBundlr(bundlrInstance)
        getBundlrBalance(bundlrInstance)
        getBundlrPricePerMb(bundlrInstance)
      })
    } catch (error) {
      console.warn('bundlr error: ', error)
      return
    }
  }

  return {
    subscriptionSubscribe,
    subscriptionUnsubscribe,
    createCollection,
    createCollectionForSingleRelease,
    addReleaseToCollection,
    removeReleaseFromCollection,
    shouldRemainInCollectionAfterSale,
    getAmountHeld,
    getUsdcBalance,
    getNpcAmountHeld,
    bundlrFund,
    bundlrWithdraw,
    getBundlrBalance,
    getBundlrPricePerMb,
    getSolPrice,
    bundlrUpload,
    initBundlr,
    savePostsToState,
  }
}
