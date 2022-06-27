import React, { createContext, useState, useContext } from 'react'
import * as anchor from '@project-serum/anchor'
import { NinaContext } from './nina'
import {
  createMintInstructions,
  findOrCreateAssociatedTokenAccount,
  wrapSol,
  TOKEN_PROGRAM_ID,
} from '../utils/web3'
import axios from 'axios'
import { ninaErrorHandler } from '../utils/errors'
import {
  encryptData,
  exportPublicKey,
  decodeNonEncryptedByteArray,
  decryptData,
} from '../utils/encrypt'
import { indexerHasRecord, shuffle } from '../utils'

const lookupTypes = {
  PUBLISHED_BY: 'published_by',
  REVENUE_SHARE: 'revenue_share',
}
export const ReleaseContext = createContext()
const ReleaseContextProvider = ({ children }) => {
  const {
    ninaClient,
    addReleaseToCollection,
    collection,
    getUsdcBalance,
    usdcBalance,
    removeReleaseFromCollection,
  } = useContext(NinaContext)
  const [releasePurchasePending, setReleasePurchasePending] = useState({})
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
    purchased: [],
    highlights: [],
  })
  const [allReleases, setAllReleases] = useState([])
  const [allReleasesCount, setAllReleasesCount] = useState(null)

  const resetSearchResults = () => {
    setSearchResults(searchResultsInitialState)
  }

  const resetPressingState = () => {
    setPressingState(defaultPressingState)
  }

  const {
    releaseCreate,
    releaseFetchMetadata,
    releasePurchase,
    collectRoyaltyForRelease,
    addRoyaltyRecipient,
    getRelease,
    getReleasesInCollection,
    getReleasesPublishedByUser,
    getReleasesRecent,
    getReleasesAll,
    getReleaseRoyaltiesByUser,
    getUserCollection,
    filterReleasesUserCollection,
    filterReleasesPublishedByUser,
    filterReleasesRecent,
    filterReleasesAll,
    filterRoyaltiesByUser,
    filterReleasesList,
    calculateStatsByUser,
    redeemableInitialize,
    redeemableRedeem,
    redeemableUpdateShipping,
    getRedemptionRecordsForRelease,
    getRedeemablesForRelease,
    getRelatedForRelease,
    filterRelatedForRelease,
    getReleasesBySearch,
    filterSearchResults,
    getCollectorsForRelease,
    fetchAndSaveReleasesToState,
    releasePurchaseViaHub,
    initializeReleaseAndMint,
    releaseCreateMetadataJson,
    releaseInitViaHub,
    getPublishedHubForRelease,
    getHubsForRelease,
  } = releaseContextHelper({
    ninaClient,
    releaseState,
    setReleaseState,
    pressingState,
    setPressingState,
    releasePurchasePending,
    setReleasePurchasePending,
    usdcBalance,
    getUsdcBalance,
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
  })

  return (
    <ReleaseContext.Provider
      value={{
        pressingState,
        resetPressingState,
        releaseCreate,
        releaseFetchMetadata,
        releasePurchase,
        releasePurchasePending,
        releaseState,
        collectRoyaltyForRelease,
        addRoyaltyRecipient,
        getRelease,
        getReleasesPublishedByUser,
        getReleasesRecent,
        getReleasesAll,
        getReleaseRoyaltiesByUser,
        getReleasesInCollection,
        filterReleasesUserCollection,
        filterReleasesPublishedByUser,
        filterRoyaltiesByUser,
        filterReleasesList,
        calculateStatsByUser,
        redeemableInitialize,
        redeemableRedeem,
        searchResults,
        resetSearchResults,
        getRedemptionRecordsForRelease,
        redeemableUpdateShipping,
        redeemableState,
        getRedeemablesForRelease,
        releasesRecentState,
        filterReleasesRecent,
        filterReleasesAll,
        getRelatedForRelease,
        filterRelatedForRelease,
        allReleases,
        allReleasesCount,
        getReleasesBySearch,
        filterSearchResults,
        setSearchResults,
        getUserCollection,
        getCollectorsForRelease,
        fetchAndSaveReleasesToState,
        releasePurchaseViaHub,
        initializeReleaseAndMint,
        releaseCreateMetadataJson,
        releaseInitViaHub,
        getPublishedHubForRelease,
        getHubsForRelease,
      }}
    >
      {children}
    </ReleaseContext.Provider>
  )
}
export default ReleaseContextProvider

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
  getUsdcBalance,
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
      ;[hubRelease] = await anchor.web3.PublicKey.findProgramAddress(
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

      const metadataData = {
        name: `${artist} - ${title}`.substring(0, 32),
        symbol: catalogNumber.substring(0, 10),
        uri: metadataUri,
        sellerFeeBasisPoints: resalePercentage,
      }

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
      await provider.connection.getParsedConfirmedTransaction(txid, 'confirmed')
      await indexerHasRecord(hubRelease.toBase58(), 'hubRelease')
      await getRelease(release)

      return true
    } catch (error) {
      return ninaErrorHandler(error)
    }
  }

  const releasePurchaseViaHub = async (releasePubkey, hubPubkey) => {
    try {
      const program = await ninaClient.useProgram()
      let release = releaseState.tokenData[releasePubkey]
      releasePubkey = new anchor.web3.PublicKey(releasePubkey)
      hubPubkey = new anchor.web3.PublicKey(hubPubkey)
      if (!release) {
        release = await program.account.release.fetch(releasePubkey)
      }

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
          release: release.publicKey,
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
          clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
        },
      }

      const instructions = []
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
      const txid = await program.rpc.releasePurchaseViaHub(
        release.price,
        decodeNonEncryptedByteArray(hub.handle),
        request
      )
      await provider.connection.getParsedConfirmedTransaction(txid, 'confirmed')

      setReleasePurchasePending({
        ...releasePurchasePending,
        [releasePubkey]: false,
      })
      getUsdcBalance()
      addReleaseToCollection(releasePubkey.toBase58())
      await getRelease(releasePubkey)

      return {
        success: true,
        msg: 'Release purchased!',
      }
    } catch (error) {
      getUsdcBalance()
      getRelease(releasePubkey)
      setReleasePurchasePending({
        ...releasePurchasePending,
        [releasePubkey]: false,
      })
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

      const metadataData = {
        name: `${artist} - ${title}`.substring(0, 32),
        symbol: catalogNumber.substring(0, 10),
        uri: metadataUri,
        sellerFeeBasisPoints: resalePercentage,
      }

      const bumps = {
        release: releaseBump,
        signer: releaseSignerBump,
      }

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
      await indexerHasRecord(release.toBase58(), 'release')
      await getRelease(release)

      setPressingState({
        ...pressingState,
        pending: false,
        completed: true,
      })
      return { success: true }
    } catch (error) {
      setPressingState({
        pending: false,
        completed: false,
      })
      return ninaErrorHandler(error)
    }
  }

  const releasePurchase = async (releasePubkey) => {
    const program = await ninaClient.useProgram()

    let release = releaseState.tokenData[releasePubkey]
    if (!release) {
      release = await program.account.release.fetch(
        new anchor.web3.PublicKey(releasePubkey)
      )
    }

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
          release: release.publicKey,
          releaseSigner: release.releaseSigner,
          payer: provider.wallet.publicKey,
          payerTokenAccount,
          receiver: provider.wallet.publicKey,
          receiverReleaseTokenAccount,
          royaltyTokenAccount: release.royaltyTokenAccount,
          releaseMint: release.releaseMint,
          tokenProgram: TOKEN_PROGRAM_ID,
          clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
        },
      }

      const instructions = []
      if (payerTokenAccountIx) {
        instructions.push(payerTokenAccountIx)
      }
      if (ninaClient.uiToNative(usdcBalance, ids.mints.usdc) < ninaClient.nativeToUi(release.price.toNumber(), ids.mints.usdc)) {
        const additionalComputeBudgetInstruction = anchor.web3.ComputeBudgetProgram.requestUnits({
          units: 200000,
          additionalFee: 0,
        });
        instructions.push(additionalComputeBudgetInstruction)
        const priceResult = await axios.get(
          `https://price.jup.ag/v1/price?id=SOL&vsAmount=${ninaClient.nativeToUi(release.price.toNumber(), ids.mints.usdc)}`
        )
        const price = priceResult.data.data.price
        console.log('PRICE: ', price, priceResult)
        const { data } = await axios.get(
          `https://quote-api.jup.ag/v1/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&amount=${ninaClient.uiToNative(ninaClient.nativeToUi(release.price.toNumber(), ids.mints.usdc) / price, ids.mints.wsol)}&slippage=0.5&feeBps=4&onlyDirectRoutes=true`
        )
        const transactions = await axios.post(
          'https://quote-api.jup.ag/v1/swap', {
          route: data.data[0],
          userPublicKey: provider.wallet.publicKey.toBase58(),
          feeAccount: 'HDhJyie5Gpck7opvAbYi5H22WWofAR3ygKFghdzDkmLf',
        })
        instructions.push(...anchor.web3.Transaction.from(Buffer.from(transactions.data.swapTransaction, 'base64')).instructions)
        console.log('transactions: ', transactions, anchor.web3.Transaction.from(Buffer.from(transactions.data.swapTransaction, 'base64')))
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

      const txid = await program.rpc.releasePurchase(release.price, request)
      await provider.connection.getParsedConfirmedTransaction(txid, 'confirmed')

      setReleasePurchasePending({
        ...releasePurchasePending,
        [releasePubkey]: false,
      })
      getUsdcBalance()
      await getRelease(releasePubkey)
      await addReleaseToCollection(releasePubkey)
      return {
        success: true,
        msg: 'Release purchased!',
      }
    } catch (error) {
      getUsdcBalance()
      getRelease(releasePubkey)
      setReleasePurchasePending({
        ...releasePurchasePending,
        [releasePubkey]: false,
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

      getRelease(releasePubkey)
      getUsdcBalance()
      return {
        success: true,
        msg: `You collected $${nativeToUi(
          recipient.owed.toNumber(),
          release.paymentMint
        )}`,
      }
    } catch (error) {
      getUsdcBalance()
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
          release.paymentMint
        )

      let [authorityTokenAccount, authorityTokenAccountIx] =
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
          release: releasePublicKey,
          releaseMint: release.releaseMint,
          releaseSigner: release.releaseSigner,
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
      getUsdcBalance()

      return {
        success: true,
        msg: `Revenue share transferred`,
      }
    } catch (error) {
      getRelease(releasePubkey)
      getUsdcBalance()
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

  const fetchRelease = async (releasePubkey) => {
    try {
      const program = await ninaClient.useProgram()
      releasePubkey = new anchor.web3.PublicKey(releasePubkey)

      const releaseAccount = await program.account.release.fetch(releasePubkey)
      releaseAccount.publicKey = releasePubkey
      if (releaseAccount.error) {
        throw releaseAccount.error
      } else {
        return releaseAccount
      }
    } catch (error) {
      console.warn(error)
    }
  }

  const getRelease = async (releasePubkey) => {
    try {
      const releaseAccount = await fetchRelease(releasePubkey)
      if (releaseAccount.error) {
        throw releaseAccount.error
      } else {
        await saveReleasesToState([releaseAccount])
      }
    } catch (error) {
      console.warn(error)
    }
  }

  const getReleasesHandler = async (publicKey, type) => {
    if (!provider.connection) {
      return
    }
    try {
      let path = endpoints.api
      switch (type) {
        case lookupTypes.PUBLISHED_BY:
          path += `/releases/published/${publicKey.toBase58()}`
          break
        case lookupTypes.REVENUE_SHARE:
          path += `/releases/royalties/${publicKey.toBase58()}`
          break
      }

      const response = await fetch(path)
      const releaseIds = await response.json()
      await fetchAndSaveReleasesToState(releaseIds)
    } catch (error) {
      console.warn(error)
    }
  }

  const getReleaseIdsHandler = async (recipient, type) => {
    if (!provider.connection) {
      return
    }
    if (recipient?.percentShare?.toNumber() > 0) {
      try {
        let path = endpoints.api
        switch (type) {
          case lookupTypes.PUBLISHED_BY:
            path += `/releases/published/${recipient.recipientAuthority.toBase58()}`
            break
          case lookupTypes.REVENUE_SHARE:
            path += `/releases/royalties/${recipient.recipientAuthority.toBase58()}`
            break
        }

        const response = await fetch(path)
        const releaseIds = await response.json()
        return releaseIds
      } catch (error) {
        console.warn(error)
      }
    } else {
      return
    }
  }

  const getReleasesInCollection = async () => {
    await fetchAndSaveReleasesToState(Object.keys(collection))
  }

  const getReleasesPublishedByUser = async (publicKey) => {
    await getReleasesHandler(publicKey, lookupTypes.REVENUE_SHARE)
  }

  const getRelatedForRelease = async (releasePubkey) => {
    let release = releaseState.tokenData[releasePubkey]
    if (!release) {
      release = await fetchRelease(releasePubkey)
    }
    try {
      const releaseIds = []
      for await (let recipient of release.royaltyRecipients) {
        const royaltyIds = await getReleaseIdsHandler(
          recipient,
          lookupTypes.REVENUE_SHARE
        )
        if (royaltyIds) {
          releaseIds.push(...royaltyIds)
        }
        const publishedIds = await getReleaseIdsHandler(
          recipient,
          lookupTypes.PUBLISHED_BY
        )
        if (publishedIds) {
          releaseIds.push(...publishedIds)
        }
      }
      const filteredReleaseIds = new Set(releaseIds)
      await fetchAndSaveReleasesToState(Array.from(filteredReleaseIds))
    } catch (error) {
      console.warn(error)
    }
  }

  const getPublishedHubForRelease = async (releasePubkey) => {
    try {
      let path = `${endpoints.api}/releases/${releasePubkey}/publishedThroughHub`
      const response = await fetch(path)
      const hub = await response.json()
      return hub
    } catch (error) {
      console.warn(error)
      return undefined
    }
  }

  const getHubsForRelease = async (releasePubkey) => {
    try {
      let path = `${endpoints.api}/releases/${releasePubkey}/hubs`
      const response = await fetch(path)
      const json = await response.json()
      return json.hubs
    } catch (error) {
      console.warn(error)
      return undefined
    }
  }

  const getRedeemablesForRelease = async (releasePubkey) => {
    try {
      const response = await fetch(`/releases/${releasePubkey}/redeemables`)
      const redeemableIds = await response.json()
      const parsedRedeemables = {}

      const program = await ninaClient.useProgram()
      let redeemableAccounts = await anchor.utils.rpc.getMultipleAccounts(
        provider.connection,
        redeemableIds.map((id) => new anchor.web3.PublicKey(id))
      )

      const layout = program.coder.accounts.accountLayouts.get('Redeemable')
      redeemableAccounts.forEach((redeemable) => {
        let dataParsed = layout.decode(redeemable.account.data.slice(8))
        dataParsed.publicKey = redeemable.publicKey
        dataParsed.description = decodeNonEncryptedByteArray(
          dataParsed?.description
        )
        parsedRedeemables[releasePubkey] = dataParsed
      })

      setRedeemableState({
        ...redeemableState,
        ...parsedRedeemables,
      })
    } catch (error) {
      console.warn(error)
    }
  }

  const getRedemptionRecordsForRelease = async (releasePubkey) => {
    try {
      const program = await ninaClient.useProgram()
      const release = await program.account.release.fetch(releasePubkey)
      const parsedRedemptionRecords = []

      if (!release) {
        return
      }

      let authority
      if (
        provider.wallet?.publicKey.toBase58() !== release.authority.toBase58()
      ) {
        authority = provider.wallet?.publicKey.toBase58()
      }
      const response = await fetch(
        `/releases/${releasePubkey}/redemptionRecords${
          authority ? `/${provider.wallet.publicKey.toBase58()}` : ''
        }`
      )
      const redemptionRecordIds = await response.json()
      let redemptionRecords = await anchor.utils.rpc.getMultipleAccounts(
        provider.connection,
        redemptionRecordIds.map((id) => new anchor.web3.PublicKey(id))
      )

      const layout =
        program.coder.accounts.accountLayouts.get('RedemptionRecord')
      for await (let redemptionRecord of redemptionRecords) {
        let dataParsed = layout.decode(redemptionRecord.account.data.slice(8))
        const redeemable = await program.account.redeemable.fetch(
          dataParsed.redeemable
        )

        dataParsed.publicKey = redemptionRecord.publicKey
        const otherPartyEncryptionKey =
          provider.wallet?.publicKey.toBase58() ===
          redeemable.authority.toBase58()
            ? dataParsed.encryptionPublicKey
            : redeemable.encryptionPublicKey
        if (!dataParsed.address.every((item) => item === 0)) {
          dataParsed.address = await decryptData(
            dataParsed.address,
            otherPartyEncryptionKey,
            dataParsed.iv
          )
        }
        if (!dataParsed.shipper.every((item) => item === 0)) {
          dataParsed.shipper = await decryptData(
            dataParsed.shipper,
            otherPartyEncryptionKey,
            dataParsed.iv
          )
        } else {
          dataParsed.shipper = undefined
        }
        if (!dataParsed.trackingNumber.every((item) => item === 0)) {
          dataParsed.trackingNumber = await decryptData(
            dataParsed.trackingNumber,
            otherPartyEncryptionKey,
            dataParsed.iv
          )
        } else {
          dataParsed.trackingNumber = undefined
        }
        if (
          redeemable.authority.toBase58() ===
          provider.wallet.publicKey.toBase58()
        ) {
          dataParsed.userIsPublisher = true
        } else {
          dataParsed.userIsPublisher = false
        }

        parsedRedemptionRecords.push(dataParsed)
      }

      saveRedemptionRecordsToState(parsedRedemptionRecords, releasePubkey)
    } catch (error) {
      console.warn(error)
    }
  }

  const getReleaseRoyaltiesByUser = async () => {
    await getReleasesHandler(lookupTypes.REVENUE_SHARE)
  }

  const getReleasesRecent = async () => {
    try {
      const result = await fetch(`${endpoints.api}/releases/recent`)
      const { published, purchased, highlights } = await result.json()
      const releaseIds = [...published, ...purchased, ...highlights]
      await fetchAndSaveReleasesToState(releaseIds)

      setReleasesRecentState({
        published,
        purchased,
        highlights: shuffle(highlights),
      })
    } catch (error) {
      console.warn(error)
    }
  }

  const getReleasesAll = async () => {
    try {
      const all = [...allReleases]
      const result = await fetch(
        `${endpoints.api}/releases/?offset=${allReleases.length}`
      )
      const json = await result.json()
      json.releases.forEach((id) => {
        if (!allReleases.includes(id)) {
          all.push(id)
        }
      })
      setAllReleasesCount(json.count)
      setAllReleases(all)
      await fetchAndSaveReleasesToState(json.releases)
    } catch (error) {
      console.warn(error)
    }
  }

  const getReleasesBySearch = async (query) => {
    setSearchResults({
      releaseIds: [],
      releases: [],
      searched: false,
      pending: true,
      query: query,
    })

    const encodedQuery = encodeURIComponent(query)
    try {
      const result = await fetch(
        `${endpoints.api}/releases/search?s=${encodedQuery}`
      )
      const json = await result.json()
      await fetchAndSaveReleasesToState(json.releases, query)
    } catch (error) {
      console.warn(error)
    }
  }

  const getUserCollection = async (userId) => {
    try {
      const program = await ninaClient.useProgram()
      const userCollection = []
      let tokenAccounts =
        await provider.connection.getParsedTokenAccountsByOwner(
          new anchor.web3.PublicKey(userId),
          { programId: TOKEN_PROGRAM_ID }
        )
      const walletTokenAccounts = tokenAccounts.value.map(
        (value) => value.account.data.parsed.info
      )

      const releaseAmountMap = {}
      for await (let account of walletTokenAccounts) {
        const mint = new anchor.web3.PublicKey(account.mint)
        const balance = account.tokenAmount.uiAmount

        if (balance > 0 && balance % 1 === 0) {
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
        userCollection.push(releasePublicKey)
      })
      await fetchAndSaveReleasesToState(userCollection)
      return userCollection
    } catch (e) {
      console.warn('error: ', e)
      return
    }
  }

  const getCollectorsForRelease = async (releasePubkey) => {
    const collectorsResult = await fetch(
      `${endpoints.api}/releases/${releasePubkey}/collectors`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    )
    const metadataJson = await collectorsResult.json()

    return metadataJson
  }

  /*

  STATE FILTERS

  */
  const filterReleasesUserCollection = () => {
    if (!provider.wallet?.connected) {
      return []
    }

    const releases = []
    Object.keys(collection).forEach((releasePubkey) => {
      if (collection[releasePubkey] > 0) {
        const tokenData = releaseState.tokenData[releasePubkey]
        const metadata = releaseState.metadata[releasePubkey]
        if (metadata) {
          releases.push({ tokenData, metadata, releasePubkey })
        }
      }
    })
    return releases
  }

  const filterReleasesList = (releaseList) => {
    const releases = []
    releaseList.forEach((releasePubkey) => {
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

    const releasesPurchased = []
    releasesRecentState.purchased.forEach((releasePubkey) => {
      const tokenData = releaseState.tokenData[releasePubkey]
      const metadata = releaseState.metadata[releasePubkey]
      if (metadata) {
        releasesPurchased.push({ tokenData, metadata, releasePubkey })
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
      purchased: releasesPurchased,
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
        a.tokenData.releaseDatetime.toNumber() >
        b.tokenData.releaseDatetime.toNumber()
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
        a.tokenData.releaseDatetime.toNumber() >
        b.tokenData.releaseDatetime.toNumber()
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
      if (tokenData.authority.toBase58() === userPubkey && metadata) {
        releaseData.tokenData = tokenData
        releaseData.metadata = metadata
        releaseData.releasePubkey = releasePubkey
      }

      tokenData.royaltyRecipients.forEach((recipient) => {
        if (
          recipient.recipientAuthority.toBase58() === userPubkey &&
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
          recipient.recipientAuthority.toBase58() === userPubkey &&
          metadata
        ) {
          releases.push({ tokenData, metadata, releasePubkey, recipient })
        }
      })
    })
    return releases
  }

  const filterRelatedForRelease = (releasePubkey) => {
    const releases = []
    const releaseIds = new Set()
    const release = releaseState.tokenData[releasePubkey]
    if (release) {
      release.royaltyRecipients.forEach((recipient) => {
        Object.keys(releaseState.tokenData).forEach((releasePubkey) => {
          const tokenData = releaseState.tokenData[releasePubkey]
          const metadata = releaseState.metadata[releasePubkey]
          tokenData.royaltyRecipients.forEach((recipient2) => {
            if (
              recipient.percentShare.toNumber() > 0 &&
              recipient.recipientAuthority.toBase58() ===
                recipient2.recipientAuthority.toBase58() &&
              metadata
            ) {
              if (!releaseIds.has(releasePubkey)) {
                releases.push({ tokenData, metadata, releasePubkey, recipient })
                releaseIds.add(releasePubkey)
              }
            }
          })
        })
      })
    }
    return releases
  }

  const calculateRoyaltyStatsForUser = (userPubkey = undefined) => {
    let royaltyUncollected = []
    let royaltyOwed = 0
    let royaltyCollected = 0
    let royaltyCount = 0

    filterRoyaltiesByUser(userPubkey).forEach((release) => {
      release.royaltyRecipients.forEach((recipient) => {
        if (recipient.recipientAuthority.toBase58() === userPubkey) {
          royaltyCount += 1
          const owed = recipient.owed.toNumber()
          if (owed > 0) {
            royaltyUncollected.push(release)
            royaltyOwed += nativeToUi(owed, release.paymentMint)
          }
          royaltyCollected += nativeToUi(
            recipient.collected.toNumber(),
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
        salesAmountUsdc += release.saleTotal.toNumber()
        secondarySalesAmountUsdc += release.exchangeSaleTotal.toNumber()
      } else if (isSol(release.paymentMint)) {
        salesAmountSol += release.saleTotal.toNumber()
        secondarySalesAmountSol += release.exchangeSaleTotal.toNumber()
      }
      salesCount += release.saleCounter.toNumber()
      secondarySalesCount += release.exchangeSaleCounter.toNumber()
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

  const fetchAndSaveReleasesToState = async (releaseIds, query = null) => {
    if (releaseIds.length > 0) {
      releaseIds = releaseIds.filter((id, pos) => releaseIds.indexOf(id) == pos)
      releaseIds = releaseIds.map((id) => new anchor.web3.PublicKey(id))
      try {
        const program = await ninaClient.useProgram()
        let releaseAccounts = await program.account.release.fetchMultiple(
          releaseIds,
          'confirmed'
        )
        const releases = []
        releaseAccounts.forEach((release, i) => {
          if (release) {
            release.publicKey = releaseIds[i]
            releases.push(release)
          }
        })
        await saveReleasesToState(releases, query)
      } catch (error) {
        console.warn(error)
      }
    }
  }

  const saveReleasesToState = async (releases, query = undefined) => {
    try {
      let updatedState = { ...releaseState }
      let search = undefined

      if (query) {
        search = {
          query,
          searched: true,
          pending: false,
          releases: [],
          releaseIds: releases.map((release) => release.publicKey.toBase58()),
        }
      }

      const metadataQueries = {}
      for await (let release of releases) {
        const releasePubkey = release.publicKey.toBase58()
        release = release.account ? release.account : release
        if (query) {
          let searchResult = {
            releasePubkey,
            tokenData: release,
          }
          search.releases.push(searchResult)
        }

        updatedState = {
          ...updatedState,
          tokenData: {
            ...updatedState.tokenData,
            [releasePubkey]: release,
          },
          releaseMintMap: {
            ...updatedState.releaseMintMap,
            [releasePubkey]: release.releaseMint.toBase58(),
          },
        }

        if (!releaseState.metadata[releasePubkey]) {
          metadataQueries[release.releaseMint.toBase58()] = releasePubkey
        }
      }

      if (Object.keys(metadataQueries).length > 0) {
        let releaseMetadataAccounts = await getReleaseMetadataAccounts(
          metadataQueries,
          query
        )

        if (releaseMetadataAccounts) {
          updatedState.metadata = {
            ...updatedState.metadata,
            ...releaseMetadataAccounts,
          }
        }
      }

      if (query) {
        const finalSearchReleases = []
        search.releases.forEach((release) => {
          if (updatedState.metadata[release.releasePubkey]) {
            release.metadata = updatedState.metadata[release.releasePubkey]
            finalSearchReleases.push(release)
          }
        })
        search.releases = finalSearchReleases
        await setSearchResults(search)
      }
      await setReleaseState(updatedState)
    } catch (error) {
      console.warn(error)
    }
  }

  const saveRedemptionRecordsToState = async (
    redemptionRecords,
    releasePubkey
  ) => {
    let updatedState = { ...releaseState }
    if (!updatedState.redemptionRecords) {
      updatedState.redemptionRecords = {}
    }
    updatedState = {
      ...updatedState,
      redemptionRecords: {
        ...updatedState.redemptionRecords,
        [releasePubkey]: redemptionRecords,
      },
    }
    setReleaseState(updatedState)
  }

  const releaseFetchMetadata = async (releasePubkey) => {
    try {
      const arweaveTxidResult = await fetch(
        `${endpoints.pressingPlant}/api/file/findArweaveTxid?tokenId=${releasePubkey}`
      )
      const arweaveTxidJson = await arweaveTxidResult.json()

      if (arweaveTxidJson.txid) {
        const arweaveMetadataUri = `${endpoints.arweave}/${arweaveTxidJson.txid}`
        const arweaveJsonResult = await fetch(arweaveMetadataUri)
        const arweaveJson = await arweaveJsonResult.json()

        if (arweaveJson) {
          let updatedState = { ...releaseState }
          updatedState.metadata = {
            ...updatedState.metadata,
            [releasePubkey]: arweaveJson,
          }
          setReleaseState(updatedState)
        }

        return {
          json: arweaveJson,
          uri: arweaveMetadataUri,
        }
      }
      return null
    } catch (error) {
      console.warn(error)
    }
  }

  const getReleaseMetadataAccounts = async (metadataQueries) => {
    try {
      const metadataAccountsParsed = {}
      const mints = []

      Object.keys(metadataQueries).map((query) => {
        const releasePubkey = metadataQueries[query]

        if (releaseState.metadata[releasePubkey]) {
          metadataAccountsParsed[releasePubkey] =
            releaseState.metadata[releasePubkey]
        } else {
          mints.push(query)
        }
      })
      const metadataResult = await fetch(`${endpoints.api}/metadata/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Object.values(metadataQueries) }),
      })
      const metadataJson = await metadataResult.json()

      return metadataJson
    } catch (error) {
      console.warn(error)
    }
  }

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

  return {
    releaseInitViaHub,
    releasePurchaseViaHub,
    addRoyaltyRecipient,
    releaseCreate,
    releaseFetchMetadata,
    releasePurchase,
    collectRoyaltyForRelease,
    getRelease,
    getReleasesInCollection,
    getUserCollection,
    getReleasesPublishedByUser,
    getReleasesRecent,
    getReleasesAll,
    getReleaseRoyaltiesByUser,
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
    getRedemptionRecordsForRelease,
    getRedeemablesForRelease,
    getRelatedForRelease,
    getReleasesBySearch,
    filterRelatedForRelease,
    filterSearchResults,
    getCollectorsForRelease,
    initializeReleaseAndMint,
    releaseCreateMetadataJson,
    fetchAndSaveReleasesToState,
    getPublishedHubForRelease,
    getHubsForRelease,
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
