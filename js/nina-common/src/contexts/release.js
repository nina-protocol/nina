import { createContext, useState, useEffect, useContext } from 'react'
import * as anchor from '@project-serum/anchor'
import { useWallet } from '@solana/wallet-adapter-react'
import { ConnectionContext } from './connection'
import { NinaContext } from './nina'
import {
  createMintInstructions,
  findOrCreateAssociatedTokenAccount,
  wrapSol,
} from '../utils/web3'
import { ninaErrorHandler } from '../utils/errors'
import {
  encryptData,
  exportPublicKey,
  decodeNonEncryptedByteArray,
  decryptData,
} from '../utils/encrypt'
import NinaClient from '../utils/client'

const lookupTypes = {
  PUBLISHED_BY: 'published_by',
  REVENUE_SHARE: 'revenue_share',
}
export const ReleaseContext = createContext()
const ReleaseContextProvider = ({ children }) => {
  const wallet = useWallet()
  const {
    addReleaseToCollection,
    collection,
    getUsdcBalance,
    removeReleaseFromCollection,
  } = useContext(NinaContext)
  const { connection } = useContext(ConnectionContext)
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
  })
  const [allReleases, setAllReleases] = useState([])
  const [allReleasesCount, setAllReleasesCount] = useState(null)

  useEffect(() => {
    getReleasesInCollection()
  }, [collection])

  const resetSearchResults = () => {
    setSearchResults(searchResultsInitialState)
  }

  const emptySearchResults = (query) => {
    setSearchResults({
      releases: [],
      searched: true,
      handle: query,
    })
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
    filterReleasesUserCollection,
    filterReleasesPublishedByUser,
    filterReleasesRecent,
    filterReleasesAll,
    filterRoyaltiesByUser,
    calculateStatsByUser,
    redeemableInitialize,
    redeemableRedeem,
    redeemableUpdateShipping,
    getRedemptionRecordsForRelease,
    getRedeemablesForRelease,
    getRelatedForRelease,
    filterRelatedForRelease,
  } = releaseContextHelper({
    releaseState,
    setReleaseState,
    pressingState,
    setPressingState,
    releasePurchasePending,
    setReleasePurchasePending,
    wallet,
    connection,
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
        filterReleasesUserCollection,
        filterReleasesPublishedByUser,
        filterRoyaltiesByUser,
        calculateStatsByUser,
        redeemableInitialize,
        redeemableRedeem,
        searchResults,
        resetSearchResults,
        emptySearchResults,
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
      }}
    >
      {children}
    </ReleaseContext.Provider>
  )
}
export default ReleaseContextProvider

const releaseContextHelper = ({
  releaseState,
  setReleaseState,
  pressingState,
  setPressingState,
  releasePurchasePending,
  setReleasePurchasePending,
  addReleaseToCollection,
  wallet,
  connection,
  getUsdcBalance,
  encryptData,
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
}) => {
  const provider = new anchor.Provider(
    connection,
    wallet,
    anchor.Provider.defaultOptions()
  )

  const releaseCreate = async ({
    retailPrice,
    amount,
    resalePercentage,
    isUsdc = true,
  }) => {
    setPressingState({
      ...pressingState,
      pending: true,
    })

    try {
      const nina = await NinaClient.connect(provider)

      const releaseMint = anchor.web3.Keypair.generate()
      const paymentMint = new anchor.web3.PublicKey(
        isUsdc ? NinaClient.ids().mints.usdc : NinaClient.ids().mints.wsol
      )
      const publishingCreditMint = new anchor.web3.PublicKey(
        NinaClient.ids().mints.publishingCredit
      )
      const [release, releaseBump] =
        await anchor.web3.PublicKey.findProgramAddress(
          [
            Buffer.from(anchor.utils.bytes.utf8.encode('nina-release')),
            releaseMint.publicKey.toBuffer(),
          ],
          nina.program.programId
        )

      const [releaseSigner, releaseSignerBump] =
        await anchor.web3.PublicKey.findProgramAddress(
          [release.toBuffer()],
          nina.program.programId
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

      const config = {
        amountTotalSupply: new anchor.BN(amount),
        amountToArtistTokenAccount: new anchor.BN(0),
        amountToVaultTokenAccount: new anchor.BN(0),
        resalePercentage: new anchor.BN(resalePercentage * 10000),
        price: new anchor.BN(NinaClient.uiToNative(retailPrice, paymentMint)),
        releaseDatetime: new anchor.BN(Date.now() / 1000),
      }

      const bumps = {
        release: releaseBump,
        signer: releaseSignerBump,
      }

      const txid = await nina.program.rpc.releaseInitWithCredit(config, bumps, {
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
          systemProgram: anchor.web3.SystemProgram.programId,
          tokenProgram: NinaClient.TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        },
        signers: [releaseMint],
        instructions,
      })
      await provider.connection.getParsedConfirmedTransaction(txid, 'confirmed')

      await getRelease(release)

      setPressingState({
        ...pressingState,
        pending: false,
        completed: true,
      })
      return true
    } catch (error) {
      setPressingState({
        pending: false,
        completed: false,
      })
      return ninaErrorHandler(error)
    }
  }

  const releasePurchase = async (releasePubkey) => {
    const nina = await NinaClient.connect(provider)

    let release = releaseState.tokenData[releasePubkey]
    if (!release) {
      release = await nina.program.account.release.fetch(
        new anchor.web3.PublicKey(releasePubkey)
      )
    }

    setReleasePurchasePending({
      ...releasePurchasePending,
      [releasePubkey]: true,
    })

    try {
      let [payerTokenAccount] = await findOrCreateAssociatedTokenAccount(
        connection,
        provider.wallet.publicKey,
        provider.wallet.publicKey,
        anchor.web3.SystemProgram.programId,
        anchor.web3.SYSVAR_RENT_PUBKEY,
        release.paymentMint
      )

      let [purchaserReleaseTokenAccount, purchaserReleaseTokenAccountIx] =
        await findOrCreateAssociatedTokenAccount(
          connection,
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
          purchaser: provider.wallet.publicKey,
          purchaserReleaseTokenAccount,
          royaltyTokenAccount: release.royaltyTokenAccount,
          releaseMint: release.releaseMint,
          tokenProgram: NinaClient.TOKEN_PROGRAM_ID,
          clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
        },
      }

      const instructions = []
      if (purchaserReleaseTokenAccountIx) {
        instructions.push(purchaserReleaseTokenAccountIx)
      }

      if (instructions.length > 0) {
        request.instructions = instructions
      }

      if (NinaClient.isSol(release.paymentMint)) {
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

      const txid = await nina.program.rpc.releasePurchase(
        release.price,
        request
      )
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
    const nina = await NinaClient.connect(provider)

    try {
      let release = releaseState.tokenData[releasePubkey]
      if (!release) {
        release = await nina.program.account.release.fetch(
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
          releaseSigner: release.releaseSigner,
          royaltyTokenAccount: release.royaltyTokenAccount,
          tokenProgram: NinaClient.TOKEN_PROGRAM_ID,
        },
      }

      if (authorityTokenAccountIx) {
        request.instructions = [authorityTokenAccountIx]
      }

      const txid = await nina.program.rpc.releaseRevenueShareCollect(request)
      await provider.connection.getParsedConfirmedTransaction(txid, 'confirmed')

      getRelease(releasePubkey)
      getUsdcBalance()
      return {
        success: true,
        msg: `You collected $${NinaClient.nativeToUi(
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
    const nina = await NinaClient.connect(provider)
    const releasePublicKey = new anchor.web3.PublicKey(releasePubkey)
    try {
      if (!release) {
        release = await nina.program.account.release.fetch(releasePublicKey)
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
          releaseSigner: release.releaseSigner,
          royaltyTokenAccount: release.royaltyTokenAccount,
          newRoyaltyRecipient: recipientPublicKey,
          newRoyaltyRecipientTokenAccount,
          tokenProgram: NinaClient.TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        },
      }

      if (newRoyaltyRecipientTokenAccountIx) {
        request.instructions = [newRoyaltyRecipientTokenAccountIx]
      }

      if (authorityTokenAccountIx) {
        request.instructions = [authorityTokenAccountIx]
      }

      const txid = await nina.program.rpc.releaseRevenueShareTransfer(
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
    const nina = await NinaClient.connect(provider)

    try {
      const encryptionPublicKey = await exportPublicKey()
      const encryptionPublicKeyBuffer = Buffer.from(encryptionPublicKey)

      const release = new anchor.web3.PublicKey(releasePubkey)
      const releaseAccount = await nina.program.account.release.fetch(release)
      const redeemedTokenMint = anchor.web3.Keypair.generate()

      const [redeemable, redeemableBump] =
        await anchor.web3.PublicKey.findProgramAddress(
          [
            Buffer.from(anchor.utils.bytes.utf8.encode('nina-redeemable')),
            release.toBuffer(),
            redeemedTokenMint.publicKey.toBuffer(),
          ],
          nina.program.programId
        )
      const [redeemableSigner, redeemableSignerBump] =
        await anchor.web3.PublicKey.findProgramAddress(
          [
            Buffer.from(
              anchor.utils.bytes.utf8.encode('nina-redeemable-signer')
            ),
            redeemable.toBuffer(),
          ],
          nina.program.programId
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

      const txid = await nina.program.rpc.redeemableInit(config, bumps, {
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
    const nina = await NinaClient.connect(provider)
    try {
      const redemptionRecord = anchor.web3.Keypair.generate()
      const redemptionRecordIx =
        await nina.program.account.redemptionRecord.createInstruction(
          redemptionRecord
        )

      const release = new anchor.web3.PublicKey(releasePubkey)
      const releaseAccount = await nina.program.account.release.fetch(release)

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
          tokenProgram: NinaClient.TOKEN_PROGRAM_ID,
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

      const txid = await nina.program.rpc.redeemableRedeem(
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
      const nina = await NinaClient.connect(provider)
      const redeemable = new anchor.web3.PublicKey(redeemablePubkey)

      const redemptionRecord = new anchor.web3.PublicKey(redemptionRecordPubkey)
      const redemptionRecordAccount =
        await nina.program.account.redemptionRecord.fetch(redemptionRecord)
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

      const txid = await nina.program.rpc.redeemableShippingUpdate(
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
      const nina = await NinaClient.connect(provider)
      const redeemable = new anchor.web3.PublicKey(redeemablePubkey)
      const redeemableAccount = await nina.program.account.redeemable.fetch(
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
      const nina = await NinaClient.connect(provider)
      releasePubkey = new anchor.web3.PublicKey(releasePubkey)

      const releaseAccount = await nina.program.account.release.fetch(
        releasePubkey
      )
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
    console.log('GETTING RELEASE:', releasePubkey);
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
    if (!connection) {
      return
    }
    try {
      let path = NinaClient.endpoints.api
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
    if (!connection) {
      return
    }
    if (recipient?.percentShare?.toNumber() > 0) {
      try {
        let path = NinaClient.endpoints.api
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
    await getReleasesHandler(publicKey, lookupTypes.PUBLISHED_BY)
  }

  const getRelatedForRelease = async (releasePubkey) => {
    let release = releaseState.tokenData[releasePubkey]
    if (!release) {
      release = await fetchRelease(releasePubkey)
    }
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
    await fetchAndSaveReleasesToState([...filteredReleaseIds])
  }

  const getRedeemablesForRelease = async (releasePubkey) => {
    try {
      const response = await fetch(`/releases/${releasePubkey}/redeemables`)
      const redeemableIds = await response.json()
      const parsedRedeemables = {}

      const nina = await NinaClient.connect(provider)
      let redeemableAccounts = await anchor.utils.rpc.getMultipleAccounts(
        connection,
        redeemableIds.map((id) => new anchor.web3.PublicKey(id))
      )

      const layout =
        nina.program.coder.accounts.accountLayouts.get('Redeemable')
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
      const nina = await NinaClient.connect(provider)
      const release = await nina.program.account.release.fetch(releasePubkey)
      const parsedRedemptionRecords = []

      if (!release) {
        return
      }

      let authority
      if (wallet?.publicKey.toBase58() !== release.authority.toBase58()) {
        authority = wallet?.publicKey.toBase58()
      }
      const response = await fetch(
        `/releases/${releasePubkey}/redemptionRecords${
          authority ? `/${wallet.publicKey.toBase58()}` : ''
        }`
      )
      const redemptionRecordIds = await response.json()
      let redemptionRecords = await anchor.utils.rpc.getMultipleAccounts(
        connection,
        redemptionRecordIds.map((id) => new anchor.web3.PublicKey(id))
      )

      const layout =
        nina.program.coder.accounts.accountLayouts.get('RedemptionRecord')
      for await (let redemptionRecord of redemptionRecords) {
        let dataParsed = layout.decode(redemptionRecord.account.data.slice(8))
        const redeemable = await nina.program.account.redeemable.fetch(
          dataParsed.redeemable
        )

        dataParsed.publicKey = redemptionRecord.publicKey
        const otherPartyEncryptionKey =
          wallet?.publicKey.toBase58() === redeemable.authority.toBase58()
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
        if (redeemable.authority.toBase58() === wallet.publicKey.toBase58()) {
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
      const result = await fetch(
        `${NinaClient.endpoints.api}/releases/recent20`
      )
      const { published, purchased } = await result.json()
      const releaseIds = [...published, ...purchased]
      await fetchAndSaveReleasesToState(releaseIds)

      setReleasesRecentState({
        published,
        purchased,
      })
    } catch (error) {
      console.warn(error)
    }
  }

  const getReleasesAll = async () => {
    try {
      const all = [...allReleases]
      const result = await fetch(
        `${NinaClient.endpoints.api}/releases/?offset=${allReleases.length}`
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

  /*

  STATE FILTERS

  */
  const filterReleasesUserCollection = () => {
    if (!wallet?.connected) {
      return
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

    return {
      published: releasesPublished,
      purchased: releasesPurchased,
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

  const filterReleasesPublishedByUser = (userPubkey = undefined) => {
    // if (!wallet?.connected || (!userPubkey && !wallet?.publicKey)) {
    //   return
    // }
    // Return results for passed in user if another user isn't specified
    if (!userPubkey) {
      userPubkey = wallet?.publicKey.toBase58()
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
    if (!wallet?.connected || (!userPubkey && !wallet?.publicKey)) {
      return
    }
    // Return results for passed in user if another user isn't specified
    if (!userPubkey) {
      userPubkey = wallet?.publicKey.toBase58()
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
            royaltyOwed += NinaClient.nativeToUi(owed, release.paymentMint)
          }
          royaltyCollected += NinaClient.nativeToUi(
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
    if (!wallet?.connected || (!userPubkey && !wallet?.publicKey)) {
      return
    }
    // Return results for passed in user if another user isn't specified
    if (!userPubkey) {
      userPubkey = wallet?.publicKey.toBase58()
    }

    const releases = filterReleasesPublishedByUser(userPubkey)

    let salesCount = 0
    let salesAmountUsdc = 0
    let salesAmountSol = 0
    let secondarySalesCount = 0
    let secondarySalesAmountUsdc = 0
    let secondarySalesAmountSol = 0

    releases.forEach((release) => {
      if (NinaClient.isUsdc(release.paymentMint)) {
        salesAmountUsdc += release.saleTotal.toNumber()
        secondarySalesAmountUsdc += release.exchangeSaleTotal.toNumber()
      } else if (NinaClient.isSol(release.paymentMint)) {
        salesAmountSol += release.saleTotal.toNumber()
        secondarySalesAmountSol += release.exchangeSaleTotal.toNumber()
      }
      salesCount += release.saleCounter.toNumber()
      secondarySalesCount += release.exchangeSaleCounter.toNumber()
    })

    return {
      publishedCount: releases.length,
      salesCount,
      salesAmountUsdc: NinaClient.nativeToUi(
        salesAmountUsdc,
        NinaClient.ids().mints.usdc
      ),
      salesAmountSol: NinaClient.nativeToUi(
        salesAmountSol,
        NinaClient.ids().mints.wsol
      ),
      secondarySalesCount,
      secondarySalesAmountUsdc: NinaClient.nativeToUi(
        secondarySalesAmountUsdc,
        NinaClient.ids().mints.usdc
      ),
      secondarySalesAmountSol: NinaClient.nativeToUi(
        secondarySalesAmountSol,
        NinaClient.ids().mints.wsol
      ),
    }
  }

  const calculateStatsByUser = (userPubkey = undefined) => {
    if (!wallet?.connected || (!userPubkey && !wallet?.publicKey)) {
      return
    }
    // Return results for passed in user if another user isn't specified
    if (!userPubkey) {
      userPubkey = wallet?.publicKey.toBase58()
    }

    return {
      ...calculateReleaseStatsByUser(userPubkey),
      ...calculateRoyaltyStatsForUser(userPubkey),
    }
  }

  /*

  UTILS

  */

  const fetchAndSaveReleasesToState = async (releaseIds) => {
    if (releaseIds.length > 0) {
      releaseIds = releaseIds.filter(
        (id) => !Object.keys(releaseState.tokenData).includes(id)
      )
      releaseIds = releaseIds.filter((id, pos) => releaseIds.indexOf(id) == pos)
      releaseIds = releaseIds.map((id) => new anchor.web3.PublicKey(id))
      try {
        const nina = await NinaClient.connect(provider)
        let releaseAccounts = await anchor.utils.rpc.getMultipleAccounts(
          connection,
          releaseIds
        )
        const layout = nina.program.coder.accounts.accountLayouts.get('Release')
        releaseAccounts = releaseAccounts.map((release) => {
          let dataParsed = layout.decode(release.account.data.slice(8))
          dataParsed.publicKey = release.publicKey
          return dataParsed
        })
        return await saveReleasesToState(releaseAccounts)
      } catch (error) {
        console.warn(error)
      }
    }
  }

  const saveReleasesToState = async (releases, handle = undefined) => {
    try {
      let updatedState = { ...releaseState }
      let search = undefined

      if (handle) {
        search = {
          handle,
          searched: true,
          releases: [],
        }
      }

      const metadataQueries = {}
      for await (let release of releases) {
        const releasePubkey = release.publicKey.toBase58()
        release = release.account ? release.account : release
        if (handle) {
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
          handle
        )

        if (releaseMetadataAccounts) {
          updatedState.metadata = {
            ...updatedState.metadata,
            ...releaseMetadataAccounts,
          }
        }
      }

      if (handle) {
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
        `${NinaClient.endpoints.pressingPlant}/api/file/findArweaveTxid?tokenId=${releasePubkey}`
      )
      const arweaveTxidJson = await arweaveTxidResult.json()

      if (arweaveTxidJson.txid) {
        const arweaveMetadataUri = `${NinaClient.endpoints.arweave}/${arweaveTxidJson.txid}`
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
      const metadataResult = await fetch(
        `${NinaClient.endpoints.api}/metadata/bulk`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: Object.values(metadataQueries) }),
        }
      )
      const metadataJson = await metadataResult.json()

      return metadataJson
    } catch (error) {
      console.warn(error)
    }
  }

  return {
    addRoyaltyRecipient,
    releaseCreate,
    releaseFetchMetadata,
    releasePurchase,
    collectRoyaltyForRelease,
    getRelease,
    getReleasesInCollection,
    getReleasesPublishedByUser,
    getReleasesRecent,
    getReleasesAll,
    getReleaseRoyaltiesByUser,
    filterReleasesUserCollection,
    filterReleasesPublishedByUser,
    filterReleasesRecent,
    filterReleasesAll,
    filterRoyaltiesByUser,
    calculateStatsByUser,
    redeemableInitialize,
    redeemableRedeem,
    redeemableUpdateShipping,
    getRedemptionRecordsForRelease,
    getRedeemablesForRelease,
    getRelatedForRelease,
    filterRelatedForRelease,
  }
}

const defaultPressingState = {
  releasePubkey: undefined,
  completed: false,
  pending: false,
}

const searchResultsInitialState = {
  releases: [],
  searched: false,
  handle: '',
}
