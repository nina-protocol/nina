import React, { createContext, useEffect, useState, useContext } from 'react'
import * as anchor from '@project-serum/anchor'
import NinaSdk from '@nina-protocol/js-sdk'
import promiseRetry from 'promise-retry'
import { useWallet } from '@solana/wallet-adapter-react'

import Nina from '../Nina'
import {
  createMintInstructions,
  findOrCreateAssociatedTokenAccount,
  TOKEN_PROGRAM_ID,
} from '../../utils/web3'
import axios from 'axios'
import { ninaErrorHandler } from '../../utils/errors'
import { encryptData, decodeNonEncryptedByteArray } from '../../utils/encrypt'
import releasePurchaseHelper from '../../utils/releasePurchaseHelper'
import { logEvent } from '../../utils/event'
import { initSdkIfNeeded } from '../../utils/sdkInit'
import { getConfirmTransaction } from '../../utils'

const MAX_INT = '18446744073709551615'

const ReleaseContext = createContext()
const ReleaseContextProvider = ({ children }) => {
  const {
    ninaClient,
    addReleaseToCollection,
    collection,
    getUserBalances,
    usdcBalance,
    removeReleaseFromCollection,
    getSolPrice,
    verficationState,
    setVerificationState,
    solBalance,
  } = useContext(Nina.Context)
  const [releasePurchasePending, setReleasePurchasePending] = useState({})
  const [
    releasePurchaseTransactionPending,
    setReleasePurchaseTransactionPending,
  ] = useState({})
  const wallet = useWallet()
  const [pressingState, setPressingState] = useState(defaultPressingState)
  const [redeemableState, setRedeemableState] = useState({})
  const [searchResults, setSearchResults] = useState(searchResultsInitialState)
  const [releaseState, setReleaseState] = useState({
    metadata: {},
    tokenData: {},
    releaseMintMap: {},
    redemptionRecords: {},
    collectedDates: {},
  })
  const [gatesState, setGatesState] = useState({})
  const [releasesRecentState, setReleasesRecentState] = useState({
    published: [],
    highlights: [],
  })
  const [allReleases, setAllReleases] = useState([])
  const [allReleasesCount, setAllReleasesCount] = useState(null)
  const [fetchedUserProfileReleases, setFetchedUserProfileReleases] = useState(
    {}
  )
  const [pendingReleases, setPendingReleases] = useState({})

  const resetSearchResults = () => {
    setSearchResults(searchResultsInitialState)
  }

  const resetPressingState = () => {
    setPressingState(defaultPressingState)
  }

  const {
    releaseInit,
    releasePurchase,
    closeRelease,
    collectRoyaltyForRelease,
    addRoyaltyRecipient,
    getRelease,
    getReleasesPublishedByUser,
    getReleasesCollectedByUser,
    getReleasesRecent,
    getReleasesAll,
    getReleaseRoyaltiesByUser,
    filterReleasesUserCollection,
    getUserCollectionAndPublished,
    filterReleasesPublishedByUser,
    filterReleasesRecent,
    filterReleasesAll,
    filterRoyaltiesByUser,
    filterReleasesList,
    calculateStatsByUser,
    redeemableInitialize,
    redeemableRedeem,
    redeemableUpdateShipping,
    filterSearchResults,
    getCollectorsForRelease,
    releasePurchaseViaHub,
    initializeReleaseAndMint,
    releaseCreateMetadataJson,
    releaseInitViaHub,
    validateUniqueMd5Digest,
    getFeedForUser,
    trackPendingRelease,
    removePendingRelease,
    fetchGatesForRelease,
  } = releaseContextHelper({
    ninaClient,
    releaseState,
    setReleaseState,
    pressingState,
    setPressingState,
    releasePurchasePending,
    setReleasePurchasePending,
    usdcBalance,
    getUserBalances,
    addReleaseToCollection,
    encryptData,
    searchResults,
    setSearchResults,
    collection,
    redeemableState,
    setRedeemableState,
    removeReleaseFromCollection,
    releasesRecentState,
    setReleasesRecentState,
    allReleases,
    setAllReleases,
    setAllReleasesCount,
    getSolPrice,
    releasePurchaseTransactionPending,
    setReleasePurchaseTransactionPending,
    fetchedUserProfileReleases,
    setFetchedUserProfileReleases,
    verficationState,
    setVerificationState,
    pendingReleases,
    setPendingReleases,
    solBalance,
    setGatesState,
    gatesState,
  })

  useEffect(() => {
    initSdkIfNeeded()

    if (wallet.connected) {
      let releaseCreationPending = localStorage.getItem(
        'release_creation_pending'
      )
      if (releaseCreationPending) {
        releaseCreationPending = JSON.parse(releaseCreationPending)
        setPendingReleases(releaseCreationPending)
        Object.keys(releaseCreationPending).forEach((releasePublicKey) => {
          const pendingRelease = releaseCreationPending[releasePublicKey]
          if (pendingRelease.wallet === wallet.publicKey.toBase58()) {
            trackPendingRelease({
              releasePublicKey: new anchor.web3.PublicKey(releasePublicKey),
              artist: pendingRelease.artist,
              title: pendingRelease.title,
              wallet: wallet.publicKey.toBase58(),
              date: pendingRelease.date,
              status: 'pending',
            })
          }
        })
      } else {
        setPendingReleases({})
      }
    }
  }, [wallet.connected])

  return (
    <ReleaseContext.Provider
      value={{
        pressingState,
        resetPressingState,
        releaseInit,
        closeRelease,
        releasePurchase,
        releasePurchasePending,
        releaseState,
        setReleaseState,
        collectRoyaltyForRelease,
        addRoyaltyRecipient,
        getRelease,
        getReleasesPublishedByUser,
        getReleasesCollectedByUser,
        getReleasesRecent,
        getReleasesAll,
        getReleaseRoyaltiesByUser,
        getUserCollectionAndPublished,
        filterReleasesUserCollection,
        filterReleasesPublishedByUser,
        filterRoyaltiesByUser,
        filterReleasesList,
        calculateStatsByUser,
        redeemableInitialize,
        redeemableRedeem,
        searchResults,
        resetSearchResults,
        redeemableUpdateShipping,
        releasesRecentState,
        filterReleasesRecent,
        filterReleasesAll,
        allReleases,
        allReleasesCount,
        filterSearchResults,
        setSearchResults,
        getCollectorsForRelease,
        releasePurchaseViaHub,
        initializeReleaseAndMint,
        releaseCreateMetadataJson,
        releaseInitViaHub,
        releasePurchaseTransactionPending,
        validateUniqueMd5Digest,
        getFeedForUser,
        fetchedUserProfileReleases,
        pendingReleases,
        removePendingRelease,
        fetchGatesForRelease,
        gatesState,
      }}
    >
      {children}
    </ReleaseContext.Provider>
  )
}

const releaseContextHelper = ({
  ninaClient,
  releaseState,
  setReleaseState,
  pressingState,
  setPressingState,
  releasePurchasePending,
  setReleasePurchasePending,
  addReleaseToCollection,
  usdcBalance,
  getUserBalances,
  collection,
  releasesRecentState,
  setReleasesRecentState,
  allReleases,
  setAllReleases,
  setAllReleasesCount,
  releasePurchaseTransactionPending,
  setReleasePurchaseTransactionPending,
  fetchedUserProfileReleases,
  setFetchedUserProfileReleases,
  verificationState,
  setVerificationState,
  setPendingReleases,
  solBalance,
  setGatesState,
  gatesState,
}) => {
  const {
    provider,
    ids,
    nativeToUi,
    uiToNative,
    isSol,
    isUsdc,
    endpoints,
    nativeToUiString,
  } = ninaClient
  const initializeReleaseAndMint = async (hubPubkey) => {
    const program = await ninaClient.useProgram()
    const releaseMint = anchor.web3.Keypair.generate()
    const [release, releaseBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from(anchor.utils.bytes.utf8.encode('nina-release')),
          releaseMint.publicKey.toBuffer(),
        ],
        program.programId
      )
    let hubRelease
    if (hubPubkey) {
      const [_hubRelease] = await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from(anchor.utils.bytes.utf8.encode('nina-hub-release')),
          new anchor.web3.PublicKey(hubPubkey).toBuffer(),
          release.toBuffer(),
        ],
        program.programId
      )
      hubRelease = _hubRelease
    }

    return {
      release,
      releaseBump,
      releaseMint,
      hubRelease,
    }
  }

  const releaseInitViaHub = async ({
    hubPubkey,
    retailPrice,
    amount,
    resalePercentage,
    isUsdc = true,
    metadataUri,
    artist,
    title,
    catalogNumber,
    release,
    releaseBump,
    releaseMint,
    isOpen,
  }) => {
    try {
      const program = await ninaClient.useProgram()
      hubPubkey = new anchor.web3.PublicKey(hubPubkey)
      const hub = await program.account.hub.fetch(hubPubkey)
      const paymentMint = new anchor.web3.PublicKey(
        isUsdc ? ids.mints.usdc : ids.mints.wsol
      )
      const [releaseSigner, releaseSignerBump] =
        await anchor.web3.PublicKey.findProgramAddress(
          [release.toBuffer()],
          program.programId
        )
      const releaseMintIx = await createMintInstructions(
        provider,
        provider.wallet.publicKey,
        releaseMint.publicKey,
        0
      )
      const [authorityTokenAccount, authorityTokenAccountIx] =
        await findOrCreateAssociatedTokenAccount(
          provider.connection,
          provider.wallet.publicKey,
          provider.wallet.publicKey,
          anchor.web3.SystemProgram.programId,
          anchor.web3.SYSVAR_RENT_PUBKEY,
          paymentMint
        )

      const [royaltyTokenAccount, royaltyTokenAccountIx] =
        await findOrCreateAssociatedTokenAccount(
          provider.connection,
          provider.wallet.publicKey,
          releaseSigner,
          anchor.web3.SystemProgram.programId,
          anchor.web3.SYSVAR_RENT_PUBKEY,
          paymentMint,
          true
        )

      const [hubCollaborator] = await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from(anchor.utils.bytes.utf8.encode('nina-hub-collaborator')),
          hubPubkey.toBuffer(),
          provider.wallet.publicKey.toBuffer(),
        ],
        program.programId
      )

      const [hubSigner] = await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from(anchor.utils.bytes.utf8.encode('nina-hub-signer')),
          hubPubkey.toBuffer(),
        ],
        program.programId
      )

      const [hubRelease] = await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from(anchor.utils.bytes.utf8.encode('nina-hub-release')),
          hubPubkey.toBuffer(),
          release.toBuffer(),
        ],
        program.programId
      )

      const [hubContent] = await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from(anchor.utils.bytes.utf8.encode('nina-hub-content')),
          hubPubkey.toBuffer(),
          release.toBuffer(),
        ],
        program.programId
      )

      let [hubWallet] = await findOrCreateAssociatedTokenAccount(
        provider.connection,
        provider.wallet.publicKey,
        hubSigner,
        anchor.web3.SystemProgram.programId,
        anchor.web3.SYSVAR_RENT_PUBKEY,
        paymentMint
      )

      let instructions = [...releaseMintIx, royaltyTokenAccountIx]

      if (authorityTokenAccountIx) {
        instructions.push(authorityTokenAccountIx)
      }

      const editionAmount = isOpen ? MAX_INT : amount
      const config = {
        amountTotalSupply: new anchor.BN(editionAmount),
        amountToArtistTokenAccount: new anchor.BN(0),
        amountToVaultTokenAccount: new anchor.BN(0),
        resalePercentage: new anchor.BN(resalePercentage * 10000),
        price: new anchor.BN(uiToNative(retailPrice, paymentMint)),
        releaseDatetime: new anchor.BN(Date.now() / 1000),
      }
      const bumps = {
        release: releaseBump,
        signer: releaseSignerBump,
      }

      const metadataProgram = new anchor.web3.PublicKey(ids.programs.metaplex)
      const [metadata] = await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from('metadata'),
          metadataProgram.toBuffer(),
          releaseMint.publicKey.toBuffer(),
        ],
        metadataProgram
      )

      const nameBuf = Buffer.from(`${artist} - ${title}`.substring(0, 32))
      const nameBufString = nameBuf.slice(0, 32).toString()

      const symbolBuf = Buffer.from(catalogNumber.substring(0, 10))
      const symbolBufString = symbolBuf.slice(0, 10).toString()

      const metadataData = {
        name: nameBufString,
        symbol: symbolBufString,
        uri: metadataUri,
        sellerFeeBasisPoints: resalePercentage * 100,
      }
      logEvent('release_init_via_hub_initiated', 'engagement', {
        publicKey: release.toBase58(),
        wallet: provider.wallet.publicKey.toBase58(),
      })

      const txid = await program.rpc.releaseInitViaHub(
        config,
        bumps,
        metadataData,
        decodeNonEncryptedByteArray(hub.handle),
        {
          accounts: {
            authority: provider.wallet.publicKey,
            release,
            releaseSigner,
            hubCollaborator,
            hub: hubPubkey,
            hubRelease,
            hubContent,
            hubSigner,
            hubWallet,
            releaseMint: releaseMint.publicKey,
            authorityTokenAccount,
            paymentMint,
            royaltyTokenAccount,
            tokenProgram: new anchor.web3.PublicKey(ids.programs.token),
            metadata,
            metadataProgram,
            systemProgram: anchor.web3.SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          },
          signers: [releaseMint],
          instructions,
        }
      )

      await getConfirmTransaction(txid, provider.connection)
      await NinaSdk.Hub.fetchHubRelease(
        hubPubkey.toBase58(),
        hubRelease.toBase58()
      )

      logEvent('release_init_via_hub_success', 'engagement', {
        publicKey: release.toBase58(),
        wallet: provider.wallet.publicKey.toBase58(),
      })

      return { success: true }
    } catch (error) {
      if (error.toString().includes('unable_to_confirm_transaction')) {
        trackPendingRelease({
          releasePublicKey: release,
          artist,
          title,
          wallet: provider.wallet.publicKey.toBase58(),
          date: new Date(),
        })
      }
      logEvent('release_init_via_hub_failure', 'engagement', {
        publicKey: release.toBase58(),
        wallet: provider.wallet.publicKey.toBase58(),
        solBalance,
      })

      return ninaErrorHandler(error)
    }
  }

  const releasePurchaseViaHub = async (releasePubkey, hubPubkey) => {
    try {
      setReleasePurchaseTransactionPending({
        ...releasePurchaseTransactionPending,
        [releasePubkey]: true,
      })

      logEvent('release_purchase_via_hub_initiated', 'engagement', {
        publicKey: releasePubkey,
        hub: hubPubkey,
        wallet: provider.wallet.publicKey.toBase58(),
      })

      setReleasePurchasePending({
        ...releasePurchasePending,
        [releasePubkey]: true,
      })

      setReleasePurchaseTransactionPending({
        ...releasePurchaseTransactionPending,
        [releasePubkey]: false,
      })

      const txid = await releasePurchaseHelper(
        releasePubkey,
        provider,
        ninaClient,
        usdcBalance,
        hubPubkey
      )

      await getConfirmTransaction(txid, provider.connection)

      setReleasePurchasePending({
        ...releasePurchasePending,
        [releasePubkey]: false,
      })

      getUserBalances()
      await axios.get(
        `${
          process.env.NINA_API_ENDPOINT
        }/accounts/${provider.wallet.publicKey.toBase58()}/collected?txId=${txid}`
      )
      await getRelease(releasePubkey)
      addReleaseToCollection(releasePubkey)

      logEvent('release_purchase_via_hub_success', 'engagement', {
        publicKey: releasePubkey,
        hub: hubPubkey,
        wallet: provider.wallet.publicKey.toBase58(),
      })

      return {
        success: true,
        msg: 'Release purchased!',
      }
    } catch (error) {
      getUserBalances()
      getRelease(releasePubkey)
      setReleasePurchasePending({
        ...releasePurchasePending,
        [releasePubkey]: false,
      })
      setReleasePurchaseTransactionPending({
        ...releasePurchaseTransactionPending,
        [releasePubkey]: false,
      })
      logEvent('release_purchase_via_hub_failure', 'engagement', {
        publicKey: releasePubkey,
        hub: hubPubkey,
        wallet: provider.wallet.publicKey.toBase58(),
        solBalance,
      })
      return ninaErrorHandler(error)
    }
  }

  const releaseInit = async ({
    retailPrice,
    amount,
    resalePercentage,
    artist,
    title,
    catalogNumber,
    metadataUri,
    isUsdc = true,
    release,
    releaseBump,
    releaseMint,
    isOpen,
  }) => {
    setPressingState({
      ...pressingState,
      pending: true,
    })

    try {
      const program = await ninaClient.useProgram()

      const paymentMint = new anchor.web3.PublicKey(
        isUsdc ? ids.mints.usdc : ids.mints.wsol
      )

      const [releaseSigner, releaseSignerBump] =
        await anchor.web3.PublicKey.findProgramAddress(
          [release.toBuffer()],
          program.programId
        )

      setPressingState({
        ...pressingState,
        releasePubkey: release,
      })

      const releaseMintIx = await createMintInstructions(
        provider,
        provider.wallet.publicKey,
        releaseMint.publicKey,
        0
      )

      const [authorityTokenAccount, authorityTokenAccountIx] =
        await findOrCreateAssociatedTokenAccount(
          provider.connection,
          provider.wallet.publicKey,
          provider.wallet.publicKey,
          anchor.web3.SystemProgram.programId,
          anchor.web3.SYSVAR_RENT_PUBKEY,
          paymentMint
        )

      const [royaltyTokenAccount, royaltyTokenAccountIx] =
        await findOrCreateAssociatedTokenAccount(
          provider.connection,
          provider.wallet.publicKey,
          releaseSigner,
          anchor.web3.SystemProgram.programId,
          anchor.web3.SYSVAR_RENT_PUBKEY,
          paymentMint,
          true
        )

      let instructions = [...releaseMintIx, royaltyTokenAccountIx]

      if (authorityTokenAccountIx) {
        instructions.push(authorityTokenAccountIx)
      }

      let now = new Date()
      const editionAmount = isOpen ? MAX_INT : amount
      const config = {
        amountTotalSupply: new anchor.BN(editionAmount),
        amountToArtistTokenAccount: new anchor.BN(0),
        amountToVaultTokenAccount: new anchor.BN(0),
        resalePercentage: new anchor.BN(resalePercentage * 10000),
        price: new anchor.BN(ninaClient.uiToNative(retailPrice, paymentMint)),
        releaseDatetime: new anchor.BN(now.getTime() / 1000),
      }

      const metadataProgram = new anchor.web3.PublicKey(ids.programs.metaplex)
      const [metadata] = await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from('metadata'),
          metadataProgram.toBuffer(),
          releaseMint.publicKey.toBuffer(),
        ],
        metadataProgram
      )

      const nameBuf = Buffer.from(`${artist} - ${title}`.substring(0, 32))
      const nameBufString = nameBuf.slice(0, 32).toString()

      const symbolBuf = Buffer.from(catalogNumber.substring(0, 10))
      const symbolBufString = symbolBuf.slice(0, 10).toString()

      const metadataData = {
        name: nameBufString,
        symbol: symbolBufString,
        uri: metadataUri,
        sellerFeeBasisPoints: resalePercentage * 100,
      }

      const bumps = {
        release: releaseBump,
        signer: releaseSignerBump,
      }

      logEvent('release_init_initiated', 'engagement', {
        publicKey: release.toBase58(),
        wallet: provider.wallet.publicKey.toBase58(),
      })

      const txid = await program.rpc.releaseInit(config, bumps, metadataData, {
        accounts: {
          release,
          releaseSigner,
          releaseMint: releaseMint.publicKey,
          payer: provider.wallet.publicKey,
          authority: provider.wallet.publicKey,
          authorityTokenAccount: authorityTokenAccount,
          paymentMint,
          royaltyTokenAccount,
          metadata,
          metadataProgram,
          systemProgram: anchor.web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        },
        signers: [releaseMint],
        instructions,
      })
      await getConfirmTransaction(txid, provider.connection)
      await getRelease(release)

      setPressingState({
        ...pressingState,
        pending: false,
        completed: true,
      })

      logEvent('release_init_success', 'engagement', {
        publicKey: release.toBase58(),
        wallet: provider.wallet.publicKey.toBase58(),
      })

      return { success: true }
    } catch (error) {
      if (error.toString().includes('unable_to_confirm_transaction')) {
        trackPendingRelease({
          releasePublicKey: release,
          artist,
          title,
          wallet: provider.wallet.publicKey.toBase58(),
          fate: new Date(),
        })
      }

      setPressingState({
        pending: false,
        completed: false,
      })

      logEvent('release_init_failure', 'engagement', {
        publicKey: release.toBase58(),
        wallet: provider.wallet.publicKey.toBase58(),
        solBalance,
      })
      return ninaErrorHandler(error)
    }
  }

  const closeRelease = async (releasePubkey) => {
    const program = await ninaClient.useProgram()
    const release = await program.account.release.fetch(
      new anchor.web3.PublicKey(releasePubkey)
    )
    try {
      const txid = await program.rpc.releaseCloseEdition({
        accounts: {
          authority: provider.wallet.publicKey,
          release: new anchor.web3.PublicKey(releasePubkey),
          releaseSigner: release.releaseSigner,
          releaseMint: release.releaseMint,
        },
      })
      await getConfirmTransaction(txid, provider.connection)
      await getRelease(releasePubkey)

      return {
        success: true,
        msg: 'Release closed',
      }
    } catch (error) {
      return ninaErrorHandler(error)
    }
  }

  const releasePurchase = async (releasePubkey) => {
    logEvent('release_purchase_initiated', 'engagement', {
      publicKey: releasePubkey,
      wallet: provider.wallet.publicKey.toBase58(),
    })

    setReleasePurchaseTransactionPending({
      ...releasePurchaseTransactionPending,
      [releasePubkey]: true,
    })

    setReleasePurchasePending({
      ...releasePurchasePending,
      [releasePubkey]: true,
    })

    try {
      setReleasePurchaseTransactionPending({
        ...releasePurchaseTransactionPending,
        [releasePubkey]: false,
      })
      const txid = await releasePurchaseHelper(
        releasePubkey,
        provider,
        ninaClient,
        usdcBalance
      )

      await getConfirmTransaction(txid, provider.connection)

      await getUserBalances()

      await axios.get(
        `${
          process.env.NINA_API_ENDPOINT
        }/accounts/${provider.wallet.publicKey.toBase58()}/collected?txId=${txid}`
      )
      await getRelease(releasePubkey)
      await addReleaseToCollection(releasePubkey)

      setReleasePurchasePending({
        ...releasePurchasePending,
        [releasePubkey]: false,
      })

      logEvent('release_purchase_success', 'engagement', {
        publicKey: releasePubkey,
        wallet: provider.wallet.publicKey.toBase58(),
      })

      return {
        success: true,
        msg: 'Release purchased!',
      }
    } catch (error) {
      getUserBalances()
      getRelease(releasePubkey)
      setReleasePurchasePending({
        ...releasePurchasePending,
        [releasePubkey]: false,
      })

      setReleasePurchaseTransactionPending({
        ...releasePurchaseTransactionPending,
        [releasePubkey]: false,
      })

      logEvent('release_purchase_failure', 'engagement', {
        publicKey: releasePubkey,
        wallet: provider.wallet.publicKey.toBase58(),
        solBalance,
      })

      return ninaErrorHandler(error)
    }
  }

  const collectRoyaltyForRelease = async (recipient, releasePubkey) => {
    if (!releasePubkey || !recipient) {
      return
    }
    const program = await ninaClient.useProgram()

    try {
      let release = releaseState.tokenData[releasePubkey]
      if (!release) {
        release = await program.account.release.fetch(
          new anchor.web3.PublicKey(releasePubkey)
        )
      }
      release.paymentMint = new anchor.web3.PublicKey(release.paymentMint)

      const [authorityTokenAccount, authorityTokenAccountIx] =
        await findOrCreateAssociatedTokenAccount(
          provider.connection,
          provider.wallet.publicKey,
          provider.wallet.publicKey,
          anchor.web3.SystemProgram.programId,
          anchor.web3.SYSVAR_RENT_PUBKEY,
          release.paymentMint
        )

      const request = {
        accounts: {
          authority: provider.wallet.publicKey,
          authorityTokenAccount,
          release: new anchor.web3.PublicKey(releasePubkey),
          releaseMint: release.releaseMint,
          releaseSigner: release.releaseSigner,
          royaltyTokenAccount: release.royaltyTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        },
      }

      if (authorityTokenAccountIx) {
        request.instructions = [authorityTokenAccountIx]
      }

      const txid = await program.rpc.releaseRevenueShareCollect(request)
      await getConfirmTransaction(txid, provider.connection)

      await getRelease(releasePubkey)
      getUserBalances()
      return {
        success: true,
        msg: `You collected ${nativeToUiString(
          recipient.owed,
          release.paymentMint
        )}`,
      }
    } catch (error) {
      console.warn(error)
      getUserBalances()
      getRelease(releasePubkey)
      return ninaErrorHandler(error)
    }
  }

  const addRoyaltyRecipient = async (release, updateData, releasePubkey) => {
    const program = await ninaClient.useProgram()
    const releasePublicKey = new anchor.web3.PublicKey(releasePubkey)
    try {
      if (!release) {
        release = await program.account.release.fetch(releasePublicKey)
      }

      const recipientPublicKey = new anchor.web3.PublicKey(
        updateData.recipientAddress
      )

      const updateAmount = updateData.percentShare * 10000

      let [newRoyaltyRecipientTokenAccount, newRoyaltyRecipientTokenAccountIx] =
        await findOrCreateAssociatedTokenAccount(
          provider.connection,
          provider.wallet.publicKey,
          recipientPublicKey,
          anchor.web3.SystemProgram.programId,
          anchor.web3.SYSVAR_RENT_PUBKEY,
          new anchor.web3.PublicKey(release.paymentMint)
        )

      let [authorityTokenAccount, authorityTokenAccountIx] =
        await findOrCreateAssociatedTokenAccount(
          provider.connection,
          provider.wallet.publicKey,
          provider.wallet.publicKey,
          anchor.web3.SystemProgram.programId,
          anchor.web3.SYSVAR_RENT_PUBKEY,
          new anchor.web3.PublicKey(release.paymentMint)
        )

      const request = {
        accounts: {
          authority: provider.wallet.publicKey,
          authorityTokenAccount,
          release: releasePublicKey,
          releaseMint: new anchor.web3.PublicKey(release.releaseMint),
          releaseSigner: new anchor.web3.PublicKey(release.releaseSigner),
          royaltyTokenAccount: release.royaltyTokenAccount,
          newRoyaltyRecipient: recipientPublicKey,
          newRoyaltyRecipientTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        },
      }

      if (newRoyaltyRecipientTokenAccountIx) {
        request.instructions = [newRoyaltyRecipientTokenAccountIx]
      }

      if (authorityTokenAccountIx) {
        request.instructions = [authorityTokenAccountIx]
      }

      const txid = await program.rpc.releaseRevenueShareTransfer(
        new anchor.BN(updateAmount),
        request
      )
      await getConfirmTransaction(txid, provider.connection)

      getRelease(releasePubkey)
      getUserBalances()

      return {
        success: true,
        msg: `Revenue share transferred`,
      }
    } catch (error) {
      getRelease(releasePubkey)
      getUserBalances()
      return ninaErrorHandler(error)
    }
  }

  /*
    
  RELEASE PROGRAM LOOKUPS

  */

  const getRelease = async (releasePubkey) => {
    try {
      const { release } = await NinaSdk.Release.fetch(releasePubkey, true)
      const newState = updateStateForReleases([release])
      setReleaseState((prevState) => ({
        ...prevState,
        tokenData: { ...prevState.tokenData, ...newState.tokenData },
        metadata: { ...prevState.metadata, ...newState.metadata },
        releaseMintMap: {
          ...prevState.releaseMintMap,
          ...newState.releaseMintMap,
        },
      }))
    } catch (error) {
      console.warn(error)
    }
  }

  const getReleasesPublishedByUser = async (
    publicKey,
    withAccountData = false
  ) => {
    try {
      const { published } = await NinaSdk.Account.fetchPublished(
        publicKey,
        withAccountData
      )
      const newState = updateStateForReleases(published)
      setReleaseState((prevState) => ({
        ...prevState,
        tokenData: { ...prevState.tokenData, ...newState.tokenData },
        metadata: { ...prevState.metadata, ...newState.metadata },
        releaseMintMap: {
          ...prevState.releaseMintMap,
          ...newState.releaseMintMap,
        },
      }))
    } catch (error) {
      console.warn(error)
    }
  }

  const getReleasesCollectedByUser = async (publicKey) => {
    try {
      const { collected } = await NinaSdk.Account.fetchCollected(publicKey)
      const newState = updateStateForReleases(collected)
      setReleaseState((prevState) => ({
        ...prevState,
        tokenData: { ...prevState.tokenData, ...newState.tokenData },
        metadata: { ...prevState.metadata, ...newState.metadata },
        releaseMintMap: {
          ...prevState.releaseMintMap,
          ...newState.releaseMintMap,
        },
      }))
    } catch (error) {
      console.warn(error)
    }
  }

  const getUserCollectionAndPublished = async (
    publicKey,
    withAccountData = false
  ) => {
    try {
      const { collected } = await NinaSdk.Account.fetchCollected(
        publicKey,
        withAccountData
      )
      const { published } = await NinaSdk.Account.fetchPublished(
        publicKey,
        withAccountData
      )
      const { revenueShares } = await NinaSdk.Account.fetchRevenueShares(
        publicKey,
        withAccountData
      )
      const newState = updateStateForReleases([
        ...published,
        ...revenueShares,
        ...collected,
      ])
      setReleaseState((prevState) => ({
        ...prevState,
        tokenData: { ...prevState.tokenData, ...newState.tokenData },
        metadata: { ...prevState.metadata, ...newState.metadata },
        releaseMintMap: {
          ...prevState.releaseMintMap,
          ...newState.releaseMintMap,
        },
        collectedDates: {
          ...prevState.collectedDates,
          ...newState.collectedDates,
        },
      }))

      const publishedAndRevenueShares = [...published, ...revenueShares].filter(
        (value, index, self) => {
          return (
            self.findIndex((value2) => value2.publicKey === value.publicKey) ===
            index
          )
        }
      )
      setFetchedUserProfileReleases({
        ...fetchedUserProfileReleases,
        [publicKey]: {
          collected: collected.map((release) => release.publicKey),
          published: publishedAndRevenueShares.map(
            (release) => release.publicKey
          ),
        },
      })

      return [collected, publishedAndRevenueShares]
    } catch (error) {
      console.warn(error)
      return [[], []]
    }
  }

  const getReleaseRoyaltiesByUser = async (publicKey) => {
    try {
      const { revenueShares } = await NinaSdk.Account.fetchRevenueShares(
        publicKey,
        true
      )
      const newState = updateStateForReleases(revenueShares)
      setReleaseState((prevState) => ({
        ...prevState,
        tokenData: { ...prevState.tokenData, ...newState.tokenData },
        metadata: { ...prevState.metadata, ...newState.metadata },
        releaseMintMap: {
          ...prevState.releaseMintMap,
          ...newState.releaseMintMap,
        },
      }))
    } catch (error) {
      console.warn(error)
    }
  }

  const updateStateForReleases = (releases) => {
    const updatedReleaseState = {
      tokenData: {},
      metadata: {},
      releaseMintMap: {},
      collectedDates: {},
    }
    releases.forEach((release) => {
      if (release.accountData) {
        updatedReleaseState.tokenData[release.publicKey] = {
          ...release.accountData.release,
        }
      }
      updatedReleaseState.metadata[release.publicKey] = {
        ...release.metadata,
        publishedThroughHub: release.publishedThroughHub || undefined,
      }
      updatedReleaseState.releaseMintMap[release.publicKey] = release.mint
      if (release.collectedDate) {
        updatedReleaseState.collectedDates[release.publicKey] =
          release.collectedDate
      }
    })
    return updatedReleaseState
  }

  const getReleasesRecent = async () => {
    try {
      if (
        !releasesRecentState.highlights ||
        releasesRecentState.highlights.length === 0
      ) {
        await initSdkIfNeeded()
        const highlightsHubPubkey =
          process.env.REACT_APP_CLUSTER === 'devnet'
            ? '4xHeZW8BK8HeCinoDLsGiGwtYsjQ9zBb71m5vdDa5ceS'
            : '4QECgzp8hjknK3pvPEMoXATywcsNnH4MU49tVvDWLgKg'
        const published = (await NinaSdk.Release.fetchAll({ limit: 25 }, true))
          .releases
        let highlights = (
          await NinaSdk.Hub.fetchReleases(highlightsHubPubkey, true)
        ).releases

        const allReleases = [...published, ...highlights]
        setAllReleasesCount(published.total)
        const newState = updateStateForReleases(allReleases)
        setReleaseState((prevState) => ({
          ...prevState,
          tokenData: { ...prevState.tokenData, ...newState.tokenData },
          metadata: { ...prevState.metadata, ...newState.metadata },
          releaseMintMap: {
            ...prevState.releaseMintMap,
            ...newState.releaseMintMap,
          },
        }))

        highlights = highlights.sort(
          (a, b) =>
            b.accountData.release.releaseDatetime -
            a.accountData.release.releaseDatetime
        )
        setReleasesRecentState({
          published: published.map((release) => release.publicKey),
          highlights: highlights.map((release) => release.publicKey),
        })
      }
    } catch (error) {
      console.warn(error)
    }
  }

  const getReleasesAll = async () => {
    try {
      const all = [...allReleases]

      const releases = (
        await NinaSdk.Release.fetchAll(
          { limit: 25, offset: allReleases.length },
          true
        )
      ).releases

      all.push(...releases.map((release) => release.publicKey))

      const newState = updateStateForReleases(releases)

      setReleaseState((prevState) => ({
        ...prevState,
        tokenData: { ...prevState.tokenData, ...newState.tokenData },
        metadata: { ...prevState.metadata, ...newState.metadata },
        releaseMintMap: {
          ...prevState.releaseMintMap,
          ...newState.releaseMintMap,
        },
      }))

      setAllReleasesCount(releases.total)
      setAllReleases(all)
    } catch (error) {
      console.warn(error)
    }
  }

  const getCollectorsForRelease = async (releasePubkey) => {
    const { collectors } = await NinaSdk.Release.fetchCollectors(releasePubkey)
    const updatedVerificationState = { ...verificationState }
    return collectors.map((collector) => {
      if (collector.verifications.length > 0) {
        updatedVerificationState[collector.publicKey] = collector.verifications
      }
      setVerificationState((prevState) => ({
        ...prevState,
        ...updatedVerificationState,
      }))
      return collector.publicKey
    })
  }

  const getFeedForUser = async (publicKey, offset) => {
    try {
      const { data } = await axios.get(
        `${process.env.NINA_API_ENDPOINT}/accounts/${publicKey}/feed?offset=${offset}`
      )
      const releases = []
      const updatedVerificationState = {}

      data.feedItems.forEach((feedItem) => {
        if (feedItem.release) {
          releases.push(feedItem.release)
        }
        if (feedItem.authority.verifications.length > 0) {
          updatedVerificationState[feedItem.authority.publicKey] =
            feedItem.authority.verifications
        }
        if (feedItem.toAccount?.verifications?.length > 0) {
          updatedVerificationState[feedItem.toAccount.publicKey] =
            feedItem.toAccount.verifications
        }
      })
      setVerificationState((prevState) => ({
        ...prevState,
        ...updatedVerificationState,
      }))
      const newState = updateStateForReleases(releases)
      setReleaseState((prevState) => ({
        ...prevState,
        tokenData: { ...prevState.tokenData, ...newState.tokenData },
        metadata: { ...prevState.metadata, ...newState.metadata },
        releaseMintMap: {
          ...prevState.releaseMintMap,
          ...newState.releaseMintMap,
        },
      }))

      return data
    } catch (error) {
      console.warn(error)
    }
  }

  /*

  STATE FILTERS

  */

  const filterReleasesUserCollection = (publicKey = undefined) => {
    if (!publicKey && !provider.wallet?.connected) {
      return []
    }
    let releasePublicKeys
    if (publicKey) {
      releasePublicKeys = fetchedUserProfileReleases[publicKey].collected
    } else {
      releasePublicKeys = Object.keys(collection)
    }
    const releases = []
    releasePublicKeys?.forEach((releasePubkey) => {
      const tokenData = releaseState.tokenData[releasePubkey]
      const metadata = releaseState.metadata[releasePubkey]
      metadata.collectedDate = releaseState.collectedDates[releasePubkey]
      if (metadata) {
        releases.push({ tokenData, metadata, releasePubkey })
      }
    })

    return releases
  }

  const filterReleasesList = (releaseList) => {
    const releases = []
    releaseList?.forEach((releasePubkey) => {
      const tokenData = releaseState.tokenData[releasePubkey]
      const metadata = releaseState.metadata[releasePubkey]
      if (metadata) {
        releases.push({ tokenData, metadata, releasePubkey })
      }
    })
    return releases
  }

  const filterReleasesRecent = () => {
    const releasesPublished = []
    releasesRecentState.published.forEach((releasePubkey) => {
      const tokenData = releaseState.tokenData[releasePubkey]
      const metadata = releaseState.metadata[releasePubkey]
      if (metadata) {
        releasesPublished.push({ tokenData, metadata, releasePubkey })
      }
    })

    const releasesHighlights = []
    releasesRecentState.highlights.forEach((releasePubkey) => {
      const tokenData = releaseState.tokenData[releasePubkey]
      const metadata = releaseState.metadata[releasePubkey]
      if (metadata) {
        releasesHighlights.push({ tokenData, metadata, releasePubkey })
      }
    })
    return {
      published: releasesPublished,
      highlights: releasesHighlights,
    }
  }

  const filterReleasesAll = () => {
    const allReleasesArray = []
    allReleases.forEach((releasePubkey) => {
      const tokenData = releaseState.tokenData[releasePubkey]
      const metadata = releaseState.metadata[releasePubkey]
      if (metadata) {
        allReleasesArray.push({ tokenData, metadata, releasePubkey })
      }
    })
    allReleasesArray.sort(
      (a, b) => a.tokenData.releaseDatetime > b.tokenData.releaseDatetime
    )
    return allReleasesArray
  }

  const filterSearchResults = (releaseIds) => {
    if (!releaseIds) {
      return
    }
    const resultArray = []
    releaseIds.forEach((releasePubkey) => {
      const tokenData = releaseState.tokenData[releasePubkey]
      const metadata = releaseState.metadata[releasePubkey]
      if (metadata) {
        resultArray.push({ tokenData, metadata, releasePubkey })
      }
    })
    resultArray.sort(
      (a, b) => a.tokenData.releaseDatetime > b.tokenData.releaseDatetime
    )
    return resultArray
  }

  const filterReleasesPublishedByUser = (userPubkey = undefined) => {
    // Return results for passed in user if another user isn't specified
    if (!userPubkey) {
      userPubkey = provider.wallet?.publicKey.toBase58()
    }

    const releases = []
    Object.keys(releaseState.tokenData).forEach((releasePubkey) => {
      const tokenData = releaseState.tokenData[releasePubkey]
      const metadata = releaseState.metadata[releasePubkey]

      const releaseData = {}

      if (tokenData.authority === userPubkey && metadata) {
        releaseData.tokenData = tokenData
        releaseData.metadata = metadata
        releaseData.releasePubkey = releasePubkey
      }

      tokenData.revenueShareRecipients.forEach((recipient) => {
        if (recipient.recipientAuthority === userPubkey && metadata) {
          releaseData.recipient = recipient
          releaseData.tokenData = tokenData
          releaseData.metadata = metadata
          releaseData.releasePubkey = releasePubkey
        }
      })

      if (Object.keys(releaseData).length > 0) {
        releases.push(releaseData)
      }
    })

    return releases
  }

  const filterRoyaltiesByUser = (userPubkey = undefined) => {
    if (
      !provider.wallet?.connected ||
      (!userPubkey && !provider.wallet?.publicKey)
    ) {
      return
    }
    // Return results for passed in user if another user isn't specified
    if (!userPubkey) {
      userPubkey = provider.wallet?.publicKey.toBase58()
    }

    const releases = []
    Object.keys(releaseState.tokenData).forEach((releasePubkey) => {
      const tokenData = releaseState.tokenData[releasePubkey]
      const metadata = releaseState.metadata[releasePubkey]
      tokenData.royaltyRecipients.forEach((recipient) => {
        if (recipient.recipientAuthority === userPubkey && metadata) {
          releases.push({ tokenData, metadata, releasePubkey, recipient })
        }
      })
    })
    return releases
  }

  const calculateRoyaltyStatsForUser = (userPubkey = undefined) => {
    let royaltyUncollected = []
    let royaltyOwed = 0
    let royaltyCollected = 0
    let royaltyCount = 0

    filterRoyaltiesByUser(userPubkey).forEach((release) => {
      release.royaltyRecipients.forEach((recipient) => {
        if (recipient.recipientAuthority === userPubkey) {
          royaltyCount += 1
          const owed = recipient.owed
          if (owed > 0) {
            royaltyUncollected.push(release)
            royaltyOwed += nativeToUi(owed, release.paymentMint)
          }
          royaltyCollected += nativeToUi(
            recipient.collected,
            release.paymentMint
          )
        }
      })
    })

    return {
      royaltyCount,
      royaltyUncollected,
      royaltyOwed,
      royaltyCollected,
    }
  }

  const calculateReleaseStatsByUser = (userPubkey = undefined) => {
    if (
      !provider.wallet?.connected ||
      (!userPubkey && !provider.wallet?.publicKey)
    ) {
      return
    }
    // Return results for passed in user if another user isn't specified
    if (!userPubkey) {
      userPubkey = provider.wallet?.publicKey.toBase58()
    }

    const releases = filterReleasesPublishedByUser(userPubkey)

    let salesCount = 0
    let salesAmountUsdc = 0
    let salesAmountSol = 0
    let secondarySalesCount = 0
    let secondarySalesAmountUsdc = 0
    let secondarySalesAmountSol = 0

    releases.forEach((release) => {
      if (isUsdc(release.paymentMint)) {
        salesAmountUsdc += release.saleTotal
        secondarySalesAmountUsdc += release.exchangeSaleTotal
      } else if (isSol(release.paymentMint)) {
        salesAmountSol += release.saleTotal
        secondarySalesAmountSol += release.exchangeSaleTotal
      }
      salesCount += release.saleCounter
      secondarySalesCount += release.exchangeSaleCounter
    })

    return {
      publishedCount: releases.length,
      salesCount,
      salesAmountUsdc: nativeToUi(salesAmountUsdc, ids.mints.usdc),
      salesAmountSol: nativeToUi(salesAmountSol, ids.mints.wsol),
      secondarySalesCount,
      secondarySalesAmountUsdc: nativeToUi(
        secondarySalesAmountUsdc,
        ids.mints.usdc
      ),
      secondarySalesAmountSol: nativeToUi(
        secondarySalesAmountSol,
        ids.mints.wsol
      ),
    }
  }

  const calculateStatsByUser = (userPubkey = undefined) => {
    if (
      !provider.wallet?.connected ||
      (!userPubkey && !provider.wallet?.publicKey)
    ) {
      return
    }
    // Return results for passed in user if another user isn't specified
    if (!userPubkey) {
      userPubkey = provider.wallet?.publicKey.toBase58()
    }

    return {
      ...calculateReleaseStatsByUser(userPubkey),
      ...calculateRoyaltyStatsForUser(userPubkey),
    }
  }

  const fetchGatesForRelease = async (releasePubkey) => {
    const { gates } = (
      await axios.get(
        `${process.env.NINA_GATE_URL}/releases/${releasePubkey}/gates`
      )
    ).data
    if (gates.length > 0) {
      setGatesState((prevState) => ({
        ...prevState,
        [releasePubkey]: gates,
      }))
    } else {
      const prevState = { ...gatesState }
      delete prevState[releasePubkey]
      setGatesState(prevState)
    }

    return gates
  }

  /*

  UTILS

  */

  const releaseCreateMetadataJson = ({
    release,
    artist,
    title,
    sellerFeeBasisPoints,
    catalogNumber,
    description,
    trackTx,
    artworkTx,
    trackType,
    duration,
    md5Digest,
  }) => {
    const name = `${artist} - ${title}`
    let metadata = {
      name,
      symbol: catalogNumber,
      description,
      seller_fee_basis_points: sellerFeeBasisPoints,
      image: `https://www.arweave.net/${artworkTx}`,
      animation_url: `https://www.arweave.net/${trackTx}?ext=mp3`,
      external_url: `https://ninaprotocol.com/${release}`,
      attributes: [],
      collection: {
        name: `${artist} - ${title} (Nina)`,
        family: 'Nina',
      },
      properties: {
        artist: artist,
        title: title,
        date: new Date(),
        md5Digest,
        files: [
          {
            uri: `https://www.arweave.net/${trackTx}`,
            track: 1,
            track_title: title,
            duration: duration,
            type: trackType,
          },
        ],
        category: 'audio',
      },
    }

    return metadata
  }

  const validateUniqueMd5Digest = async (hash) => {
    try {
      if (process.env.SOLANA_CLUSTER === 'devnet') {
        return false
      }
      let path = endpoints.api + `/hash/${hash}`
      const response = await fetch(path)
      const { release } = await response.json()
      if (release) {
        return release
      } else {
        return false
      }
    } catch (error) {
      console.warn(error)
    }
  }

  // Pending Release Helpers

  const trackPendingRelease = async ({
    releasePublicKey,
    artist,
    title,
    wallet,
    date,
  }) => {
    const releasePublicKeyString = releasePublicKey.toBase58()
    await promiseRetry(
      async (retry) => {
        let pendingRelease = await lookupPendingRelease({
          releasePublicKey,
          artist,
          title,
          wallet,
          date,
        })
        if (!pendingRelease.solanaReleaseExists) {
          // If the release has been pending for more than 5 minutes,
          // remove it from pending releases as it is safe to assume
          // it will never be created on Solana
          const pendingFor5Minutes =
            Date.now() - Date.parse(pendingRelease.date) > 50000
          if (pendingFor5Minutes) {
            updatePendingRelease(releasePublicKeyString, 'failed_solana')
            return releasePublicKeyString
          }
          const error = new Error('release_does_not_exist_on_solana')
          error.releasePublicKey = releasePublicKeyString

          retry(error)
          return
        }

        if (!pendingRelease.ninaReleaseExists) {
          const error = new Error('release_does_not_exist_on_nina')
          error.releasePublicKey = releasePublicKeyString
          retry(error)
          return
        }
        updatePendingRelease(releasePublicKeyString, 'success')

        return releasePublicKeyString
      },
      {
        retries: 60,
        minTimeout: 1000,
        maxTimeout: 5000,
      }
    )
  }

  const removePendingRelease = async (releasePublicKey) => {
    let releaseCreationPending = localStorage.getItem(
      'release_creation_pending'
    )

    if (releaseCreationPending) {
      releaseCreationPending = JSON.parse(releaseCreationPending)
      delete releaseCreationPending[releasePublicKey]
      localStorage.setItem(
        'release_creation_pending',
        JSON.stringify(releaseCreationPending)
      )
      logEvent('pending_release_removed', 'engagement', {
        releaseCreationPending,
      })

      setPendingReleases(releaseCreationPending)
    }
  }

  const updatePendingRelease = async (releasePublicKey, status) => {
    let releaseCreationPending = localStorage.getItem(
      'release_creation_pending'
    )

    if (releaseCreationPending) {
      releaseCreationPending = JSON.parse(releaseCreationPending)
      releaseCreationPending[releasePublicKey].status = status
      localStorage.setItem(
        'release_creation_pending',
        JSON.stringify(releaseCreationPending)
      )
      setPendingReleases(releaseCreationPending)
    }
    await getRelease(releasePublicKey)
  }

  const lookupPendingRelease = async ({
    releasePublicKey,
    artist,
    title,
    wallet,
    date,
  }) => {
    await initSdkIfNeeded()
    const solanaAccount = await NinaSdk.client.program.account.release.fetch(
      releasePublicKey,
      'confirmed'
    )
    const releasePublicKeyString = releasePublicKey.toBase58()
    const ninaRelease = await NinaSdk.Release.fetch(releasePublicKeyString)
    let releaseCreationPending = localStorage.getItem(
      'release_creation_pending'
    )
    if (!releaseCreationPending) {
      releaseCreationPending = {}
    } else {
      releaseCreationPending = JSON.parse(releaseCreationPending)
    }

    let pendingRelease = releaseCreationPending[releasePublicKeyString]
    if (pendingRelease) {
      pendingRelease.ninaReleaseExists = ninaRelease.release ? true : false
      pendingRelease.solanaReleaseExists = solanaAccount ? true : false
    } else {
      pendingRelease = {
        artist,
        title,
        ninaReleaseExists: ninaRelease.release ? true : false,
        solanaReleaseExists: solanaAccount ? true : false,
        date,
        wallet,
        status: 'pending',
      }
    }

    const updatedReleaseCreationPending = {
      ...releaseCreationPending,
      [releasePublicKeyString]: pendingRelease,
    }

    setPendingReleases((prevState) => {
      return {
        ...prevState,
        [releasePublicKeyString]: pendingRelease,
      }
    })

    localStorage.setItem(
      'release_creation_pending',
      JSON.stringify(updatedReleaseCreationPending)
    )

    return pendingRelease
  }

  return {
    releaseInitViaHub,
    releasePurchaseViaHub,
    addRoyaltyRecipient,
    releaseInit,
    closeRelease,
    releasePurchase,
    collectRoyaltyForRelease,
    getRelease,
    getReleasesPublishedByUser,
    getReleasesCollectedByUser,
    getReleasesRecent,
    getReleasesAll,
    getReleaseRoyaltiesByUser,
    getUserCollectionAndPublished,
    filterReleasesUserCollection,
    filterReleasesPublishedByUser,
    filterReleasesRecent,
    filterReleasesAll,
    filterReleasesList,
    filterRoyaltiesByUser,
    calculateStatsByUser,
    filterSearchResults,
    getCollectorsForRelease,
    initializeReleaseAndMint,
    releaseCreateMetadataJson,
    validateUniqueMd5Digest,
    getFeedForUser,
    trackPendingRelease,
    removePendingRelease,
    fetchGatesForRelease,
  }
}

const defaultPressingState = {
  releasePubkey: undefined,
  completed: false,
  pending: false,
}

const searchResultsInitialState = {
  releaseIds: [],
  releases: [],
  searched: false,
  pending: false,
  query: null,
}

export default {
  Context: ReleaseContext,
  Provider: ReleaseContextProvider,
}
