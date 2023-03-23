import React, { createContext, useContext, useState } from 'react'
import * as anchor from '@project-serum/anchor'
import { ninaErrorHandler } from '../../utils/errors'
import {
  findAssociatedTokenAddress,
  findOrCreateAssociatedTokenAccount,
} from '../../utils/web3'
import { decodeNonEncryptedByteArray } from '../../utils/encrypt'
import Release from '../Release'
import Nina from '../Nina'
import NinaSdk from '@nina-protocol/js-sdk'
import { getConfirmTransaction, shuffle } from '../../utils'
import MD5 from 'crypto-js/md5'
import { logEvent } from '../../utils/event'
import { initSdkIfNeeded } from '../../utils/sdkInit'
const axios = require('axios')

const HubContext = createContext()
const HubContextProvider = ({ children }) => {
  const { releaseState, setReleaseState, getRelease } = useContext(
    Release.Context
  )
  const {
    ninaClient,
    savePostsToState,
    postState,
    setPostState,
    verificationState,
    setVerificationState,
    solBalance,
  } = useContext(Nina.Context)
  const [hubState, setHubState] = useState({})
  const [hubCollaboratorsState, setHubCollaboratorsState] = useState({})
  const [hubContentState, setHubContentState] = useState({})
  const [hubContentFetched, setHubContentFetched] = useState(new Set())
  const [initialLoad, setInitialLoad] = useState(false)
  const [addToHubQueue, setAddToHubQueue] = useState(new Set())
  const [hubsCount, setHubsCount] = useState(0)
  const [allHubs, setAllHubs] = useState([])
  const [featuredHubs, setFeaturedHubs] = useState()
  const [fetchedHubsForUser, setFetchedHubsForUser] = useState(new Set())
  const {
    getHubs,
    getHub,
    getHubsForUser,
    getHubsForRelease,
    filterHubsForRelease,
    hubInitWithCredit,
    hubUpdateConfig,
    hubAddCollaborator,
    hubUpdateCollaboratorPermission,
    hubAddRelease,
    hubRemoveCollaborator,
    hubContentToggleVisibility,
    hubWithdraw,
    postInitViaHub,
    postUpdateViaHubPost,
    filterHubCollaboratorsForHub,
    filterHubContentForHub,
    filterHubsForUser,
    collectRoyaltyForReleaseViaHub,
    getHubPubkeyForHubHandle,
    validateHubHandle,
    filterFeaturedHubs,
    filterHubsAll,
    getHubFeePending,
  } = hubContextHelper({
    ninaClient,
    savePostsToState,
    hubState,
    setHubState,
    hubCollaboratorsState,
    setHubCollaboratorsState,
    hubContentState,
    setHubContentState,
    postState,
    setPostState,
    initialLoad,
    setInitialLoad,
    getRelease,
    addToHubQueue,
    setAddToHubQueue,
    allHubs,
    setAllHubs,
    hubsCount,
    setHubsCount,
    featuredHubs,
    setFeaturedHubs,
    hubContentFetched,
    setHubContentFetched,
    releaseState,
    setReleaseState,
    fetchedHubsForUser,
    setFetchedHubsForUser,
    verificationState,
    setVerificationState,
    solBalance,
  })

  return (
    <HubContext.Provider
      value={{
        getHubs,
        getHub,
        getHubsForUser,
        getHubsForRelease,
        filterHubsForRelease,
        hubInitWithCredit,
        hubUpdateConfig,
        hubAddCollaborator,
        hubUpdateCollaboratorPermission,
        hubAddRelease,
        hubRemoveCollaborator,
        hubContentToggleVisibility,
        hubWithdraw,
        postInitViaHub,
        postUpdateViaHubPost,
        hubState,
        hubCollaboratorsState,
        hubContentState,
        getHubFeePending,
        filterHubCollaboratorsForHub,
        filterHubContentForHub,
        filterHubsForUser,
        initialLoad,
        collectRoyaltyForReleaseViaHub,
        getHubPubkeyForHubHandle,
        validateHubHandle,
        addToHubQueue,
        featuredHubs,
        setFeaturedHubs,
        filterFeaturedHubs,
        filterHubsAll,
        hubContentFetched,
        fetchedHubsForUser,
      }}
    >
      {children}
    </HubContext.Provider>
  )
}

const hubContextHelper = ({
  ninaClient,
  hubState,
  setHubState,
  hubCollaboratorsState,
  setHubCollaboratorsState,
  hubContentState,
  setHubContentState,
  postState,
  setPostState,
  getRelease,
  addToHubQueue,
  setAddToHubQueue,
  allHubs,
  setAllHubs,
  featuredHubs,
  setFeaturedHubs,
  hubContentFetched,
  setHubContentFetched,
  releaseState,
  setReleaseState,
  fetchedHubsForUser,
  setFetchedHubsForUser,
  verificationState,
  setVerificationState,
  solBalance,
}) => {
  const { ids, provider, endpoints } = ninaClient

  const hubInitWithCredit = async (hubParams) => {
    try {
        logEvent('hub_init_with_credit_initiated', 'engagement', {
        hub: hub.toBase58(),
        wallet: provider.wallet.publicKey.toBase58(),
      })
      await initSdkIfNeeded()
      const hub = await NinaSdk.Hub.hubInitWithCredit(hubParams, provider.wallet, provider.connection)
 
      logEvent('hub_init_with_credit_success', 'engagement', {
        hub: hub.toBase58(),
        wallet: provider.wallet.publicKey.toBase58(),
      })

      if (hub) {
        return {
          success: true,
          msg: 'Hub Created',
          hubPubkey: hub,
        }
      }
    } catch (error) {
      logEvent('hub_init_with_credit_failure', 'engagement', {
        wallet: provider.wallet.publicKey.toBase58(),
        solBalance,
      })

      return ninaErrorHandler(error)
    }
  }

  const hubUpdateConfig = async (hubPubkey, uri, publishFee, referralFee) => {
    const hub = hubState[hubPubkey]
    const program = await ninaClient.useProgram()
    try {
      const txid = await program.rpc.hubUpdateConfig(
        uri,
        hub.handle,
        new anchor.BN(publishFee * 10000),
        new anchor.BN(referralFee * 10000),
        {
          accounts: {
            authority: provider.wallet.publicKey,
            hub: new anchor.web3.PublicKey(hubPubkey),
          },
        }
      )

      await getConfirmTransaction(txid, provider.connection)
      await axios.get(
        `${process.env.NINA_API_ENDPOINT}/hubs/${hubPubkey}/tx/${txid}`
      )
      await getHub(hubPubkey)

      return {
        success: true,
        msg: 'Hub Updated',
        hubPubkey: hub,
      }
    } catch (error) {
      return ninaErrorHandler(error)
    }
  }

  const hubAddCollaborator = async (
    collaboratorPubkey,
    hubPubkey,
    canAddContent,
    canAddCollaborator,
    allowance = 1
  ) => {
    try {
      const hub = hubState[hubPubkey]
      const program = await ninaClient.useProgram()
      collaboratorPubkey = new anchor.web3.PublicKey(collaboratorPubkey)
      hubPubkey = new anchor.web3.PublicKey(hubPubkey)
      const [hubCollaborator] = await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from(anchor.utils.bytes.utf8.encode('nina-hub-collaborator')),
          hubPubkey.toBuffer(),
          collaboratorPubkey.toBuffer(),
        ],
        program.programId
      )
      const [authorityHubCollaborator] =
        await anchor.web3.PublicKey.findProgramAddress(
          [
            Buffer.from(
              anchor.utils.bytes.utf8.encode('nina-hub-collaborator')
            ),
            hubPubkey.toBuffer(),
            provider.wallet.publicKey.toBuffer(),
          ],
          program.programId
        )

      const txid = await program.rpc.hubAddCollaborator(
        canAddContent,
        canAddCollaborator,
        allowance,
        hub.handle,
        {
          accounts: {
            authority: provider.wallet.publicKey,
            authorityHubCollaborator,
            hub: hubPubkey,
            hubCollaborator,
            collaborator: collaboratorPubkey,
            systemProgram: anchor.web3.SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          },
        }
      )

      await getConfirmTransaction(txid, provider.connection)
      await axios.get(
        endpoints.api +
          `/hubs/${hubPubkey}/collaborators/${hubCollaborator.toBase58()}`
      )
      await getHub(hubPubkey)

      return {
        success: true,
        msg: 'Collaborator Added to hub',
      }
    } catch (error) {
      return ninaErrorHandler(error)
    }
  }

  const hubUpdateCollaboratorPermission = async (
    collaboratorPubkey,
    hubPubkey,
    canAddContent,
    canAddCollaborator,
    allowance = 1
  ) => {
    try {
      const hub = hubState[hubPubkey]
      const program = await ninaClient.useProgram()
      collaboratorPubkey = new anchor.web3.PublicKey(collaboratorPubkey)
      hubPubkey = new anchor.web3.PublicKey(hubPubkey)

      const [hubCollaborator] = await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from(anchor.utils.bytes.utf8.encode('nina-hub-collaborator')),
          hubPubkey.toBuffer(),
          collaboratorPubkey.toBuffer(),
        ],
        program.programId
      )

      const [authorityHubCollaborator] =
        await anchor.web3.PublicKey.findProgramAddress(
          [
            Buffer.from(
              anchor.utils.bytes.utf8.encode('nina-hub-collaborator')
            ),
            hubPubkey.toBuffer(),
            provider.wallet.publicKey.toBuffer(),
          ],
          program.programId
        )

      const txid = await program.rpc.hubUpdateCollaboratorPermissions(
        canAddContent,
        canAddCollaborator,
        allowance,
        hub.handle,
        {
          accounts: {
            authority: provider.wallet.publicKey,
            authorityHubCollaborator,
            hub: hubPubkey,
            hubCollaborator,
            collaborator: collaboratorPubkey,
          },
        }
      )
      await getConfirmTransaction(txid, provider.connection)
      await getHub(hubPubkey)

      return {
        success: true,
        msg: 'Hub Collaborator Permissions Updated',
      }
    } catch (error) {
      return ninaErrorHandler(error)
    }
  }

  const hubAddRelease = async (hubPubkey, releasePubkey, fromHub) => {
    try {
      logEvent('hub_add_release_initiated', 'engagement', {
        release: releasePubkey,
        hub: hubPubkey,
        wallet: provider.wallet.publicKey.toBase58(),
      })

      let queue = new Set(addToHubQueue)
      queue.add(releasePubkey)
      setAddToHubQueue(queue)

      const hub = hubState[hubPubkey]
      const program = await ninaClient.useProgram()
      hubPubkey = new anchor.web3.PublicKey(hubPubkey)
      releasePubkey = new anchor.web3.PublicKey(releasePubkey)
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

      const [hubCollaborator] = await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from(anchor.utils.bytes.utf8.encode('nina-hub-collaborator')),
          hubPubkey.toBuffer(),
          provider.wallet.publicKey.toBuffer(),
        ],
        program.programId
      )

      const request = {
        accounts: {
          authority: provider.wallet.publicKey,
          hub: hubPubkey,
          hubRelease,
          hubContent,
          hubCollaborator,
          release: releasePubkey,
          systemProgram: anchor.web3.SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        },
      }
      if (fromHub) {
        request.remainingAccounts = [
          {
            pubkey: new anchor.web3.PublicKey(fromHub),
            isWritable: false,
            isSigner: false,
          },
        ]
      }

      const txid = await program.rpc.hubAddRelease(hub.handle, request)
      await getConfirmTransaction(txid, provider.connection)
      await NinaSdk.Hub.fetchHubRelease(
        hubPubkey.toBase58(),
        hubRelease.toBase58()
      )
      await getHubsForRelease(releasePubkey.toBase58())
      queue = new Set(addToHubQueue)
      queue.delete(releasePubkey.toBase58())
      setAddToHubQueue(queue)
      logEvent('hub_add_release_initiated', 'engagement', {
        release: releasePubkey.toBase58(),
        hub: hubPubkey.toBase58(),
        wallet: provider.wallet.publicKey.toBase58(),
      })

      return {
        success: true,
        msg: 'Release Added to Hub',
      }
    } catch (error) {
      const queue = new Set(addToHubQueue)
      addToHubQueue.delete(releasePubkey.toBase58())
      setAddToHubQueue(queue)
      logEvent('hub_add_release_initiated', 'engagement', {
        release: releasePubkey.toBase58(),
        hub: hubPubkey.toBase58(),
        wallet: provider.wallet.publicKey.toBase58(),
        solBalance,
      })
      return ninaErrorHandler(error)
    }
  }

  const hubRemoveCollaborator = async (hubPubkey, collaboratorPubkey) => {
    try {
      const hub = hubState[hubPubkey]
      const program = await ninaClient.useProgram()
      hubPubkey = new anchor.web3.PublicKey(hubPubkey)
      collaboratorPubkey = new anchor.web3.PublicKey(collaboratorPubkey)
      const [hubCollaborator] = await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from(anchor.utils.bytes.utf8.encode('nina-hub-collaborator')),
          hubPubkey.toBuffer(),
          collaboratorPubkey.toBuffer(),
        ],
        program.programId
      )

      const txid = await program.rpc.hubRemoveCollaborator(hub.handle, {
        accounts: {
          authority: provider.wallet.publicKey,
          hub: hubPubkey,
          hubCollaborator,
          collaborator: collaboratorPubkey,
          systemProgram: anchor.web3.SystemProgram.programId,
        },
      })
      await getConfirmTransaction(txid, provider.connection)
      await axios.get(
        endpoints.api +
          `/hubs/${hubPubkey}/collaborators/${hubCollaborator.toBase58()}`
      )
      await getHub(hubPubkey)

      const hubCollaboratorsStateCopy = { ...hubCollaboratorsState }
      delete hubCollaboratorsStateCopy[hubCollaborator]
      setHubCollaboratorsState(hubCollaboratorsStateCopy)

      return {
        success: true,
        msg: 'Collaborator Removed From Hub',
      }
    } catch (error) {
      return ninaErrorHandler(error)
    }
  }

  const hubContentToggleVisibility = async (
    hubPubkey,
    contentAccountPubkey,
    type
  ) => {
    try {
      const hub = hubState[hubPubkey]
      const program = await ninaClient.useProgram()
      hubPubkey = new anchor.web3.PublicKey(hubPubkey)
      contentAccountPubkey = new anchor.web3.PublicKey(contentAccountPubkey)

      const [hubContent] = await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from(anchor.utils.bytes.utf8.encode('nina-hub-content')),
          hubPubkey.toBuffer(),
          contentAccountPubkey.toBuffer(),
        ],
        program.programId
      )
      const [hubChildPublicKey] =
        await anchor.web3.PublicKey.findProgramAddress(
          [
            Buffer.from(
              anchor.utils.bytes.utf8.encode(`nina-hub-${type.toLowerCase()}`)
            ),
            hubPubkey.toBuffer(),
            contentAccountPubkey.toBuffer(),
          ],
          program.programId
        )

      const txid = await program.rpc.hubContentToggleVisibility(hub.handle, {
        accounts: {
          authority: provider.wallet.publicKey,
          hub: hubPubkey,
          hubContent,
          contentAccount: contentAccountPubkey,
          systemProgram: anchor.web3.SystemProgram.programId,
        },
      })
      await provider.connection.getParsedTransaction(txid, 'finalized')
      const toggledContent = Object.values(hubContentState).filter(
        (c) => c.publicKey === hubChildPublicKey.toBase58()
      )[0]
      toggledContent.visible = !toggledContent.visible
      const hubContentStateCopy = { ...hubContentState }

      hubContentState[toggledContent.publicKey] = toggledContent
      setHubContentState(hubContentStateCopy)
      return {
        success: true,
        msg: `${type} has been ${
          toggledContent.visible ? 'unarchived' : 'archived'
        }`,
      }
    } catch (error) {
      return ninaErrorHandler(error)
    }
  }

  const hubWithdraw = async (hubPubkey) => {
    try {
      const hub = hubState[hubPubkey]
      const program = await ninaClient.useProgram()
      hubPubkey = new anchor.web3.PublicKey(hubPubkey)
      const USDC_MINT = new anchor.web3.PublicKey(ids.mints.usdc)

      const [hubSigner] = await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from(anchor.utils.bytes.utf8.encode('nina-hub-signer')),
          hubPubkey.toBuffer(),
        ],
        program.programId
      )
      let [withdrawTarget] = await findOrCreateAssociatedTokenAccount(
        provider.connection,
        provider.wallet.publicKey,
        hubSigner,
        anchor.web3.SystemProgram.programId,
        anchor.web3.SYSVAR_RENT_PUBKEY,
        USDC_MINT
      )

      let [withdrawDestination] = await findOrCreateAssociatedTokenAccount(
        provider.connection,
        provider.wallet.publicKey,
        provider.wallet.publicKey,
        anchor.web3.SystemProgram.programId,
        anchor.web3.SYSVAR_RENT_PUBKEY,
        USDC_MINT
      )

      let tokenAccounts =
        await provider.connection.getParsedTokenAccountsByOwner(hubSigner, {
          mint: USDC_MINT,
        })

      const withdrawAmount =
        tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount

      const txid = await program.rpc.hubWithdraw(
        new anchor.BN(ninaClient.uiToNative(withdrawAmount, USDC_MINT)),
        hub.handle,
        {
          accounts: {
            authority: provider.wallet.publicKey,
            hub: hubPubkey,
            hubSigner,
            withdrawTarget,
            withdrawDestination,
            withdrawMint: USDC_MINT,
            tokenProgram: ids.programs.token,
          },
        }
      )
      await getConfirmTransaction(txid, provider.connection)

      await getHub(hubPubkey)
      return {
        success: true,
        msg: 'Withdraw from Hub Successful.',
      }
    } catch (error) {
      return ninaErrorHandler(error)
    }
  }

  const postInitViaHub = async (
    hubPubkey,
    slug,
    uri,
    referenceRelease = undefined,
    fromHub
  ) => {
    try {
      hubPubkey = new anchor.web3.PublicKey(hubPubkey)
      const program = await ninaClient.useProgram()
      const hub = await program.account.hub.fetch(hubPubkey)
      if (referenceRelease) {
        referenceRelease = new anchor.web3.PublicKey(referenceRelease)
      }
      const slugHash = MD5(slug).toString().slice(0, 32)
      const [post] = await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from(anchor.utils.bytes.utf8.encode('nina-post')),
          hubPubkey.toBuffer(),
          Buffer.from(anchor.utils.bytes.utf8.encode(slugHash)),
        ],
        program.programId
      )
      const [hubPost] = await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from(anchor.utils.bytes.utf8.encode('nina-hub-post')),
          hubPubkey.toBuffer(),
          post.toBuffer(),
        ],
        program.programId
      )
      const [hubContent] = await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from(anchor.utils.bytes.utf8.encode('nina-hub-content')),
          hubPubkey.toBuffer(),
          post.toBuffer(),
        ],
        program.programId
      )
      const [hubCollaborator] = await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from(anchor.utils.bytes.utf8.encode('nina-hub-collaborator')),
          hubPubkey.toBuffer(),
          provider.wallet.publicKey.toBuffer(),
        ],
        program.programId
      )
      let txid
      const handle = decodeNonEncryptedByteArray(hub.handle)
      const params = [handle, slugHash, uri]
      const request = {
        accounts: {
          author: provider.wallet.publicKey,
          hub: hubPubkey,
          post,
          hubPost,
          hubContent,
          hubCollaborator,
          systemProgram: anchor.web3.SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        },
      }
      if (fromHub) {
        request.remainingAccounts = [
          {
            pubkey: new anchor.web3.PublicKey(fromHub),
            isWritable: false,
            isSigner: false,
          },
        ]
      }
      let referenceReleaseHubRelease
      if (referenceRelease) {
        request.accounts.referenceRelease = referenceRelease
        let [_referenceReleaseHubRelease] =
          await anchor.web3.PublicKey.findProgramAddress(
            [
              Buffer.from(anchor.utils.bytes.utf8.encode('nina-hub-release')),
              hubPubkey.toBuffer(),
              referenceRelease.toBuffer(),
            ],
            program.programId
          )
        request.accounts.referenceReleaseHubRelease =
          _referenceReleaseHubRelease
        referenceReleaseHubRelease = _referenceReleaseHubRelease

        const [referenceReleaseHubContent] =
          await anchor.web3.PublicKey.findProgramAddress(
            [
              Buffer.from(anchor.utils.bytes.utf8.encode('nina-hub-content')),
              hubPubkey.toBuffer(),
              referenceRelease.toBuffer(),
            ],
            program.programId
          )
        request.accounts.referenceReleaseHubContent = referenceReleaseHubContent
        txid = await program.rpc.postInitViaHubWithReferenceRelease(
          ...params,
          request
        )
      } else {
        txid = await program.rpc.postInitViaHub(...params, request)
      }

      await getConfirmTransaction(txid, provider.connection)

      await NinaSdk.Hub.fetchHubPost(hubPubkey.toBase58(), hubPost.toBase58())
      if (referenceRelease) {
        await NinaSdk.Hub.fetchHubRelease(
          hubPubkey.toBase58(),
          referenceReleaseHubRelease.toBase58()
        )
        await getHubsForRelease(referenceRelease.toBase58())
      }
      await getHub(hubPubkey)

      return {
        success: true,
        msg: 'Post created.',
      }
    } catch (error) {
      return ninaErrorHandler(error)
    }
  }

  const postUpdateViaHubPost = async (hubPubkey, slug, uri) => {
    try {
      const program = await ninaClient.useProgram()
      const hub = await program.account.hub.fetch(hubPubkey)
      hubPubkey = new anchor.web3.PublicKey(hubPubkey)

      const [post] = await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from(anchor.utils.bytes.utf8.encode('nina-post')),
          hubPubkey.toBuffer(),
          Buffer.from(anchor.utils.bytes.utf8.encode(slug)),
        ],
        program.programId
      )

      const [hubPost] = await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from(anchor.utils.bytes.utf8.encode('nina-hub-post')),
          hubPubkey.toBuffer(),
          post.toBuffer(),
        ],
        program.programId
      )

      const [hubCollaborator] = await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from(anchor.utils.bytes.utf8.encode('nina-hub-collaborator')),
          hubPubkey.toBuffer(),
          provider.wallet.publicKey.toBuffer(),
        ],
        program.programId
      )

      const txid = await program.rpc.postUpdateViaHubPost(
        hub.handle,
        slug,
        uri,
        {
          accounts: {
            author: provider.wallet.publicKey,
            hub: hubPubkey,
            post,
            hubPost,
            hubCollaborator,
          },
        }
      )

      await getConfirmTransaction(txid, provider.connection)
      await getHub(hubPubkey)

      return {
        success: true,
        msg: 'Post updated.',
      }
    } catch (error) {
      return ninaErrorHandler(error)
    }
  }

  const collectRoyaltyForReleaseViaHub = async (releasePubkey, hubPubkey) => {
    try {
      const program = await ninaClient.useProgram()
      releasePubkey = new anchor.web3.PublicKey(releasePubkey)
      hubPubkey = new anchor.web3.PublicKey(hubPubkey)

      let release = await program.account.release.fetch(releasePubkey)
      let hub = await program.account.hub.fetch(hubPubkey)
      const recipient = release.royaltyRecipients.find(
        (recipient) =>
          recipient.recipientAuthority.toBase58() === hub.hubSigner.toBase58()
      )

      const [hubWallet] = await findOrCreateAssociatedTokenAccount(
        provider.connection,
        provider.wallet.publicKey,
        new anchor.web3.PublicKey(hub.hubSigner),
        anchor.web3.SystemProgram.programId,
        anchor.web3.SYSVAR_RENT_PUBKEY,
        release.paymentMint
      )
      const [hubRelease] = await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from(anchor.utils.bytes.utf8.encode('nina-hub-release')),
          hubPubkey.toBuffer(),
          releasePubkey.toBuffer(),
        ],
        program.programId
      )

      const request = {
        accounts: {
          authority: provider.wallet.publicKey,
          royaltyTokenAccount: release.royaltyTokenAccount,
          release: releasePubkey,
          releaseSigner: release.releaseSigner,
          releaseMint: release.releaseMint,
          hub: hubPubkey,
          hubRelease,
          hubSigner: hub.hubSigner,
          hubWallet,
          tokenProgram: ids.programs.token,
        },
      }

      const txid = await program.rpc.releaseRevenueShareCollectViaHub(
        decodeNonEncryptedByteArray(hub.handle),
        request
      )
      await getConfirmTransaction(txid, provider.connection)

      getRelease(releasePubkey.toBase58())
      getHub(hubPubkey.toBase58())
      return {
        success: true,
        msg: `You collected $${ninaClient.nativeToUi(
          recipient.owed.toNumber(),
          release.paymentMint
        )} to the hub`,
      }
    } catch (error) {
      getRelease(releasePubkey.toBase58())
      return ninaErrorHandler(error)
    }
  }

  const getHubs = async (featured = false) => {
    try {
      const updatedAllHubs = [...allHubs]
      await initSdkIfNeeded()
      const { hubs } = await NinaSdk.Hub.fetchAll(
        { offset: allHubs.length, limit: 25 },
        true
      )
      const updatedHubState = { ...hubState }
      hubs.forEach((hub) => {
        updatedAllHubs.push(hub.publicKey)
        const hubData = hub.accountData.hub
        delete hub.accountData
        updatedHubState[hub.publicKey] = {
          ...hub,
          ...hubData,
        }
      })
      if (featured) {
        setFeaturedHubs(updatedAllHubs.splice(0, 10))
      } else {
        setAllHubs(updatedAllHubs)
      }
      setHubState(updatedHubState)
    } catch (error) {
      console.warn(error)
    }
  }

  const getHub = async (hubPubkey) => {
    try {
      await initSdkIfNeeded()
      const hub = await NinaSdk.Hub.fetch(hubPubkey, true)

      const updatedHubState = { ...hubState }
      const hubData = hub.hub.accountData
      updatedHubState[hubPubkey] = {
        ...hub.hub,
        ...hubData,
      }
      setHubState(updatedHubState)

      const updatedHubCollaboratorState = { ...hubCollaboratorsState }
      const updatedVerificationState = { ...verificationState }
      hub.collaborators.forEach((collaborator) => {
        updatedVerificationState[collaborator.publicKey] =
          collaborator.verifications
        updatedHubCollaboratorState[
          collaborator.accountData.collaborator.publicKey
        ] = {
          ...collaborator.accountData.collaborator,
        }
      })

      setHubCollaboratorsState((prevState) => ({
        ...prevState,
        ...updatedHubCollaboratorState,
      }))
      setVerificationState((prevState) => ({
        ...prevState,
        ...updatedVerificationState,
      }))

      const updatedHubContent = { ...hubContentState }
      const updatedReleaseState = { ...releaseState }
      hub.releases.forEach((release) => {
        updatedHubContent[release.accountData.hubRelease.publicKey] = {
          ...release.accountData.hubContent,
          ...release.accountData.hubRelease,
          hubReleaseId: release.accountData.hubRelease.publicKey,
        }
        updatedReleaseState.tokenData[release.publicKey] = {
          ...release.accountData.release,
        }
        updatedReleaseState.metadata[release.publicKey] = {
          ...release.metadata,
          publishedThroughHub: release.publishedThroughHub || undefined,
        }
        updatedReleaseState.releaseMintMap[release.publicKey] = release.mint
      })
      setReleaseState(updatedReleaseState)

      const updatedPostState = { ...postState }
      hub.posts.forEach((post) => {
        updatedHubContent[post.accountData.hubPost.publicKey] = {
          ...post.accountData.hubContent,
          ...post.accountData.hubPost,
          hubPostId: post.accountData.hubPost.publicKey,
        }
        delete post.accountData
        updatedPostState[post.publicKey] = {
          publicKey: post.publicKey,
          ...post,
        }
      })
      setPostState(updatedPostState)
      setHubContentState(updatedHubContent)
      setHubContentFetched(new Set([...hubContentFetched, hubPubkey]))
      return hub
    } catch (error) {
      console.warn(error)
    }
  }

  const getHubsForUser = async (publicKey) => {
    try {
      await initSdkIfNeeded()
      const { hubs } = await NinaSdk.Account.fetchHubs(publicKey, true)
      const updatedHubCollaboratorState = {}
      const updatedHubState = { ...hubState }
      hubs.forEach((hub) => {
        updatedHubCollaboratorState[hub.accountData.collaborator.publicKey] =
          hub.accountData.collaborator

        const hubAccountData = hub.accountData.hub
        delete hub.accountData
        updatedHubState[hub.publicKey] = {
          ...hub,
          ...hubAccountData,
        }
      })
      setHubState((prevState) => ({ ...prevState, ...updatedHubState }))
      setHubCollaboratorsState((prevState) => ({
        ...prevState,
        ...updatedHubCollaboratorState,
      }))
      setFetchedHubsForUser(new Set([...fetchedHubsForUser, publicKey]))
      return hubs
    } catch (error) {
      console.warn(error)
      return []
    }
  }

  const getHubsForRelease = async (releasePubkey) => {
    try {
      await initSdkIfNeeded()
      const { hubs } = await NinaSdk.Release.fetchHubs(releasePubkey, true)
      const updatedHubState = {}
      const updatedHubContent = { ...hubContentState }
      hubs.forEach((hub) => {
        const accountData = { ...hub.accountData }
        delete hub.accountData
        delete hub.hubReleasePublicKey
        updatedHubState[hub.publicKey] = {
          ...hub,
          ...accountData.hub,
        }

        updatedHubContent[accountData.hubRelease.publicKey] = {
          ...accountData.hubContent,
          ...accountData.hubRelease,
          hubReleaseId: accountData.hubRelease.publicKey,
        }
      })
      setHubState((prevState) => ({ ...prevState, ...updatedHubState }))
      setHubContentState(updatedHubContent)
      return hubs
    } catch (error) {
      console.warn(error)
      return []
    }
  }

  /*

  STATE

  */

  const filterHubContentForHub = (hubPubkey) => {
    const hubReleases = []
    const hubPosts = []
    Object.values(hubContentState).forEach((hubContent) => {
      if (hubContent.hub === hubPubkey) {
        if (hubContent.contentType === 'ninaReleaseV1') {
          hubReleases.push(hubContent)
        } else if (hubContent.contentType === 'post') {
          hubPosts.push(hubContent)
        }
      }
    })
    return [hubReleases, hubPosts]
  }

  const filterHubCollaboratorsForHub = (hubPubkey) => {
    const hubCollaborators = []
    Object.values(hubCollaboratorsState).forEach((hubCollaborator) => {
      if (hubCollaborator.hub === hubPubkey) {
        hubCollaborators.push(hubCollaborator)
      }
    })

    return hubCollaborators.sort((a, b) => b.datetime - a.datetime)
  }

  const filterFeaturedHubs = () => {
    const featured = []
    featuredHubs?.forEach((hubId) => {
      const hub = hubState[hubId]
      if (hub) {
        featured.push(hub)
      }
    })
    return shuffle(featured)
  }

  const filterHubsForUser = (publicKey) => {
    const hubs = []
    Object.values(hubCollaboratorsState).forEach((hubCollaborator) => {
      if (hubCollaborator.collaborator === publicKey) {
        hubs.push({
          ...hubState[hubCollaborator.hub],
        })
      }
    })
    return hubs
  }

  const filterHubsForRelease = (releasePubkey) => {
    const hubIds = []
    Object.values(hubContentState).forEach((hubContent) => {
      if (hubContent.release === releasePubkey) {
        hubIds.push(hubContent.hub)
      }
    })
    return hubIds.map((hubId) => hubState[hubId])
  }

  const getHubPubkeyForHubHandle = async (handle) => {
    try {
      if (handle) {
        let hub = Object.values(hubState).filter(
          (hub) => hub.handle === handle
        )[0]
        if (!hub) {
          await initSdkIfNeeded()
          hub = await NinaSdk.Hub.fetch(handle)
        }
        return hub?.publicKey
      }
      return undefined
    } catch (error) {
      console.warn(error)
      return undefined
    }
  }

  const getHubFeePending = async (hubPubkey) => {
    if (typeof hubPubkey === 'string') {
      hubPubkey = new anchor.web3.PublicKey(hubPubkey)
    }
    const program = await ninaClient.useProgram()
    const hub = await program.account.hub.fetch(hubPubkey)
    let hubTokenAccount = await findAssociatedTokenAddress(
      hub.hubSigner,
      new anchor.web3.PublicKey(ids.mints.usdc)
    )
    const hubFeePendingAmount =
      await provider.connection.getTokenAccountBalance(hubTokenAccount)
    return hubFeePendingAmount.value.uiAmount
  }

  const filterHubsAll = () => {
    const allHubsArray = []
    allHubs.forEach((hubPubkey) => {
      const hub = hubState[hubPubkey]
      if (hub) {
        allHubsArray.push(hub)
      }
    })
    allHubsArray.sort((a, b) => a.datetime > b.datetime)
    return allHubsArray
  }

  const validateHubHandle = async (handle) => {
    try {
      await initSdkIfNeeded()
      const hub = await NinaSdk.Hub.fetch(handle)
      if (hub) {
        alert(
          `A hub with the handle ${handle} all ready exists, please choose a different handle.`
        )
        return false
      }
      return true
    } catch (error) {
      console.warn(error)
      return true
    }
  }

  return {
    getHubs,
    getHub,
    getHubsForUser,
    getHubsForRelease,
    filterHubsForRelease,
    hubInitWithCredit,
    hubUpdateConfig,
    hubAddCollaborator,
    hubUpdateCollaboratorPermission,
    hubAddRelease,
    hubRemoveCollaborator,
    hubContentToggleVisibility,
    hubWithdraw,
    postInitViaHub,
    postUpdateViaHubPost,
    filterHubCollaboratorsForHub,
    filterHubContentForHub,
    filterHubsForUser,
    filterHubsAll,
    collectRoyaltyForReleaseViaHub,
    getHubPubkeyForHubHandle,
    validateHubHandle,
    filterFeaturedHubs,
    getHubFeePending,
  }
}

export default {
  Context: HubContext,
  Provider: HubContextProvider,
}
