import React, { createContext, useState, useContext } from 'react'
import * as anchor from '@project-serum/anchor'
import NinaSdk from '@nina-protocol/js-sdk';
import _ from 'lodash'
import Nina from '../Nina'
import {
  createMintInstructions,
  findOrCreateAssociatedTokenAccount,
  wrapSol,
  TOKEN_PROGRAM_ID,
} from '../../utils/web3'
import axios from 'axios'
import { ninaErrorHandler } from '../../utils/errors'
import {
  encryptData,
  exportPublicKey,
  decodeNonEncryptedByteArray,
  decryptData,
} from '../../utils/encrypt'
import { logEvent } from '../../utils/event'
import { publicKey } from '@project-serum/anchor/dist/cjs/utils';
import { initSdkIfNeeded } from '../../utils/sdkInit';
const lookupTypes = {
  PUBLISHED_BY: 'published_by',
  REVENUE_SHARE: 'revenue_share',
}
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
  } = useContext(Nina.Context)
  const [releasePurchasePending, setReleasePurchasePending] = useState({})
  const [releasePurchaseTransactionPending, setReleasePurchaseTransactionPending] = useState({})
  const [pressingState, setPressingState] = useState(defaultPressingState)
  const [redeemableState, setRedeemableState] = useState({})
  const [searchResults, setSearchResults] = useState(searchResultsInitialState)
  const [releaseState, setReleaseState] = useState({
    metadata: {},
    tokenData: {},
    releaseMintMap: {},
    redemptionRecords: {},
  })
  const [releasesRecentState, setReleasesRecentState] = useState({
    published: [],
    highlights: [],
  })
  const [allReleases, setAllReleases] = useState([])
  const [allReleasesCount, setAllReleasesCount] = useState(null)
  const [fetchedUserProfileReleases, setFetchedUserProfileReleases] = useState({})
  const resetSearchResults = () => {
    setSearchResults(searchResultsInitialState)
  }

  const resetPressingState = () => {
    setPressingState(defaultPressingState)
  }

  const {
    releaseCreate,
    releasePurchase,
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
    getFeedForUser
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
  }) 

  return (
    <ReleaseContext.Provider
      value={{
        pressingState,
        resetPressingState,
        releaseCreate,
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
  encryptData,
  collection,
  redeemableState,
  setRedeemableState,
  removeReleaseFromCollection,
  releasesRecentState,
  setReleasesRecentState,
  allReleases,
  setAllReleases,
  setAllReleasesCount,
  setSearchResults,
  getSolPrice,
  releasePurchaseTransactionPending,
  setReleasePurchaseTransactionPending,
  fetchedUserProfileReleases,
  setFetchedUserProfileReleases,
  verificationState,
  setVerificationState
}) => {
  const { provider, ids, nativeToUi, uiToNative, isSol, isUsdc, endpoints } =
    ninaClient
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
      [hubRelease] = await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from(anchor.utils.bytes.utf8.encode('nina-hub-release')),
          new anchor.web3.PublicKey(hubPubkey).toBuffer(),
          release.toBuffer(),
        ],
        program.programId
      )
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

      const config = {
        amountTotalSupply: new anchor.BN(amount),
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

      const nameBuf = Buffer.from((`${artist} - ${title}`).substring(0,32));
      const nameBufString =  nameBuf.slice(0, 32).toString();

      const symbolBuf = Buffer.from(catalogNumber.substring(0,10));
      const symbolBufString =  symbolBuf.slice(0, 10).toString();

      const metadataData = {
        name: nameBufString,
        symbol: symbolBufString,
        uri: metadataUri,
        sellerFeeBasisPoints: resalePercentage * 100,
      }
      logEvent(
        'release_init_via_hub_initiated',
        'engagement', {
          publicKey: release.toBase58(),
          wallet: provider.wallet.publicKey.toBase58(),
        }
      )

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
      await provider.connection.getParsedTransaction(txid, 'confirmed')
      await NinaSdk.Hub.fetchHubRelease(hubPubkey.toBase58(), hubRelease.toBase58())

      logEvent(
        'release_init_via_hub_success',
        'engagement', {
          publicKey: release.toBase58(),
          wallet: provider.wallet.publicKey.toBase58(),
        }
      )

      return { success: true }
    } catch (error) {
      logEvent(
        'release_init_via_hub_failure',
        'engagement', {
          publicKey: release.toBase58(),
          wallet: provider.wallet.publicKey.toBase58(),
        }
      )

      return ninaErrorHandler(error)
    }
  }

  const releasePurchaseViaHub = async (releasePubkey, hubPubkey) => {
    try {
      setReleasePurchaseTransactionPending({
        ...releasePurchaseTransactionPending,
        [releasePubkey]: true,
      })
      
      logEvent(
        'release_purchase_via_hub_initiated',
        'engagement', {
          publicKey: releasePubkey,
          hub: hubPubkey,
          wallet: provider.wallet.publicKey.toBase58(),
        }
      )

      const program = await ninaClient.useProgram()
      releasePubkey = new anchor.web3.PublicKey(releasePubkey)
      hubPubkey = new anchor.web3.PublicKey(hubPubkey)
      const release = await program.account.release.fetch(releasePubkey)

      setReleasePurchasePending({
        ...releasePurchasePending,
        [releasePubkey.toBase58()]: true,
      })

      let [payerTokenAccount] = await findOrCreateAssociatedTokenAccount(
        provider.connection,
        provider.wallet.publicKey,
        provider.wallet.publicKey,
        anchor.web3.SystemProgram.programId,
        anchor.web3.SYSVAR_RENT_PUBKEY,
        release.paymentMint
      )

      let [receiverReleaseTokenAccount, receiverReleaseTokenAccountIx] =
        await findOrCreateAssociatedTokenAccount(
          provider.connection,
          provider.wallet.publicKey,
          provider.wallet.publicKey,
          anchor.web3.SystemProgram.programId,
          anchor.web3.SYSVAR_RENT_PUBKEY,
          release.releaseMint
        )

      const hub = await program.account.hub.fetch(hubPubkey)
      const [hubRelease] = await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from(anchor.utils.bytes.utf8.encode('nina-hub-release')),
          hubPubkey.toBuffer(),
          releasePubkey.toBuffer(),
        ],
        program.programId
      )
      const [hubContent] = await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from(anchor.utils.bytes.utf8.encode('nina-hub-content')),
          hubPubkey.toBuffer(),
          releasePubkey.toBuffer(),
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

      let [hubWallet] = await findOrCreateAssociatedTokenAccount(
        provider.connection,
        provider.wallet.publicKey,
        hubSigner,
        anchor.web3.SystemProgram.programId,
        anchor.web3.SYSVAR_RENT_PUBKEY,
        release.paymentMint
      )
      const request = {
        accounts: {
          payer: provider.wallet.publicKey,
          receiver: provider.wallet.publicKey,
          release: releasePubkey,
          releaseSigner: release.releaseSigner,
          payerTokenAccount,
          receiverReleaseTokenAccount,
          royaltyTokenAccount: release.royaltyTokenAccount,
          releaseMint: release.releaseMint,
          hub: hubPubkey,
          hubRelease,
          hubContent,
          hubSigner,
          hubWallet,
          tokenProgram: ids.programs.token,
        },
      }

      const instructions = []
      const solPrice = await getSolPrice()
      let releasePriceUi = ninaClient.nativeToUi(release.price.toNumber(), ids.mints.usdc)
      let convertAmount = releasePriceUi + (releasePriceUi * hub.referralFee.toNumber() / 1000000)
      if (!isSol(release.paymentMint) && usdcBalance < convertAmount) {
        convertAmount -= usdcBalance
        const { data } = await axios.get(
          `https://quote-api.jup.ag/v3/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&amount=${ninaClient.uiToNative((convertAmount + (convertAmount * .01)) / solPrice, ids.mints.wsol)}&slippageBps=1&onlyDirectRoutes=true`
        )
        let transactionInstructions
        for await (let d of data.data) {
          const transactions = await axios.post(
            'https://quote-api.jup.ag/v3/swap', {
            route: d,
            userPublicKey: provider.wallet.publicKey.toBase58(),
          })
          if (!transactionInstructions) {
            transactionInstructions = anchor.web3.Transaction.from(Buffer.from(transactions.data.swapTransaction, 'base64')).instructions
          } else {
            const tx = anchor.web3.Transaction.from(Buffer.from(transactions.data.swapTransaction, 'base64'))
            let accountCount = tx.instructions.reduce((count, ix) => count += ix.keys.length, 0)
            if (accountCount < transactionInstructions.reduce((count, ix) => count += ix.keys.length, 0)) {
              transactionInstructions = tx.instructions
            }
          }
        }
        instructions.push(...transactionInstructions)
      }
      if (receiverReleaseTokenAccountIx) {
        instructions.push(receiverReleaseTokenAccountIx)
      }

      if (instructions.length > 0) {
        request.instructions = instructions
      }
      if (isSol(release.paymentMint)) {
        const { instructions, signers } = await wrapSol(
          provider,
          new anchor.BN(
            release.price.toNumber() +
              (release.price.toNumber() * hub.referralFee.toNumber()) /
                1000000000
          )
        )
        if (!request.instructions) {
          request.instructions = [...instructions]
        } else {
          request.instructions.push(...instructions)
        }
        request.signers = signers
        request.accounts.payerTokenAccount = signers[0].publicKey
      }
      setReleasePurchaseTransactionPending({
        ...releasePurchaseTransactionPending,
        [releasePubkey.toBase58()]: false,
      })
      const txid = await program.rpc.releasePurchaseViaHub(
        release.price,
        decodeNonEncryptedByteArray(hub.handle),
        request
      )
      await provider.connection.getParsedTransaction(txid, 'confirmed')
      setReleasePurchasePending({
        ...releasePurchasePending,
        [releasePubkey.toBase58()]: false,
      })
      getUserBalances()
      await axios.get(`${process.env.NINA_API_ENDPOINT}/accounts/${provider.wallet.publicKey.toBase58()}/collected?txId=${txid}`)
      await getRelease(releasePubkey.toBase58())
      addReleaseToCollection(releasePubkey.toBase58())

      logEvent(
        'release_purchase_via_hub_success',
        'engagement', {
          publicKey: releasePubkey.toBase58(),
          hub: hubPubkey.toBase58(),
          wallet: provider.wallet.publicKey.toBase58(),
        }
      )

      return {
        success: true,
        msg: 'Release purchased!',
      }
    } catch (error) {
      getUserBalances()
      getRelease(releasePubkey.toBase58())
      setReleasePurchasePending({
        ...releasePurchasePending,
        [releasePubkey.toBase58()]: false,
      })
      setReleasePurchaseTransactionPending({
        ...releasePurchaseTransactionPending,
        [releasePubkey.toBase58()]: false,
      })
      logEvent(
        'release_purchase_via_hub_failure',
        'engagement', {
          publicKey: releasePubkey.toBase58(),
          hub: hubPubkey.toBase58(),
          wallet: provider.wallet.publicKey.toBase58(),
        }
      )
      return ninaErrorHandler(error)
    }
  }

  const releaseCreate = async ({
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
      const publishingCreditMint = new anchor.web3.PublicKey(
        ids.mints.publishingCredit
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

      const [
        authorityPublishingCreditTokenAccount,
        authorityPublishingCreditTokenAccountIx,
      ] = await findOrCreateAssociatedTokenAccount(
        provider.connection,
        provider.wallet.publicKey,
        provider.wallet.publicKey,
        anchor.web3.SystemProgram.programId,
        anchor.web3.SYSVAR_RENT_PUBKEY,
        publishingCreditMint
      )

      let instructions = [...releaseMintIx, royaltyTokenAccountIx]

      if (authorityTokenAccountIx) {
        instructions.push(authorityTokenAccountIx)
      }

      if (authorityPublishingCreditTokenAccountIx) {
        instructions.push(authorityPublishingCreditTokenAccountIx)
      }
      let now = new Date()
      const config = {
        amountTotalSupply: new anchor.BN(amount),
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

      const nameBuf = Buffer.from((`${artist} - ${title}`).substring(0,32));
      const nameBufString =  nameBuf.slice(0, 32).toString();

      const symbolBuf = Buffer.from(catalogNumber.substring(0,10));
      const symbolBufString =  symbolBuf.slice(0, 10).toString();

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

      logEvent(
        'release_init_initiated',
        'engagement', {
          publicKey: release.toBase58(),
          wallet: provider.wallet.publicKey.toBase58(),
        }
      )

      const txid = await program.rpc.releaseInitWithCredit(
        config,
        bumps,
        metadataData,
        {
          accounts: {
            release,
            releaseSigner,
            releaseMint: releaseMint.publicKey,
            payer: provider.wallet.publicKey,
            authority: provider.wallet.publicKey,
            authorityTokenAccount: authorityTokenAccount,
            authorityPublishingCreditTokenAccount,
            publishingCreditMint,
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
        }
      )
      await provider.connection.getParsedConfirmedTransaction(txid, 'confirmed')
      await getRelease(release)

      setPressingState({
        ...pressingState,
        pending: false,
        completed: true,
      })

      logEvent(
        'release_init_success',
        'engagement', {
          publicKey: release.toBase58(),
          wallet: provider.wallet.publicKey.toBase58(),
        }
      )

      return { success: true }
    } catch (error) {
      setPressingState({
        pending: false,
        completed: false,
      })

      logEvent(
        'release_init_failure',
        'engagement', {
          publicKey: release.toBase58(),
          wallet: provider.wallet.publicKey.toBase58(),
        }
      )
      return ninaErrorHandler(error)
    }
  }

  const releasePurchase = async (releasePubkey) => {
    logEvent(
      'release_purchase_initiated',
      'engagement', {
        publicKey: releasePubkey,
        wallet: provider.wallet.publicKey.toBase58(),
      }
    )

    setReleasePurchaseTransactionPending({
      ...releasePurchaseTransactionPending,
      [releasePubkey]: true,
    })
    const program = await ninaClient.useProgram()
    const release = await program.account.release.fetch(
      new anchor.web3.PublicKey(releasePubkey)
    )

    setReleasePurchasePending({
      ...releasePurchasePending,
      [releasePubkey]: true,
    })
    
    try {
      let [payerTokenAccount, payerTokenAccountIx] = await findOrCreateAssociatedTokenAccount(
        provider.connection,
        provider.wallet.publicKey,
        provider.wallet.publicKey,
        anchor.web3.SystemProgram.programId,
        anchor.web3.SYSVAR_RENT_PUBKEY,
        release.paymentMint
      )

      let [receiverReleaseTokenAccount, receiverReleaseTokenAccountIx] =
        await findOrCreateAssociatedTokenAccount(
          provider.connection,
          provider.wallet.publicKey,
          provider.wallet.publicKey,
          anchor.web3.SystemProgram.programId,
          anchor.web3.SYSVAR_RENT_PUBKEY,
          release.releaseMint
        )

      const request = {
        accounts: {
          release: new anchor.web3.PublicKey(releasePubkey),
          releaseSigner: release.releaseSigner,
          payer: provider.wallet.publicKey,
          payerTokenAccount,
          receiver: provider.wallet.publicKey,
          receiverReleaseTokenAccount,
          royaltyTokenAccount: release.royaltyTokenAccount,
          releaseMint: release.releaseMint,
          tokenProgram: TOKEN_PROGRAM_ID,
        },
      }
      const instructions = []
      if (!isSol(release.paymentMint) && usdcBalance < ninaClient.nativeToUi(release.price.toNumber(), ids.mints.usdc)) {
        const solPrice = await getSolPrice()
        const releaseUiPrice = ninaClient.nativeToUi(release.price.toNumber(), ids.mints.usdc) - usdcBalance
        const { data } = await axios.get(
          `https://quote-api.jup.ag/v3/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&amount=${ninaClient.uiToNative((releaseUiPrice + (releaseUiPrice * .01)) / solPrice, ids.mints.wsol)}&slippageBps=1&onlyDirectRoutes=true`
        )
        const transactions = await axios.post(
          'https://quote-api.jup.ag/v3/swap', {
          route: data.data[0],
          userPublicKey: provider.wallet.publicKey.toBase58(),
        })
        instructions.push(...anchor.web3.Transaction.from(Buffer.from(transactions.data.swapTransaction, 'base64')).instructions)
      }
      
      if (receiverReleaseTokenAccountIx) {
        instructions.push(receiverReleaseTokenAccountIx)
      }

      if (instructions.length > 0) {
        request.instructions = instructions
      }

      if (isSol(release.paymentMint)) {
        const { instructions, signers } = await wrapSol(
          provider,
          new anchor.BN(release.price)
        )
        if (!request.instructions) {
          request.instructions = [...instructions]
        } else {
          request.instructions.push(...instructions)
        }
        request.signers = signers
        request.accounts.payerTokenAccount = signers[0].publicKey
      }
      setReleasePurchaseTransactionPending({
        ...releasePurchaseTransactionPending,
        [releasePubkey]: false,
      })

      const txid = await program.rpc.releasePurchase(release.price, request)
      await provider.connection.getParsedConfirmedTransaction(txid, 'confirmed')

      setReleasePurchasePending({
        ...releasePurchasePending,
        [releasePubkey]: false,
      })
      getUserBalances()
      await axios.get(`${process.env.NINA_API_ENDPOINT}/accounts/${provider.wallet.publicKey.toBase58()}/collected?txId=${txid}`)
      await getRelease(releasePubkey)
      await addReleaseToCollection(releasePubkey)

      logEvent(
        'release_purchase_success',
        'engagement', {
          publicKey: releasePubkey,
          wallet: provider.wallet.publicKey.toBase58(),
        }
      )
  
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

      logEvent(
        'release_purchase_failure',
        'engagement', {
          publicKey: releasePubkey,
          wallet: provider.wallet.publicKey.toBase58(),
        }
      )

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
      await provider.connection.getParsedConfirmedTransaction(txid, 'confirmed')


      await getRelease(releasePubkey)
      getUserBalances()
      return {
        success: true,
        msg: `You collected $${nativeToUi(
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
      await provider.connection.getParsedConfirmedTransaction(txid, 'confirmed')

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

  const redeemableInitialize = async ({
    releasePubkey,
    description,
    amount,
  }) => {
    const program = await ninaClient.useProgram()

    try {
      const encryptionPublicKey = await exportPublicKey()
      const encryptionPublicKeyBuffer = Buffer.from(encryptionPublicKey)

      const release = new anchor.web3.PublicKey(releasePubkey)
      const releaseAccount = await program.account.release.fetch(release)
      const redeemedTokenMint = anchor.web3.Keypair.generate()

      const [redeemable, redeemableBump] =
        await anchor.web3.PublicKey.findProgramAddress(
          [
            Buffer.from(anchor.utils.bytes.utf8.encode('nina-redeemable')),
            release.toBuffer(),
            redeemedTokenMint.publicKey.toBuffer(),
          ],
          program.programId
        )
      const [redeemableSigner, redeemableSignerBump] =
        await anchor.web3.PublicKey.findProgramAddress(
          [
            Buffer.from(
              anchor.utils.bytes.utf8.encode('nina-redeemable-signer')
            ),
            redeemable.toBuffer(),
          ],
          program.programId
        )

      const redeemedTokenMintIx = await createMintInstructions(
        provider,
        redeemableSigner,
        redeemedTokenMint.publicKey,
        0
      )

      const config = {
        encryptionPublicKey: encryptionPublicKeyBuffer,
        description,
        redeemedMax: new anchor.BN(amount),
      }

      const bumps = {
        redeemable: redeemableBump,
        signer: redeemableSignerBump,
      }

      const txid = await program.rpc.redeemableInit(config, bumps, {
        accounts: {
          authority: provider.wallet.publicKey,
          release,
          redeemable,
          redeemableSigner,
          redeemableMint: releaseAccount.releaseMint,
          redeemedMint: redeemedTokenMint.publicKey,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          systemProgram: anchor.web3.SystemProgram.programId,
        },
        signers: [redeemedTokenMint],
        instructions: [...redeemedTokenMintIx],
      })
      await provider.connection.getParsedConfirmedTransaction(txid, 'confirmed')

      getRelease(releasePubkey)
      getRedeemablesForRelease(releasePubkey)
      return {
        success: true,
        msg: 'Redeemable Created!',
      }
    } catch (error) {
      getRelease(releasePubkey)
      getRedeemablesForRelease(releasePubkey)
      return ninaErrorHandler(error)
    }
  }

  const redeemableRedeem = async (releasePubkey, redeemable, address) => {
    const program = await ninaClient.useProgram()
    try {
      const redemptionRecord = anchor.web3.Keypair.generate()
      const redemptionRecordIx =
        await program.account.redemptionRecord.createInstruction(
          redemptionRecord
        )

      const release = new anchor.web3.PublicKey(releasePubkey)
      const releaseAccount = await program.account.release.fetch(release)

      let [redeemerRedeemedTokenAccount, redeemerRedeemedTokenAccountIx] =
        await findOrCreateAssociatedTokenAccount(
          provider.connection,
          provider.wallet.publicKey,
          provider.wallet.publicKey,
          anchor.web3.SystemProgram.programId,
          anchor.web3.SYSVAR_RENT_PUBKEY,
          redeemable.redeemedMint
        )
      let [redeemerRedeemableTokenAccount] =
        await findOrCreateAssociatedTokenAccount(
          provider.connection,
          provider.wallet.publicKey,
          provider.wallet.publicKey,
          anchor.web3.SystemProgram.programId,
          anchor.web3.SYSVAR_RENT_PUBKEY,
          releaseAccount.releaseMint
        )

      const encryptionPublicKey = await exportPublicKey()
      const encryptionPublicKeyBuffer = Buffer.from(encryptionPublicKey)
      const redeemableEncryptionPublicKey = new Uint8Array(
        redeemable.encryptionPublicKey
      )

      const addressString = Object.values(address).join(',')

      const [encryptedAddress, iv] = await encryptData(
        addressString,
        redeemableEncryptionPublicKey,
        272
      )

      const request = {
        accounts: {
          redeemer: provider.wallet.publicKey,
          redeemableMint: releaseAccount.releaseMint,
          redeemedMint: redeemable.redeemedMint,
          redeemable: redeemable.publicKey,
          redeemableSigner: redeemable.redeemableSigner,
          release: releasePubkey,
          redemptionRecord: redemptionRecord.publicKey,
          redeemerRedeemableTokenAccount,
          redeemerRedeemedTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          systemProgram: anchor.web3.SystemProgram.programId,
        },
        signers: [redemptionRecord],
        instructions: [redemptionRecordIx],
      }

      if (redeemerRedeemedTokenAccountIx) {
        request.instructions = [
          ...request.instructions,
          redeemerRedeemedTokenAccountIx,
        ]
      }

      const txid = await program.rpc.redeemableRedeem(
        encryptionPublicKeyBuffer,
        encryptedAddress,
        iv,
        request
      )
      await provider.connection.getParsedConfirmedTransaction(txid, 'confirmed')

      removeReleaseFromCollection(
        releasePubkey,
        releaseAccount.releaseMint.toBase58()
      )
      getRedemptionRecordsForRelease(releasePubkey)

      return {
        success: true,
        msg: 'Redemption successful!',
      }
    } catch (error) {
      getRelease(releasePubkey)
      getRedeemablesForRelease(releasePubkey)
      getRedemptionRecordsForRelease(releasePubkey)
      return ninaErrorHandler(error)
    }
  }

  const redeemableUpdateShipping = async (
    redeemablePubkey,
    redemptionRecordPubkey,
    shippingInfo
  ) => {
    try {
      const program = await ninaClient.useProgram()
      const redeemable = new anchor.web3.PublicKey(redeemablePubkey)

      const redemptionRecord = new anchor.web3.PublicKey(redemptionRecordPubkey)
      const redemptionRecordAccount =
        await program.account.redemptionRecord.fetch(redemptionRecord)
      const redemptionRecordEncryptionPublicKey = new Uint8Array(
        redemptionRecordAccount.encryptionPublicKey
      )

      const [encryptedShipper] = await encryptData(
        shippingInfo.shipper,
        redemptionRecordEncryptionPublicKey,
        32,
        new Uint8Array(redemptionRecordAccount.iv)
      )
      const [encryptedTrackingNumber] = await encryptData(
        shippingInfo.trackingNumber,
        redemptionRecordEncryptionPublicKey,
        64,
        new Uint8Array(redemptionRecordAccount.iv)
      )

      const txid = await program.rpc.redeemableShippingUpdate(
        encryptedShipper,
        encryptedTrackingNumber,
        {
          accounts: {
            authority: provider.wallet.publicKey,
            redeemable: redeemable,
            redemptionRecord: redemptionRecord.publicKey,
          },
        }
      )
      await provider.connection.getParsedConfirmedTransaction(txid, 'confirmed')

      getRedemptionRecordsForRelease(redemptionRecordAccount.release.toBase58())
      return {
        success: true,
        msg: 'Shipping info updated!',
      }
    } catch (error) {
      const program = await ninaClient.useProgram()
      const redeemable = new anchor.web3.PublicKey(redeemablePubkey)
      const redeemableAccount = await program.account.redeemable.fetch(
        redeemable
      )
      const releasePubkey = redeemableAccount.release.toBase58()
      getRelease(releasePubkey)
      getRedeemablesForRelease(releasePubkey)
      getRedemptionRecordsForRelease(releasePubkey)
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
      setReleaseState(prevState => ({
        ...prevState,
        tokenData: {...prevState.tokenData, ...newState.tokenData},
        metadata: {...prevState.metadata, ...newState.metadata},
        releaseMintMap: {...prevState.releaseMintMap, ...newState.releaseMintMap},
      }))
    } catch (error) {
      console.warn(error)
    }
  }

  const getReleasesPublishedByUser = async (publicKey, withAccountData=false) => {
    try {
      const { published } = await NinaSdk.Account.fetchPublished(publicKey, withAccountData)
      const newState = updateStateForReleases(published)
      setReleaseState(prevState => ({
        ...prevState,
        tokenData: {...prevState.tokenData, ...newState.tokenData},
        metadata: {...prevState.metadata, ...newState.metadata},
        releaseMintMap: {...prevState.releaseMintMap, ...newState.releaseMintMap},
      }))
    } catch (error) {
      console.warn(error)
    }
  }

  const getReleasesCollectedByUser = async (publicKey) => {
    try {
      const { collected } = await NinaSdk.Account.fetchCollected(publicKey)
      const newState = updateStateForReleases(collected)
      setReleaseState(prevState => ({
        ...prevState,
        tokenData: {...prevState.tokenData, ...newState.tokenData},
        metadata: {...prevState.metadata, ...newState.metadata},
        releaseMintMap: {...prevState.releaseMintMap, ...newState.releaseMintMap},
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
      const { collected } = await NinaSdk.Account.fetchCollected(publicKey, withAccountData)
      const { published } = await NinaSdk.Account.fetchPublished(publicKey, withAccountData)
      const { revenueShares } = await NinaSdk.Account.fetchRevenueShares(publicKey, withAccountData)
      const newState = updateStateForReleases([...collected, ...published, ...revenueShares])
      setReleaseState(prevState => ({
        ...prevState,
        tokenData: {...prevState.tokenData, ...newState.tokenData},
        metadata: {...prevState.metadata, ...newState.metadata},
        releaseMintMap: {...prevState.releaseMintMap, ...newState.releaseMintMap},
      }))

      const publishedAndRevenueShares = [...published, ...revenueShares].filter((value, index, self) => {
       return self.findIndex(value2 => (value2.publicKey === value.publicKey)) === index
      })
      setFetchedUserProfileReleases({
        ...fetchedUserProfileReleases,
        [publicKey]: {
          collected: collected.map((release) => release.publicKey),
          published: publishedAndRevenueShares.map((release) => release.publicKey)
        },
      })
  
      return [collected, publishedAndRevenueShares]
    } catch (error) {
      console.warn(error)
      return [[],[]]
    }
  }

  const getReleaseRoyaltiesByUser = async (publicKey) => {
    try {
      const { revenueShares } = await NinaSdk.Account.fetchRevenueShares(publicKey, true)
      const newState = updateStateForReleases(revenueShares)
      setReleaseState(prevState => ({
        ...prevState,
        tokenData: {...prevState.tokenData, ...newState.tokenData},
        metadata: {...prevState.metadata, ...newState.metadata},
        releaseMintMap: {...prevState.releaseMintMap, ...newState.releaseMintMap},
      }))
    } catch (error) {
      console.warn(error)
    }
  }

  const updateStateForReleases = (releases) => {
    const updatedReleaseState = { tokenData: {}, metadata: {}, releaseMintMap: {} }
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
    })
    return updatedReleaseState 
  }

  const getReleasesRecent = async () => {
    try {
      if (!releasesRecentState.highlights || releasesRecentState.highlights.length === 0) {
        await initSdkIfNeeded()
        const highlightsHubPubkey = process.env.REACT_APP_CLUSTER === 'devnet' ? '4xHeZW8BK8HeCinoDLsGiGwtYsjQ9zBb71m5vdDa5ceS' : '4QECgzp8hjknK3pvPEMoXATywcsNnH4MU49tVvDWLgKg'
        const published = (await NinaSdk.Release.fetchAll({limit: 25}, true)).releases
        const highlights = (await NinaSdk.Hub.fetchReleases(highlightsHubPubkey, true)).releases
  
        const allReleases = [...published, ...highlights]
        setAllReleasesCount(published.total)
        const newState = updateStateForReleases(allReleases)
        setReleaseState(prevState => ({
          ...prevState,
          tokenData: {...prevState.tokenData, ...newState.tokenData},
          metadata: {...prevState.metadata, ...newState.metadata},
          releaseMintMap: {...prevState.releaseMintMap, ...newState.releaseMintMap},
        }))
        setReleasesRecentState({
          published: published.map(release => release.publicKey),
          highlights: _.shuffle(highlights.map(release => release.publicKey)),
        })
      }
    } catch (error) {
      console.warn(error)
    }
  }

  const getReleasesAll = async () => {
    try {
      const all = [...allReleases]
      const releases = (await NinaSdk.Release.fetchAll({limit: 25, offset: allReleases.length}, true)).releases
      all.push(...releases.map(release => release.publicKey))
      const newState = updateStateForReleases(releases)
      setReleaseState(prevState => ({
        ...prevState,
        tokenData: {...prevState.tokenData, ...newState.tokenData},
        metadata: {...prevState.metadata, ...newState.metadata},
        releaseMintMap: {...prevState.releaseMintMap, ...newState.releaseMintMap},
      }))
      setAllReleasesCount(releases.total)
      setAllReleases(all)
    } catch (error) {
      console.warn(error)
    }
  }

  const getCollectorsForRelease = async (releasePubkey) => {
    const { collectors } = await NinaSdk.Release.fetchCollectors(releasePubkey)
    const updatedVerificationState = {...verificationState}
    return collectors.map(collector => {
      if (collector.verifications.length > 0) {
        updatedVerificationState[collector.publicKey] = collector.verifications
      }
      setVerificationState(prevState => ({...prevState, ...updatedVerificationState}))
     return collector.publicKey
    })
  }

  const getFeedForUser = async (publicKey, offset) => {
    try {
      const { data } = await axios.get(`${process.env.NINA_API_ENDPOINT}/accounts/${publicKey}/feed?offset=${offset}`)
      console.log('feed', data)
      const releases = []
      const updatedVerificationState = {}

      data.feedItems.forEach(feedItem => {
        if (feedItem.release) {
          releases.push(feedItem.release)
        }
        if (feedItem.authority.verifications.length > 0) {
          updatedVerificationState[feedItem.authority.publicKey] = feedItem.authority.verifications
        }
        if (feedItem.toAccount?.verifications?.length > 0) {
          updatedVerificationState[feedItem.toAccount.publicKey] = feedItem.toAccount.verifications
        }
      })
      setVerificationState(prevState => ({...prevState, ...updatedVerificationState}))
      const newState = updateStateForReleases(releases)
      setReleaseState(prevState => ({
        ...prevState,
        tokenData: {...prevState.tokenData, ...newState.tokenData},
        metadata: {...prevState.metadata, ...newState.metadata},
        releaseMintMap: {...prevState.releaseMintMap, ...newState.releaseMintMap},
      }))
      
      return data
    } catch (error) {
      console.warn(error)
    }
  }

  /*

  STATE FILTERS

  */
 
  const filterReleasesUserCollection = (publicKey=undefined) => {
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
      (a, b) =>
        a.tokenData.releaseDatetime >
        b.tokenData.releaseDatetime
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
      (a, b) =>
        a.tokenData.releaseDatetime >
        b.tokenData.releaseDatetime
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
        if (
          recipient.recipientAuthority === userPubkey &&
          metadata
        ) {
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
        if (
          recipient.recipientAuthority === userPubkey &&
          metadata
        ) {
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
      let path = endpoints.api + `/metadata/validateHash/${hash}`
      const response = await fetch(path)
      const metadata = await response.json()
      if (metadata) {
        return metadata
      } else {
        return false
      }
    } catch (error) {
      console.warn(error)
    }
  }


  return {
    releaseInitViaHub,
    releasePurchaseViaHub,
    addRoyaltyRecipient,
    releaseCreate,
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
    redeemableInitialize,
    redeemableRedeem,
    redeemableUpdateShipping,
    filterSearchResults,
    getCollectorsForRelease,
    initializeReleaseAndMint,
    releaseCreateMetadataJson,
    validateUniqueMd5Digest,
    getFeedForUser
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
  Provider: ReleaseContextProvider
}