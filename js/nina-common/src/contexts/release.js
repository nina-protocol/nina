import { createContext, useState, useEffect, useContext } from 'react'
import * as anchor from '@project-serum/anchor'
import { useWallet } from '@solana/wallet-adapter-react'
import { ConnectionContext } from './connection'
import { NinaContext } from './nina'
import {
  createMintInstructions,
  findOrCreateAssociatedTokenAccount,
  getProgramAccounts,
  wrapSol,
  getMetadataAccounts,
  getMetadata,
} from '../utils/web3'
import { ninaErrorHandler } from '../utils/errors'
import {
  encryptData,
  exportPublicKey,
  decodeNonEncryptedByteArray,
  decryptData,
} from '../utils/encrypt'
import { createMetadataIx, updateMetadataIx } from '../utils/metaplex/metadata'
import NinaClient from '../utils/client'

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
    releaseUpdateMetadata,
    releaseFetchMetadata,
    releasePurchase,
    collectRoyaltyForRelease,
    addRoyaltyRecipient,
    getRelease,
    getReleasesInCollection,
    getReleasesPublishedByUser,
    getReleaseRoyaltiesByUser,
    filterReleasesUserCollection,
    filterReleasesPublishedByUser,
    filterRoyaltiesByUser,
    calculateStatsByUser,
    redeemableInitialize,
    redeemableRedeem,
    redeemableUpdateShipping,
    getRedemptionRecordsForRelease,
    getRedeemablesForRelease,
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
  })

  return (
    <ReleaseContext.Provider
      value={{
        pressingState,
        resetPressingState,
        releaseCreate,
        releaseUpdateMetadata,
        releaseFetchMetadata,
        releasePurchase,
        releasePurchasePending,
        releaseState,
        collectRoyaltyForRelease,
        addRoyaltyRecipient,
        getRelease,
        getReleasesPublishedByUser,
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
  setNpcAmountHeld
}) => {
  const provider = new anchor.Provider(
    connection,
    wallet,
    anchor.Provider.defaultOptions()
  )

  const releaseCreate = async ({
    retailPrice,
    amount,
    pressingFee,
    artistTokens = 0,
    resalePercentage,
    isUsdc = true,
  }) => {
    setPressingState({
      ...pressingState,
      pending: true,
    })

    try {
      const nina = await NinaClient.connect(provider)

      const vault = await nina.program.account.vault.fetch(
        NinaClient.ids().accounts.vault
      )

      const releaseMint = anchor.web3.Keypair.generate()
      const paymentMint = new anchor.web3.PublicKey(
        isUsdc ? NinaClient.ids().mints.usdc : NinaClient.ids().mints.wsol
      )
      const publishingCreditMint = new anchor.web3.PublicKey(
        NinaClient.ids().mints.publishingCredit
      )
      console.log('publishingCreditMint: ', publishingCreditMint.toBase58())
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

      const [authorityReleaseTokenAccount, authorityReleaseTokenAccountIx] =
        await findOrCreateAssociatedTokenAccount(
          provider.connection,
          provider.wallet.publicKey,
          provider.wallet.publicKey,
          anchor.web3.SystemProgram.programId,
          anchor.web3.SYSVAR_RENT_PUBKEY,
          releaseMint.publicKey,
          true
        )

      const [vaultTokenAccount, vaultTokenAccountIx] =
        await findOrCreateAssociatedTokenAccount(
          provider.connection,
          provider.wallet.publicKey,
          vault.vaultSigner,
          anchor.web3.SystemProgram.programId,
          anchor.web3.SYSVAR_RENT_PUBKEY,
          releaseMint.publicKey,
          true
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

      const data = {
        name: ``,
        symbol: ``,
        uri: ``,
        sellerFeeBasisPoints: resalePercentage * 100,
      }

      const metadataIx = await createMetadataIx(
        data,
        provider.wallet.publicKey.toBase58(),
        releaseMint.publicKey.toBase58(),
        provider.wallet.publicKey.toBase58(),
        provider.wallet.publicKey.toBase58()
      )

      let instructions = [
        ...releaseMintIx,
        metadataIx,
        vaultTokenAccountIx,
        royaltyTokenAccountIx,
        authorityReleaseTokenAccountIx,
      ]

      if (authorityTokenAccountIx) {
        instructions.push(authorityTokenAccountIx)
      }

      if (authorityPublishingCreditTokenAccountIx) {
        instructions.push(authorityPublishingCreditTokenAccountIx)
      }

      const config = {
        amountTotalSupply: new anchor.BN(amount),
        amountToArtistTokenAccount: new anchor.BN(artistTokens),
        amountToVaultTokenAccount: new anchor.BN(pressingFee),
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
          authorityReleaseTokenAccount,
          authorityPublishingCreditTokenAccount,
          publishingCreditMint,
          paymentMint,
          vaultTokenAccount,
          vault: new anchor.web3.PublicKey(NinaClient.ids().accounts.vault),
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
      return ninaErrorHandler(error)
    }
  }

  const releaseUpdateMetadata = async (releasePubkey) => {
    const nina = await NinaClient.connect(provider)
    const arweaveMetadata = await releaseFetchMetadata(releasePubkey)

    if (arweaveMetadata) {
      let release = releaseState.tokenData[releasePubkey]
      if (!release) {
        release = await nina.program.account.release.fetch(
          new anchor.web3.PublicKey(releasePubkey)
        )
      }

      const metadata = await getMetadata(release.releaseMint, connection)
      const ix = await updateMetadataIx(
        arweaveMetadata.json,
        arweaveMetadata.uri,
        undefined,
        true,
        metadata.account.mint,
        wallet.publicKey.toBase58(),
        metadata.pubkey
      )

      const tx = new anchor.web3.Transaction()
      tx.add(ix)
      await provider.send(tx, [])

      let releaseMetadata = await getReleaseMetadata(
        releasePubkey,
        release.releaseMint.toBase58()
      )
      saveReleaseMetadataToState(releasePubkey, releaseMetadata)
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
      getRelease(releasePubkey)
      addReleaseToCollection(releasePubkey)
      return {
        success: true,
        msg: 'Release purchased!',
      }
    } catch (error) {
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
      return ninaErrorHandler(error)
    }
  }

  const addRoyaltyRecipient = async (release, updateData, releasePubkey) => {
    const nina = await NinaClient.connect(provider)

    try {
      if (!release) {
        release = await nina.program.account.release.fetch(
          new anchor.web3.PublicKey(releasePubkey)
        )
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
          release,
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
      return ninaErrorHandler(error)
    }
  }

  /*
    
  RELEASE PROGRAM LOOKUPS

  */

  const fetchRelease = async (releasePubkey) => {
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
  }

  const getRelease = async (releasePubkey) => {
    const releaseAccount = await fetchRelease(releasePubkey)
    if (releaseAccount.error) {
      throw releaseAccount.error
    } else {
      saveReleasesToState([releaseAccount])
    }
  }

  const getReleasesInCollection = async () => {
    const fetchedReleases = []
    for (let releasePubkey of Object.keys(collection)) {
      const releaseAccount = await fetchRelease(releasePubkey)
      fetchedReleases.push(releaseAccount)
    }
    if (fetchedReleases.length > 0) {
      saveReleasesToState(fetchedReleases)
    }
  }

  const getReleasesPublishedByUser = async (user = null, handle) => {
    const nina = await NinaClient.connect(provider)

    if (!user) {
      if (!wallet?.publicKey) {
        return
      }

      user = wallet?.publicKey.toBase58()
    }

    let releaseAccounts = await getProgramAccounts(
      nina.program,
      'Release',
      { authority: user },
      connection
    )
    if (releaseAccounts.error) {
      throw releaseAccounts.error
    } else {
      if (releaseAccounts.length > 0) {
        saveReleasesToState(releaseAccounts, handle)
      }
    }
  }

  const getRedeemablesForRelease = async (releasePubkey) => {
    const nina = await NinaClient.connect(provider)
    let redeemableAccounts = await getProgramAccounts(
      nina.program,
      'Redeemable',
      { release: releasePubkey },
      connection
    )
    const parsedRedeemables = {}
    for await (let redeemable of redeemableAccounts) {
      try {
        let releasePubkey = redeemable.release.toBase58()
        redeemable.description = decodeNonEncryptedByteArray(
          redeemable?.description
        )
        parsedRedeemables[releasePubkey] = redeemable
      } catch (error) {
        console.warn('Redeemable Error: ', error)
      }
    }

    if (redeemableAccounts.error) {
      throw redeemableAccounts.error
    } else {
      setRedeemableState({
        ...redeemableState,
        ...parsedRedeemables,
      })
    }
  }

  const getRedemptionRecordsForRelease = async (releasePubkey) => {
    const release = releaseState.tokenData[releasePubkey]
    if (!release) {
      return
    }

    const nina = await NinaClient.connect(provider)
    const filter = {
      release: releasePubkey,
    }

    if (wallet?.publicKey.toBase58() !== release.authority.toBase58()) {
      filter.redeemer = wallet?.publicKey.toBase58()
    }

    let redemptionRecords = await getProgramAccounts(
      nina.program,
      'RedemptionRecord',
      filter,
      connection
    )

    if (redemptionRecords.error) {
      throw redemptionRecords.error
    } else {
      const parsedRedemptionRecords = []
      for (let redemptionRecord of redemptionRecords) {
        try {
          const redeemable = await nina.program.account.redeemable.fetch(
            redemptionRecord.redeemable
          )
          const otherPartyEncryptionKey =
            wallet?.publicKey.toBase58() === redeemable.authority.toBase58()
              ? redemptionRecord.encryptionPublicKey
              : redeemable.encryptionPublicKey
          if (!redemptionRecord.address.every((item) => item === 0)) {
            redemptionRecord.address = await decryptData(
              redemptionRecord.address,
              otherPartyEncryptionKey,
              redemptionRecord.iv
            )
          }
          if (!redemptionRecord.shipper.every((item) => item === 0)) {
            redemptionRecord.shipper = await decryptData(
              redemptionRecord.shipper,
              otherPartyEncryptionKey,
              redemptionRecord.iv
            )
          } else {
            redemptionRecord.shipper = undefined
          }
          if (!redemptionRecord.trackingNumber.every((item) => item === 0)) {
            redemptionRecord.trackingNumber = await decryptData(
              redemptionRecord.trackingNumber,
              otherPartyEncryptionKey,
              redemptionRecord.iv
            )
          } else {
            redemptionRecord.trackingNumber = undefined
          }
          if (redeemable.authority.toBase58() === wallet.publicKey.toBase58()) {
            redemptionRecord.userIsPublisher = true
          } else {
            redemptionRecord.userIsPublisher = false
          }

          parsedRedemptionRecords.push(redemptionRecord)
        } catch (error) {
          console.warn('error: ', error)
        }
      }
      saveRedemptionRecordsToState(parsedRedemptionRecords, releasePubkey)
    }
  }

  const getReleaseRoyaltiesByUser = async () => {
    if (!connection) {
      return
    }
    const nina = await NinaClient.connect(provider)
    let releaseAccounts = await getProgramAccounts(
      nina,
      'RoyaltyRecipient',
      { recipient_authority: wallet?.publicKey.toBase58() },
      connection
    )

    if (releaseAccounts.error) {
      throw releaseAccounts.error
    } else {
      saveReleasesToState(releaseAccounts)
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

  const filterReleasesPublishedByUser = (userPubkey = undefined) => {
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

      if (tokenData.authority.toBase58() === userPubkey && metadata) {
        releases.push({ tokenData, metadata, releasePubkey })
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

  const saveReleaseMetadataToState = async (releasePubkey, releaseMetadata) => {
    let updatedState = { ...releaseState }
    if (releaseMetadata) {
      updatedState.metadata = {
        ...updatedState.metadata,
        ...releaseMetadata,
      }
    }
    setReleaseState(updatedState)
  }

  const saveReleasesToState = async (releases, handle = undefined) => {
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

      setSearchResults(search)
    }
    setReleaseState(updatedState)
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
    const arweaveTxidResult = await fetch(
      `${NinaClient.endpoints.pressingPlant}/api/file/findArweaveTxid?tokenId=${releasePubkey}`
    )
    const arweaveTxidJson = await arweaveTxidResult.json()

    if (arweaveTxidJson.txid) {
      const arweaveMetadataUri = `${NinaClient.endpoints.arweave}/${arweaveTxidJson.txid}`
      const arweaveJsonResult = await fetch(arweaveMetadataUri)
      const arweaveJson = await arweaveJsonResult.json()
      return {
        json: arweaveJson,
        uri: arweaveMetadataUri,
      }
    }
    return null
  }

  const getReleaseMetadata = async (
    releasePubkey,
    releaseMint,
    isSearch = undefined
  ) => {
    if (isSearch && releaseState.metadata[releasePubkey]) {
      return { [releasePubkey]: releaseState.metadata[releasePubkey] }
    }

    if (releaseState.metadata[releasePubkey]) {
      return
    }

    const metadata = await getMetadata(releaseMint, connection)
    if (metadata?.account?.data.uri && metadata.account.data.uri != '') {
      const arweaveJsonResult = await fetch(metadata.account.data.uri)
      if (arweaveJsonResult.status === 200) {
        const metadataJson = await arweaveJsonResult.json()
        return { [releasePubkey]: metadataJson }
      }
    }
    return undefined
  }

  const getReleaseMetadataAccounts = async (metadataQueries) => {
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

    const metadataAccounts = await getMetadataAccounts(mints, connection)

    for await (let mint of Object.keys(metadataAccounts)) {
      const metadata = metadataAccounts[mint]
      const releasePubkey = metadataQueries[mint]
      if (metadata?.account?.data.uri && metadata.account.data.uri != '') {
        const arweaveJsonResult = await fetch(metadata.account.data.uri)
        if (arweaveJsonResult.status === 200) {
          const metadataJson = await arweaveJsonResult.json()
          metadataAccountsParsed[releasePubkey] = metadataJson
        }
      }
    }

    return metadataAccountsParsed
  }

  return {
    addRoyaltyRecipient,
    releaseCreate,
    releaseUpdateMetadata,
    releaseFetchMetadata,
    releasePurchase,
    collectRoyaltyForRelease,
    getRelease,
    getReleasesInCollection,
    getReleasesPublishedByUser,
    getReleaseRoyaltiesByUser,
    filterReleasesUserCollection,
    filterReleasesPublishedByUser,
    filterRoyaltiesByUser,
    calculateStatsByUser,
    redeemableInitialize,
    redeemableRedeem,
    redeemableUpdateShipping,
    getRedemptionRecordsForRelease,
    getRedeemablesForRelease,
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
