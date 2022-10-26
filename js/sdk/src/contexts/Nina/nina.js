import React, { createContext, useState, useEffect, useMemo } from 'react'
import * as anchor from '@project-serum/anchor'
import NinaSdk from '@nina-protocol/js-sdk';
import axios from 'axios'
import {
  findOrCreateAssociatedTokenAccount,
  TOKEN_PROGRAM_ID,
} from '../../utils/web3'
import { ninaErrorHandler } from '../../utils/errors'
import {clone} from 'lodash';

const NinaProgramAction = {
  HUB_ADD_COLLABORATOR: 'HUB_ADD_COLLABORATOR',
  HUB_ADD_RELEASE: 'HUB_ADD_RELEASE',
  HUB_INIT_WITH_CREDIT: 'HUB_INIT_WITH_CREDIT',
  POST_INIT_VIA_HUB_WITH_REFERENCE_RELEASE: 'POST_INIT_VIA_HUB_WITH_REFERENCE_RELEASE',
  POST_INIT_VIA_HUB: 'POST_INIT_VIA_HUB',
  RELEASE_INIT_VIA_HUB: 'RELEASE_INIT_VIA_HUB',
  RELEASE_INIT_WITH_CREDIT: 'RELEASE_INIT_WITH_CREDIT',
  RELEASE_PURCHASE: 'RELEASE_PURCHASE',
  RELEASE_PURCHASE_VIA_HUB: 'RELEASE_PURCHASE_VIA_HUB',
  EXCHANGE_INIT : 'EXCHANGE_INIT',
  EXCHANGE_ACCEPT: 'EXCHANGE_ACCEPT',
}

const NinaProgramActionCost = {
  HUB_ADD_COLLABORATOR: 0.001919,
  HUB_ADD_RELEASE: 0.00368684,
  HUB_INIT_WITH_CREDIT: 0.00923396,
  POST_INIT_VIA_HUB_WITH_REFERENCE_RELEASE: 0.01140548,
  POST_INIT_VIA_HUB: 0.00772364,
  RELEASE_INIT_VIA_HUB: 0.02212192,
  RELEASE_INIT_WITH_CREDIT: 0.02047936,
  RELEASE_PURCHASE: 0.00204428,
  RELEASE_PURCHASE_VIA_HUB: 0.00204428,
  EXCHANGE_INIT: 0.0051256,
  EXCHANGE_ACCEPT: 0.00377536,
}

const NinaContext = createContext()
const NinaContextProvider = ({ children, releasePubkey, ninaClient }) => {
  const [collection, setCollection] = useState({})
  const [postState, setPostState] = useState({})
  const [subscriptionState, setSubscriptionState] = useState({})
  const [usdcBalance, setUsdcBalance] = useState(0)
  const [solBalance, setSolBalance] = useState(0)
  const [solUsdcBalance, setSolUsdcBalance] = useState(0)
  const [npcAmountHeld, setNpcAmountHeld] = useState(0)
  const [solPrice, setSolPrice] = useState(0)
  const [healthOk, setHealthOk] = useState(true)
  const [healthTimestamp, setHealthTimestamp] = useState(0)
  const [bundlrBalance, setBundlrBalance] = useState(0.0)
  const [bundlr, setBundlr] = useState()
  const [bundlrPricePerMb, setBundlrPricePerMb] = useState()
  const [fetchedHubs, setFetchedHubs] = useState(new Set())
  const [fetchedProfiles, setFetchedProfiles] = useState(new Set())
  const bundlrHttpAddress = 'https://node1.bundlr.network'
  const { provider } = ninaClient

  useEffect(() => {
    if (provider.wallet?.wallet && provider.wallet.publicKey) {
      getNpcAmountHeld()
      getUsdcBalance()
      if (releasePubkey) {
        createCollectionForSingleRelease(releasePubkey)
      } else {
        createCollection()
      }
    } else {
      setCollection({})
      setUsdcBalance(0)
      setNpcAmountHeld(0)
      setBundlrBalance(0.0)
    }

    return () => {
      setCollection({})
      setUsdcBalance(0)
      setNpcAmountHeld(0)
      setBundlrBalance(0.0)
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
    checkIfHasBalanceToCompleteAction,
    getSubscriptionsForUser,
    filterSubscriptionsForUser,
    getSubscriptionsForHub
  } = ninaContextHelper({
    ninaClient,
    postState,
    setPostState,
    subscriptionState,
    setSubscriptionState,
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
    setSolUsdcBalance,
    solBalance,
    setSolBalance,
  })

  const userSubscriptions = useMemo(() => {
    if (provider.wallet?.wallet && provider.wallet.publicKey) {
      return filterSubscriptionsForUser(provider.wallet.publicKey.toBase58())
    }
   return undefined;
  }, [subscriptionState, provider.wallet?.wallet, provider.wallet.publicKey]); 
  

  return (
    <NinaContext.Provider
      value={{
        subscriptionSubscribe,
        subscriptionUnsubscribe,
        savePostsToState,
        postState,
        setPostState,
        collection,
        subscriptionState,
        setSubscriptionState,
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
        bundlr,
        solUsdcBalance,
        solBalance,
        NinaProgramAction,
        NinaProgramActionCost,
        checkIfHasBalanceToCompleteAction,
        fetchedHubs,
        setFetchedHubs,
        fetchedProfiles,
        setFetchedProfiles,
        getSubscriptionsForUser,
        filterSubscriptionsForUser,
        userSubscriptions,
        getSubscriptionsForHub,
      }}
    >
      {children}
    </NinaContext.Provider>
  )
}

const ninaContextHelper = ({
  ninaClient,
  postState,
  setPostState,
  collection,
  subscriptionState,
  setSubscriptionState,
  setCollection,
  setUsdcBalance,
  setNpcAmountHeld,
  bundlr,
  setBundlr,
  setBundlrBalance,
  setBundlrPricePerMb,
  setSolPrice,
  bundlrHttpAddress,
  setSolUsdcBalance,
  solBalance,
  setSolBalance,
}) => {
  const { provider, ids, uiToNative, nativeToUi } = ninaClient

  //Subscrition

  const subscriptionSubscribe = async (subscribeToAccount, hubHandle) => {
    try {
      const program = await ninaClient.useProgram()      
      subscribeToAccount = new anchor.web3.PublicKey(subscribeToAccount)
      const [subscription] = await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from(anchor.utils.bytes.utf8.encode('nina-subscription')),
          provider.wallet.publicKey.toBuffer(),
          subscribeToAccount.toBuffer()
        ],
        program.programId
      )

      const request = {
        accounts: {
          from: provider.wallet.publicKey,
          subscription,
          to: subscribeToAccount,
          systemProgram: anchor.web3.SystemProgram.programId,
        },
      }

      let txid
      if (hubHandle) {
        txid = await program.rpc.subscriptionSubscribeHub(hubHandle, request)
      } else {
        txid = await program.rpc.subscriptionSubscribeAccount(request)
      }

      await provider.connection.getParsedConfirmedTransaction(txid, 'confirmed')
      await getSubscription(subscription.toBase58())

      return {
        success: true,
        msg: 'Now Following',
      }
    } catch (error) {
      console.warn(error)
      return ninaErrorHandler(error)
    }
  }

  const subscriptionUnsubscribe = async (unsubscribeAccount) => {
    try {
      const program = await ninaClient.useProgram()
      unsubscribeAccount = new anchor.web3.PublicKey(unsubscribeAccount)
      const [subscription] = await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from(anchor.utils.bytes.utf8.encode('nina-subscription')),
          provider.wallet.publicKey.toBuffer(),
          unsubscribeAccount.toBuffer()
      ],
        program.programId
      )

      const txid = await program.rpc.subscriptionUnsubscribe({
        accounts: {
          from: provider.wallet.publicKey,
          subscription,  
          to: unsubscribeAccount,
          systemProgram: anchor.web3.SystemProgram.programId,
        },
      })

      await provider.connection.getParsedConfirmedTransaction(txid, 'confirmed')
      await getSubscription(subscription.toBase58(), txid)
      await getSubscriptionsForUser(provider.wallet.publicKey.toBase58())
      removeSubScriptionFromState(subscription.toBase58())

      return {
        success: true,
        msg: 'Successfully Unfollowed',
      }
    } catch (error) {
      console.warn(error)
      return ninaErrorHandler(error)
    }
  }

  //Posts

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

  const saveSubscriptionsToState = async (subscriptions) => {
    let updatedState = { ...subscriptionState }
    subscriptions.forEach((subscription) => {
      updatedState = {
        ...updatedState,
        [subscription.publicKey]: subscription
      }
    })
    setSubscriptionState(updatedState)
  }

  const removeSubScriptionFromState = (publicKey) => {
    let updatedState = { ...subscriptionState }
    delete updatedState[publicKey]
    setSubscriptionState(updatedState)
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

          if (account.mint !== ids.mints.usdc && balance > 0 && balance % 1 === 0) {
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

          if (account.mint === release.releaseMint.toBase58()) {
            updatedCollection[releasePubkey] = balance
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
        const solPrice =  await axios.get(
          `https://price.jup.ag/v1/price?id=SOL`
        )
        let solUsdcBalanceResult = await provider.connection.getBalance(
          provider.wallet.publicKey
        )
        setSolUsdcBalance((ninaClient.nativeToUi(solUsdcBalanceResult, ids.mints.wsol) * solPrice.data.data.price).toFixed(2))
        setSolBalance(solUsdcBalanceResult)
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
        } else {
          setUsdcBalance(0)
        }
      } catch {
        console.warn('error getting usdc balance')
      }
    } else {
      setUsdcBalance(0)
      setSolUsdcBalance(0)
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
        await getUsdcBalance()
        const value = uiToNative(fundAmount, ids.mints.wsol)
        if (value - (2 * NinaProgramActionCost[NinaProgramAction.RELEASE_INIT_VIA_HUB]) > solBalance) {
          throw('Insufficient SOL balance - please deposit a smaller amount or top up your Solana balance')
        }
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
        `https://price.jup.ag/v1/price?id=SOL`
      )
      setSolPrice(priceResult.data.data.price)
      return priceResult.data.data.price
    } catch (error) {
      return ninaErrorHandler(error)
    }
  }

  const bundlrUpload = async (file) => {
    try {
      return new Promise((resolve, reject) => {
        const uploader = bundlr.uploader.chunkedUploader;
        uploader.on("chunkUpload", (chunkInfo) => {
          console.log(`Uploaded Chunk number ${chunkInfo.id}, offset of ${chunkInfo.offset}, size ${chunkInfo.size} Bytes, with a total of ${chunkInfo.totalUploaded} bytes uploaded.`);
        });
        uploader.on("chunkError", (e) => {
          console.error(`Error uploading chunk number ${e.id} - ${e.res.statusText}`);
        });
        uploader.on("done", (finishRes) => {
          console.log(`Upload completed with ID ${JSON.stringify(finishRes)}`);
        });   
        const reader = new FileReader()
        reader.onload = async () => {
          const data = reader.result
          let txId
          try {
            const tx = bundlr.createTransaction(data, {
              tags: [{ name: 'Content-Type', value: file.type }]
            })
            await tx.sign();
            txId = (await uploader.uploadTransaction(tx)).data.id
          } catch (error) {
            ninaErrorHandler(error)
          }
          getBundlrBalance()
          resolve(txId)
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

  const checkIfHasBalanceToCompleteAction = (action) => {
    if (ninaClient.uiToNative(NinaProgramActionCost[action], ninaClient.ids.mints.wsol) > solBalance) {
      const error = new Error(`You do not have enough SOL to send the transaction: ${action}.  You need at least ${NinaProgramActionCost[action]} SOL.`)
      return ninaErrorHandler(error)
    }
    return undefined
  }


  /*

  STATE

  */

  const getSubscription = async (subscriptionPubkey, txid=undefined) => {
      try {
      const {subscription} = await NinaSdk.Subscription.fetch(subscriptionPubkey, false, txid)
      setSubscriptionState({
        ...subscriptionState,
        [subscription.publicKey]: subscription,
      })
    } catch (error) {
      console.warn(error)
    }
  }

  const getSubscriptionsForUser = async (accountPubkey) => {
    try{
      const { subscriptions } = await NinaSdk.Account.fetchSubscriptions(accountPubkey, false)
      saveSubscriptionsToState(subscriptions)
      return subscriptions
    } catch (error) {
      console.warn(error)
      return []
    }
  }

  const getSubscriptionsForHub = async (hubPubkeyOrHandle) => {
    try{
      const { subscriptions } = await NinaSdk.Hub.fetchSubscriptions(hubPubkeyOrHandle, false)
      saveSubscriptionsToState(subscriptions)
      return subscriptions
    } catch (error) {
      console.warn(error)
      return []
    }
  }

  const filterSubscriptionsForUser = (accountPubkey) => {
    const subscriptions = []
    Object.values(subscriptionState).forEach((subscription) => {
      if (subscription.from === accountPubkey || subscription.to === accountPubkey) {
        subscriptions.push(subscription)
      }
    })
    return subscriptions
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
    checkIfHasBalanceToCompleteAction,
    getSubscriptionsForUser,
    filterSubscriptionsForUser,
    getSubscriptionsForHub,
  }
}

export default {
  Context: NinaContext,
  Provider: NinaContextProvider
}